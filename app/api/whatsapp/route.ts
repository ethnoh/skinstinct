import {createHmac,timingSafeEqual} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {limitedBody} from '@/lib/security';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const response=(status:number)=>new NextResponse(null,{status});
export async function GET(request:NextRequest) {
 const query=request.nextUrl.searchParams,token=process.env.WHATSAPP_VERIFY_TOKEN;
 if(!token||query.get('hub.mode')!=='subscribe'||query.get('hub.verify_token')!==token)return response(403);
 return new NextResponse(query.get('hub.challenge')||'',{headers:{'Content-Type':'text/plain','Cache-Control':'no-store'}});
}
export async function POST(request:NextRequest) {
 const secret=process.env.WHATSAPP_APP_SECRET;
 if(!secret)return response(503);
 let raw:Buffer;try{raw=await limitedBody(request,128000)}catch{return response(413)}
 const signature=request.headers.get('x-hub-signature-256')||'';
 if(!/^sha256=[a-f0-9]{64}$/.test(signature))return response(403);
 const expected=createHmac('sha256',secret).update(raw).digest();
 if(!timingSafeEqual(expected,Buffer.from(signature.slice(7),'hex')))return response(403);
 let payload;try{payload=JSON.parse(raw.toString('utf8'))}catch{return response(400)}
 if(payload.object!=='whatsapp_business_account')return response(200);
 for(const entry of payload.entry||[])for(const change of entry.changes||[]) {
  const value=change.value;
  if(value?.metadata?.phone_number_id!==process.env.WHATSAPP_PHONE_NUMBER_ID)continue;
  for(const update of value.statuses||[]) {
   if(typeof update.id!=='string'||!['sent','delivered','read','failed'].includes(update.status))continue;
   const row=db().prepare('SELECT id,status FROM booking_notifications WHERE provider_id=?').get(update.id) as {id:string;status:string}|undefined;
   if(!row)continue;
   const rank:Record<string,number>={accepted:0,sent:1,delivered:2,read:3};
   if(update.status==='failed'&&['delivered','read'].includes(row.status))continue;
   if(update.status!=='failed'&&(rank[update.status]??0)<(rank[row.status]??0))continue;
   const code=update.status==='failed'?`PROVIDER_${Number(update.errors?.[0]?.code)||'FAILED'}`:null;
   db().prepare('UPDATE booking_notifications SET status=?,error_code=?,updated_at=? WHERE id=?').run(update.status,code,Date.now(),row.id);
  }
 }
 return response(200);
}
