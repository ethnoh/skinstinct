import {NextRequest,NextResponse} from 'next/server';
import {limitedBody} from '@/lib/security';
import {applyYCloudStatus,verifyYCloudSignature} from '@/lib/ycloud-webhook';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const response=(status:number)=>new NextResponse(null,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:NextRequest) {
 const secret=process.env.YCLOUD_WEBHOOK_SECRET;
 if(!secret)return response(503);
 let raw:Buffer;try{raw=await limitedBody(request,128000)}catch{return response(413)}
 if(!verifyYCloudSignature(raw,request.headers.get('ycloud-signature')||'',secret))return response(403);
 let payload:unknown;try{payload=JSON.parse(raw.toString('utf8'))}catch{return response(400)}
 if(!payload||typeof payload!=='object'||typeof (payload as Record<string,unknown>).id!=='string'||typeof (payload as Record<string,unknown>).type!=='string')return response(400);
 try{applyYCloudStatus(payload)}catch{return response(503)}
 return response(204);
}
