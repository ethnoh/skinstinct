import type {Lang,SiteSettings} from '@/lib/types';

export function StudioHours({lang,settings}:{lang:Lang;settings:SiteSettings}) {
 const names={lv:['Svētdiena','Pirmdiena','Otrdiena','Trešdiena','Ceturtdiena','Piektdiena','Sestdiena'],en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],ru:['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота']}[lang];
 return <div className="studio-hours">
  <strong>{{lv:'Darba laiks',en:'Opening hours',ru:'Время работы'}[lang]}</strong>
  <dl>{[1,2,3,4,5,6,0].map(day=><div key={day}><dt>{names[day]}</dt><dd>{settings.schedule[day]?.enabled?`${settings.schedule[day].start}–${settings.schedule[day].end}`:{lv:'Slēgts',en:'Closed',ru:'Закрыто'}[lang]}</dd></div>)}</dl>
  <span>{{lv:'Vizītes pēc iepriekšēja pieraksta. Papildu pieņemšanas dienas redzamas kalendārā. Svētku dienās slēgts.',en:'Visits by appointment. Additional opening dates are shown in the calendar. Closed on public holidays.',ru:'Приём по предварительной записи. Дополнительные дни приёма указаны в календаре. В праздничные дни закрыто.'}[lang]}</span>
 </div>;
}
