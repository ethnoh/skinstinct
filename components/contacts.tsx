import Link from 'next/link';
import {ArrowUpRight, MapPin, Phone, Mail, Instagram, Facebook} from 'lucide-react';
import {basePath} from '@/lib/client';
import {studioMapsUrl} from '@/lib/studio-details';
import type {Lang,SiteSettings} from '@/lib/types';
import {StudioHours} from './studio-hours';
import {PhoneText} from './phone-text';

export function Contacts({lang,settings:s}:{lang:Lang;settings:SiteSettings}) {
 const label=(lv:string,en:string,ru:string)=>({lv,en,ru})[lang];
 const address=[s.address,s.city].filter(Boolean).join(', ');
 const details=[
  [label('Uzņēmums','Company','Компания'),s.legalName],
  [label('Reģistrācijas numurs','Registration number','Регистрационный номер'),s.legalRegistration],
  [label('PVN maksātāja numurs','VAT number','Номер НДС'),s.vatNumber],
  [label('Juridiskā adrese','Registered address','Юридический адрес'),s.legalAddress],
  [label('Faktiskā adrese','Studio address','Фактический адрес'),address],
  [label('Banka','Bank','Банк'),s.bankName],
  ['SWIFT / BIC',s.bankSwift],
  ['IBAN',s.bankIban],
 ].filter((row):row is [string,string]=>Boolean(row[1]));
 return <main id="main-content" className="contacts-page container">
  <header className="contacts-intro">
   <span className="eyebrow">SKINSTINCT / {label('KONTAKTI','CONTACT','КОНТАКТЫ')}</span>
   <h1>{label('Satiekamies','See you','До встречи')}<br/><em>{label('Jēkabpilī.','in Jēkabpils.','в Екабпилсе.')}</em></h1>
   <p>{label('Vizītes pie Valērijas Razujevas pēc iepriekšēja pieraksta. Šeit atradīsi studijas adresi, darba laiku, saziņas iespējas un uzņēmuma rekvizītus.','Visits with Valērija Razujeva by appointment. Find the studio address, opening hours, contact information and company details here.','Приём у Валерии Разуевой по предварительной записи. Здесь Ты найдёшь адрес студии, время работы, контакты и реквизиты компании.')}</p>
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
    <p><PhoneText text={label('Par pieraksta maiņu vai atcelšanu nosūti man SMS vai piezvani pa tālruni {phone}. Ja neatrodi ērtu laiku, kopā mēģināsim piemeklēt Tev piemērotu vizīti.','To change or cancel an appointment, send me an SMS or call me on {phone}. If you cannot find a convenient time, we will try to find one that works for you.','Чтобы перенести или отменить запись, отправь мне SMS или позвони по телефону {phone}. Если удобного времени нет, вместе постараемся подобрать подходящий вариант.')} phone={s.phone}/></p>
    {s.email&&<a className="contact-email" href={`mailto:${s.email}`}><Mail size={18} aria-hidden/>{s.email}</a>}
    <div className="contact-socials">
     <a href={s.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={18} aria-hidden/>Instagram<ArrowUpRight size={15}/></a>
     {s.facebook&&<a href={s.facebook} target="_blank" rel="noopener noreferrer"><Facebook size={18} aria-hidden/>Facebook<ArrowUpRight size={15}/></a>}
    </div>
   </section>
   <section className="contact-card"><StudioHours lang={lang} settings={s}/></section>
   <section className="contact-card contact-company">
    <h2>{label('Uzņēmuma rekvizīti','Company details','Реквизиты компании')}</h2>
    <dl>{details.map(([title,value])=><div key={title}><dt>{title}</dt><dd>{value}</dd></div>)}</dl>
   </section>
  </div>
 </main>;
}
