'use client';
import {useEffect,useState} from 'react';
import {api} from '@/lib/client';
type Summary={available:Record<string,boolean>;counts:{status:string;count:number}[];recent:{id:string;kind:string;status:string;error_code:string|null}[]};
export function NotificationStatus() {
 const [state,setState]=useState<Summary|null>(null);
 const [error,setError]=useState(''),[loading,setLoading]=useState(false);
 async function refresh() {
  setLoading(true);setError('');
  try{setState(await api<Summary>('/api/admin/notifications'))}
  catch(e){setError(e instanceof Error&&e.message==='AUTH_REQUIRED'?'Sesija ir beigusies. Pieslēdzies administrācijai vēlreiz.':'Neizdevās ielādēt ziņu piegādes statusu. Mēģini vēlreiz.')}
  finally{setLoading(false)}
 }
 useEffect(()=>{void refresh()},[]);
 const labels:Record<string,string>={queued:'Gaida nosūtīšanu',sending:'Nosūta',accepted:'Pakalpojums pieņēmis',sent:'Nosūtīts',delivered:'Piegādāts',read:'Izlasīts',failed:'Neizdevās',unknown:'Piegāde jāpārbauda',cancelled:'Atcelts'};
 return <section className="admin-panel"><h2>Automātiskais pieraksts un WhatsApp</h2>
  <p>Jauni pieraksti apstiprinās automātiski. Iepriekšējie neapstiprinātie pieteikumi saglabā savu statusu.</p>
  {error&&<p className="form-error" role="alert">{error}</p>}
  <button type="button" className="button button-outline button-small" disabled={loading} onClick={()=>void refresh()}>{loading?'Ielādē…':'Atjaunināt piegādes statusu'}</button>
  {!state?!error&&<p>Ielādē ziņu piegādes statusu...</p>:<>
   <p>{Object.values(state.available).some(Boolean)?'WhatsApp pieslēgums konfigurēts. Piegādi pārbaudi zemāk.':'WhatsApp vēl nav pieslēgts. Klientiem ziņu izvēle netiek rādīta un ziņas netiek solītas.'}</p>
   <p>{Object.entries(state.available).map(([lang,ready])=>`${lang.toUpperCase()}: ${ready?'konfigurēts':'nav pieslēgts'}`).join(' · ')}</p>
   <p>Ziņas saņem tikai klienti, kas to atzīmējuši pierakstā. Atgādinājums paredzēts 24 stundas pirms vizītes; vēlākam pierakstam sūta tikai apstiprinājumu.</p>
   {state.counts.length>0&&<ul>{state.counts.map(row=><li key={row.status}>{labels[row.status]||row.status}: {row.count}</li>)}</ul>}
   {state.recent.length>0&&<details><summary>Pēdējo ziņu statuss</summary><ul>{state.recent.map(row=><li key={row.id}>{row.kind==='reminder'?'Atgādinājums':'Apstiprinājums'}: {labels[row.status]||row.status}{row.error_code?` (${row.error_code})`:''}</li>)}</ul></details>}
  </>}
  <p><a href="https://www.ycloud.com/console/#/app/dashboard/template" target="_blank" rel="noopener noreferrer">Atvērt YCloud veidnes</a></p>
  <p><a href="https://business.facebook.com/latest/whatsapp_manager" target="_blank" rel="noopener noreferrer">Atvērt Meta WhatsApp Manager</a></p>
 </section>;
}
