import {createHmac,timingSafeEqual} from 'node:crypto';
import {db} from './db';

export function verifyYCloudSignature(raw:Buffer,header:string,secret:string,now=Date.now()) {
 if(!secret)return false;
 const fields=header.split(',').map(value=>value.trim().split('='));
 const timestamps=fields.filter(([key])=>key==='t').map(([,value])=>value);
 if(timestamps.length!==1||!/^\d{1,12}$/.test(timestamps[0]))return false;
 const timestamp=timestamps[0];
 if(Math.abs(Math.floor(now/1000)-Number(timestamp))>300)return false;
 const expected=createHmac('sha256',secret).update(timestamp+'.').update(raw).digest();
 return fields.some(([key,value])=>key==='s'&&/^[a-fA-F0-9]{64}$/.test(value||'')&&timingSafeEqual(expected,Buffer.from(value,'hex')));
}

// Commit only delivery metadata. Incoming chats and full provider payloads are never stored.
export function applyYCloudStatus(payload:unknown) {
 if(!payload||typeof payload!=='object')return;
 const event=payload as Record<string,unknown>;
 if(event.type!=='whatsapp.message.updated'||!event.whatsappMessage||typeof event.whatsappMessage!=='object')return;
 const update=event.whatsappMessage as Record<string,unknown>;
 if(!process.env.YCLOUD_WHATSAPP_FROM||update.from!==process.env.YCLOUD_WHATSAPP_FROM||update.wabaId!==process.env.YCLOUD_WABA_ID)return;
 if(typeof update.id!=='string'||typeof update.status!=='string'||!['sent','delivered','read','failed'].includes(update.status))return;
 const connection=db();
 connection.transaction(()=>{
  const row=connection.prepare('SELECT id,status FROM booking_notifications WHERE provider_id=?').get(update.id) as {id:string;status:string}|undefined;
  if(!row)return;
  const rank:Record<string,number>={accepted:0,sent:1,delivered:2,read:3};
  const status=update.status as string;
  if(status==='failed'&&['delivered','read'].includes(row.status))return;
  if(status!=='failed'&&(rank[status]??0)<(rank[row.status]??0))return;
  connection.prepare('UPDATE booking_notifications SET status=?,error_code=?,updated_at=? WHERE id=?').run(status,status==='failed'?'YCLOUD_DELIVERY_FAILED':null,Date.now(),row.id);
 }).immediate();
}
