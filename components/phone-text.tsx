import {studioPhone} from '@/lib/studio-details';
export function PhoneText({text,phone}:{text:string;phone?:string}){
 const actual=(phone||studioPhone).trim(),compact=actual.replace(/[\s-]/g,''),display=/^\+371\d{8}$/.test(compact)?'+371 '+compact.slice(4):actual;
 return <>{text.replaceAll('{phone}',display).split(/(\+371(?:[\s-]*\d){8})(?!\d)/g).map((part,index)=>/^\+371(?:[\s-]*\d){8}$/.test(part)?<a key={index} className="phone-inline-link" href={'tel:'+part.replace(/[\s-]/g,'')}>{part}</a>:part)}</>;
}
