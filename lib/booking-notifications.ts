import {randomUUID} from 'node:crypto';
import {db,getSettings} from './db';
import {startDate,minuteTime} from './booking';
import {servicePrice} from './service-display';
import type {Booking,Lang} from './types';

type Kind='confirmation'|'reminder';
type Job={id:string;booking_id:string;kind:Kind;attempts:number};
export function whatsappPhone(value:string) {
 let digits=value.replace(/[^\d+]/g,'');
 if(/^\d{8}$/.test(digits))digits='+371'+digits;
 if(digits.startsWith('00'))digits='+'+digits.slice(2);
 return /^\+[1-9]\d{7,14}$/.test(digits)?digits:null;
}
export function whatsappConfig(lang:Lang) {
 const suffix=lang.toUpperCase();
 const confirmation=process.env[`WHATSAPP_CONFIRMATION_TEMPLATE_${suffix}`];
 const reminder=process.env[`WHATSAPP_REMINDER_TEMPLATE_${suffix}`];
 const ready=process.env.WHATSAPP_ENABLED==='true'&&Boolean(process.env.WHATSAPP_ACCESS_TOKEN&&process.env.WHATSAPP_PHONE_NUMBER_ID&&process.env.WHATSAPP_APP_SECRET&&process.env.WHATSAPP_VERIFY_TOKEN&&confirmation&&reminder);
 return {ready,confirmation,reminder,language:process.env[`WHATSAPP_LANGUAGE_${suffix}`]||{lv:'lv',en:'en',ru:'ru'}[lang]};
}
export function notificationAvailability() {return Object.fromEntries((['lv','en','ru'] as const).map(lang=>[lang,whatsappConfig(lang).ready])) as Record<Lang,boolean>}
export function enqueueBookingNotifications(booking:Booking,now=Date.now()) {
 if(!booking.whatsapp_opt_in)return;
 const starts=startDate(booking.date,booking.start_min).getTime();
 const insert=db().prepare('INSERT OR IGNORE INTO booking_notifications(id,booking_id,kind,due_at,updated_at) VALUES (?,?,?,?,?)');
 insert.run(randomUUID(),booking.id,'confirmation',now,now);
 // A late booking receives its confirmation, without a duplicate immediate reminder.
 if(starts-86400_000>now)insert.run(randomUUID(),booking.id,'reminder',starts-86400_000,now);
}
export function notificationParameters(booking:Booking,kind:Kind) {
 const settings=getSettings(),lang=booking.lang;
 const starts=startDate(booking.date,booking.start_min).getTime();
 const notice=kind==='confirmation'&&starts-Date.parse(booking.created_at)>86400_000
  ?{lv:'Atgādinājumu saņemsi arī 1 dienu pirms vizītes.',en:'You will also receive a reminder 1 day before your visit.',ru:'За 1 день до визита Ты также получишь напоминание.'}[lang]
  :{lv:'Lai atceltu vai pārceltu vizīti, nosūti SMS vai piezvani uz norādīto tālruni.',en:'To cancel or reschedule, send an SMS or call the studio number.',ru:'Чтобы отменить или перенести визит, отправь SMS или позвони по указанному номеру.'}[lang];
 return [booking.name,new Intl.DateTimeFormat({lv:'lv-LV',en:'en-GB',ru:'ru-RU'}[lang],{timeZone:'Europe/Riga',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(starts)),minuteTime(booking.start_min),booking.service_title,servicePrice({price:booking.quoted_price_min??null,priceMax:booking.quoted_price_max},lang),[settings.address,settings.city].filter(Boolean).join(', '),settings.phone,notice];
}
class SendError extends Error {constructor(public code:string,public retry=false){super(code)}}
export async function sendWhatsApp(booking:Booking,kind:Kind) {
 const config=whatsappConfig(booking.lang),to=whatsappPhone(booking.phone);
 if(!config.ready||!to)throw new SendError('NOT_CONFIGURED_OR_INVALID_PHONE');
 const phoneId=process.env.WHATSAPP_PHONE_NUMBER_ID!;
 const version=process.env.WHATSAPP_GRAPH_VERSION||'v23.0';
 if(!/^\d+$/.test(phoneId)||!/^v\d+\.\d+$/.test(version))throw new SendError('INVALID_PROVIDER_CONFIGURATION');
 let response:Response;
 try {response=await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`,{method:'POST',headers:{Authorization:`Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to,type:'template',template:{name:kind==='confirmation'?config.confirmation:config.reminder,language:{code:config.language},components:[{type:'body',parameters:notificationParameters(booking,kind).map(text=>({type:'text',text:text.replace(/[\n\r\t]+/g,' ').slice(0,1000)}))}]}}),signal:AbortSignal.timeout(15000)})}
 catch {throw new SendError('DELIVERY_UNKNOWN')}
 const payload=await response.json().catch(()=>null);
 if(!response.ok)throw new SendError(`PROVIDER_${Number(payload?.error?.code)||response.status}`,response.status===429);
 const id=payload?.messages?.[0]?.id;
 if(typeof id!=='string')throw new SendError('DELIVERY_UNKNOWN');
 return id;
}
export async function processBookingNotifications(now=Date.now(),send=sendWhatsApp) {
 const connection=db();
 // A timeout/crash may have happened after provider acceptance. Never blindly send a duplicate.
 connection.prepare("UPDATE booking_notifications SET status='unknown',error_code='INTERRUPTED_DELIVERY',updated_at=? WHERE status='sending' AND updated_at<?").run(now,now-120000);
 for(let i=0;i<20;i++) {
  const job=connection.transaction(()=>{
   const row=connection.prepare("SELECT id,booking_id,kind,attempts FROM booking_notifications WHERE status='queued' AND due_at<=? ORDER BY due_at LIMIT 1").get(now) as Job|undefined;
   if(row)connection.prepare("UPDATE booking_notifications SET status='sending',attempts=attempts+1,updated_at=? WHERE id=?").run(now,row.id);
   return row;
  }).immediate();
  if(!job)break;
  const booking=connection.prepare('SELECT * FROM bookings WHERE id=?').get(job.booking_id) as Booking|undefined;
  if(!booking||booking.status!=='confirmed'||!booking.whatsapp_opt_in||startDate(booking.date,booking.start_min).getTime()<=now) {
   connection.prepare("UPDATE booking_notifications SET status='cancelled',updated_at=? WHERE id=?").run(now,job.id);continue;
  }
  try {
   const providerId=await send(booking,job.kind);
   connection.prepare("UPDATE booking_notifications SET status='accepted',provider_id=?,error_code=NULL,updated_at=? WHERE id=?").run(providerId,now,job.id);
  } catch(error) {
   const known=error instanceof SendError;
   const retry=known&&error.retry&&job.attempts<4;
   connection.prepare('UPDATE booking_notifications SET status=?,error_code=?,due_at=?,updated_at=? WHERE id=?').run(retry?'queued':!known||error.code==='DELIVERY_UNKNOWN'?'unknown':'failed',known?error.code:'DELIVERY_UNKNOWN',now+Math.min(3600000,60000*2**job.attempts),now,job.id);
  }
 }
}
export function notificationSummary() {
 return {available:notificationAvailability(),counts:db().prepare('SELECT status,COUNT(*) AS count FROM booking_notifications GROUP BY status').all(),recent:db().prepare('SELECT id,booking_id,kind,status,error_code,updated_at FROM booking_notifications ORDER BY updated_at DESC LIMIT 20').all()};
}
