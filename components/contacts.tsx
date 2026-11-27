import Link from 'next/link';
import {ArrowUpRight, MapPin, Phone, Mail, Instagram, Facebook} from 'lucide-react';
import {basePath} from '@/lib/client';
import {studioMapsUrl} from '@/lib/studio-details';
import type {Lang,SiteSettings} from '@/lib/types';
import {StudioHours} from './studio-hours';
import {PhoneText} from './phone-text';

export function Contacts({lang,settings:s}:{lang:Lang;settings:SiteSettings}) {
 const label=(lv:string,en:string,ru:string)=>({lv,en,ru})[lang];
 return <main id="main-content" className="contacts-page container">
  <header className="contacts-intro">
   <span className="eyebrow">SKINSTINCT / {label('KONTAKTI','CONTACT','КОНТАКТЫ')}</span>
   <h1>{label('Satiekamies','See you','До встречи')}<br/><em>{label('Jēkabpilī.','in Jēkabpils.','в Екабпилсе.')}</em></h1>
   <p>{label('Vizītes pie Valērijas Razujevas pēc iepriekšēja pieraksta. Šeit atradīsi studijas adresi, darba laiku un saziņas iespējas.','Visits with Valērija Razujeva by appointment. Find the studio address, opening hours and contact information here.','Приём у Валерии Разуевой по предварительной записи. Здесь Ты найдёшь адрес студии, время работы и контакты.')}</p>
  </header>
  <div className="contacts-grid">
   <section className="contact-card contact-location">
    <MapPin size={26} aria-hidden/>
    <span className="eyebrow">{label('STUDIJAS ADRESE','VISIT THE STUDIO','АДРЕС СТУДИИ')}</span>
    <h2>{s.address}</h2><p>{s.city}, {label('Latvija','Latvia','Латвия')}</p>
    <a className="button" href={studioMapsUrl} target="_blank" rel="noopener noreferrer">{label('Atvērt Google Maps','Open Google Maps','Открыть Google Maps')}<ArrowUpRight size={18}/></a>
    <Link className="text-button" href={`${basePath(lang)}/#pieraksts`}>{label('Pieteikt vizīti','Book a visit','Записаться')}<ArrowUpRight size={17}/></Link>
   </section>
   <section className="contact-card">
    <h2>{label('Sazinies ar mani','Get in touch','Свяжись со мной')}</h2>
    <p className="contacts-phone"><Phone size={20} aria-hidden/><PhoneText text="{phone}" phone={s.phone}/></p>
    <p>{label('Ja pierakstījies mājaslapā, savu vizīti vari apskatīt un atcelt sadaļā ','If you booked through the website, you can view and cancel your appointment in ','Если запись оформлена через сайт, посмотреть и отменить визит можно в разделе ')}<Link className="phone-inline-link" href={`${basePath(lang)}/account`}>{label('«Mani pieraksti»','“My appointments”','«Мои записи»')}</Link>{label(` ne vēlāk kā ${s.cancellationHours} stundas pirms vizītes. Lai pārceltu vizīti, atcel esošo pierakstu un rezervē citu laiku. Ja mājaslapā neizdodas veikt izmaiņas vai neatrodi sev ērtu laiku, `,` no later than ${s.cancellationHours} hours before your visit. To reschedule, cancel your existing appointment and book a new time. If you cannot make the changes online or find a convenient time, `,` не позднее чем за ${s.cancellationHours} ч до визита. Чтобы перенести визит, отмени текущую запись и забронируй другое время. Если изменить запись на сайте не получается или удобного времени нет, `)}<PhoneText text={label('nosūti man SMS vai piezvani. Kopā mēģināsim piemeklēt Tev piemērotu vizītes laiku.','send me an SMS or call me. We will try to find an appointment time that works for you.','отправь мне SMS или позвони. Вместе постараемся подобрать подходящее для Тебя время.')} phone={s.phone}/></p>
    {s.email&&<a className="contact-email" href={`mailto:${s.email}`}><Mail size={18} aria-hidden/>{s.email}</a>}
    <div className="contact-socials">
     <a href={s.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={18} aria-hidden/>Instagram<ArrowUpRight size={15}/></a>
     {s.facebook&&<a href={s.facebook} target="_blank" rel="noopener noreferrer"><Facebook size={18} aria-hidden/>Facebook<ArrowUpRight size={15}/></a>}
    </div>
   </section>
   <section className="contact-card contact-hours"><StudioHours lang={lang} settings={s}/></section>
   <section className="contact-card contact-company">
    <h2>{label('Uzņēmuma rekvizīti','Company details','Реквизиты компании')}</h2>
    <dl className="company-details">
     {[
      [label('Uzņēmums','Company','Компания'),s.legalName],
      [label('Reģistrācijas Nr.','Registration no.','Регистрационный №'),s.legalRegistration],
      [label('PVN reģistrācijas Nr.','VAT registration no.','Регистрационный № НДС'),s.vatNumber],
      [label('Juridiskā adrese','Registered address','Юридический адрес'),[s.legalAddress,label('Latvija','Latvia','Латвия')].filter(Boolean).join(', ')],
      [label('Studijas adrese','Studio address','Адрес студии'),[s.address,s.city,'LV-5201',label('Latvija','Latvia','Латвия')].filter(Boolean).join(', ')],
     ].filter(([,value])=>Boolean(value)).map(([name,value])=><div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}
    </dl>
   </section>
  </div>
 </main>;
}
