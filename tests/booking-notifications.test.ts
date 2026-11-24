import {test,after,before} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import type {Booking} from '../lib/types';
process.env.DATA_DIR=mkdtempSync(path.join(tmpdir(),'sk-whatsapp-'));
let db:typeof import('../lib/db')['db'];
let {enqueueBookingNotifications,processBookingNotifications,whatsappPhone,notificationParameters,notificationAvailability,sendWhatsApp}={} as typeof import('../lib/booking-notifications');
before(async()=>{({db}=await import('../lib/db'));({enqueueBookingNotifications,processBookingNotifications,whatsappPhone,notificationParameters,notificationAvailability,sendWhatsApp}=await import('../lib/booking-notifications'))});
const now=Date.parse('2026-11-30T09:00:00Z');
function booking(overrides:Partial<Booking>={}) {
 const value:Booking={id:randomUUID(),customer_id:'test',service_id:'youth-facial',service_title:'Jauniešu procedūra',date:'2026-12-03',start_min:720,end_min:780,name:'Test Client',phone:'+37120000000',email:'',status:'confirmed',lang:'lv',created_at:new Date(now).toISOString(),quoted_price_min:50,quoted_price_max:50,whatsapp_opt_in:1,...overrides};
 db().prepare('INSERT INTO bookings(id,customer_id,code_hash,service_id,service_title,date,start_min,end_min,name,phone,email,status,lang,created_at,quoted_price_min,quoted_price_max,whatsapp_opt_in) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(value.id,value.customer_id,randomUUID(),value.service_id,value.service_title,value.date,value.start_min,value.end_min,value.name,value.phone,value.email,value.status,value.lang,value.created_at,value.quoted_price_min,value.quoted_price_max,value.whatsapp_opt_in);
 return value;
}
after(()=>db().close());
test('WhatsApp requires explicit opt-in, normalizes phone numbers and queues only one future reminder',()=>{
 assert.equal(whatsappPhone('26 054 744'),'+37126054744');assert.equal(whatsappPhone('00371 26054744'),'+37126054744');assert.equal(whatsappPhone('not a number'),null);
 assert.deepEqual(notificationAvailability(),{lv:false,en:false,ru:false});
 const declined=booking({whatsapp_opt_in:0});enqueueBookingNotifications(declined,now);
 assert.equal((db().prepare('SELECT COUNT(*) AS n FROM booking_notifications WHERE booking_id=?').get(declined.id) as {n:number}).n,0);
 const accepted=booking();enqueueBookingNotifications(accepted,now);enqueueBookingNotifications(accepted,now);
 const jobs=db().prepare('SELECT kind,due_at FROM booking_notifications WHERE booking_id=? ORDER BY kind').all(accepted.id) as {kind:string;due_at:number}[];
 assert.equal(jobs.length,2);assert.equal(jobs[1].due_at,Date.parse('2026-12-02T10:00:00Z'));
 const late=booking({date:'2026-11-30'});enqueueBookingNotifications(late,now);
 assert.equal((db().prepare('SELECT COUNT(*) AS n FROM booking_notifications WHERE booking_id=?').get(late.id) as {n:number}).n,1);
 const args=notificationParameters(accepted,'confirmation');assert.equal(args[2],'12:00');assert.equal(args[3],'Jauniešu procedūra');assert.match(args[4],/50/);assert.match(args[5],/Pļaviņu iela 51/);assert.equal(args[6],'+37126054744');assert.match(args[7],/1 dienu/);
 assert.match(notificationParameters(booking({quoted_price_min:null,quoted_price_max:null}),'confirmation')[4],/izvēlētās procedūras/);
});
test('worker claims jobs once, skips cancelled visits and recovers interrupted sends without duplicates',async()=>{
 db().prepare('DELETE FROM booking_notifications').run();const value=booking();enqueueBookingNotifications(value,now);
 let sends=0;const send=async()=>{sends++;return 'wamid.test-'+sends};
 await Promise.all([processBookingNotifications(now,send),processBookingNotifications(now,send)]);assert.equal(sends,1);
 await processBookingNotifications(now,send);assert.equal(sends,1);
 db().prepare("UPDATE bookings SET status='cancelled' WHERE id=?").run(value.id);
 await processBookingNotifications(Date.parse('2026-12-02T10:01:00Z'),send);assert.equal(sends,1);
 const interrupted=booking();enqueueBookingNotifications(interrupted,now);
 db().prepare("UPDATE booking_notifications SET status='sending',updated_at=? WHERE booking_id=? AND kind='confirmation'").run(now-180000,interrupted.id);
 await processBookingNotifications(now,send);assert.equal(sends,1);
 assert.equal((db().prepare("SELECT status FROM booking_notifications WHERE booking_id=? AND kind='confirmation'").get(interrupted.id) as {status:string}).status,'unknown');
});
test('provider payload uses approved templates and ambiguity never triggers automatic duplicate sending',async()=>{
 db().prepare('DELETE FROM booking_notifications').run();const savedFetch=globalThis.fetch;
 for(const [key,value] of Object.entries({WHATSAPP_ENABLED:'true',WHATSAPP_ACCESS_TOKEN:'test-token',WHATSAPP_PHONE_NUMBER_ID:'123456',WHATSAPP_APP_SECRET:'test-app-secret',WHATSAPP_VERIFY_TOKEN:'test-verify',WHATSAPP_CONFIRMATION_TEMPLATE_LV:'skinstinct_confirmation',WHATSAPP_REMINDER_TEMPLATE_LV:'skinstinct_reminder'}))process.env[key]=value;
 try {
  const value=booking();const captured:{template:{name:string;components:{parameters:unknown[]}[]}}[]=[];
  globalThis.fetch=async(_url,init)=>{captured.push(JSON.parse(String(init?.body)));return Response.json({messages:[{id:'wamid.payload-test'}]})};
  assert.equal(await sendWhatsApp(value,'confirmation'),'wamid.payload-test');
  assert.equal(captured[0].template.name,'skinstinct_confirmation');assert.equal(captured[0].template.components[0].parameters.length,8);
  enqueueBookingNotifications(value,now);let calls=0;globalThis.fetch=async()=>{calls++;throw Error('ambiguous network failure')};
  await processBookingNotifications(now);await processBookingNotifications(now+60000);assert.equal(calls,1);
  assert.equal((db().prepare("SELECT status FROM booking_notifications WHERE booking_id=? AND kind='confirmation'").get(value.id) as {status:string}).status,'unknown');
 }finally{globalThis.fetch=savedFetch;for(const key of Object.keys(process.env).filter(key=>key.startsWith('WHATSAPP_')))delete process.env[key]}
});
