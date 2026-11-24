import type {Lang} from '@/lib/types';
export function OpeningOffer({lang}:{lang:Lang}){
 const copy={
  lv:{label:'PIERAKSTS ATVĒRTS',title:'Vizītes no 1. decembra',subtitle:'10 € iepazīšanās atlaide visu decembri',detail:'Visām pieejamajām procedūrām vizītēs 2026. gada 1.–31. decembrī. No janvāra spēkā pamatcenas.'},
  en:{label:'BOOKING IS OPEN',title:'Appointments from 1 December',subtitle:'€10 introductory discount throughout December',detail:'For all available treatments on visits from 1–31 December 2026. Standard prices apply from January.'},
  ru:{label:'ЗАПИСЬ ОТКРЫТА',title:'Приём с 1 декабря',subtitle:'Скидка 10 € на знакомство весь декабрь',detail:'На все доступные процедуры при посещении 1–31 декабря 2026 года. С января действуют базовые цены.'},
 }[lang];
 return <aside className="price-offer-notice" aria-label={copy.subtitle}><span className="opening-offer-amount" aria-hidden="true">−10 €</span><div><span className="opening-offer-label">{copy.label}</span><strong className="opening-offer-title">{copy.title}</strong><strong className="opening-offer-subtitle">{copy.subtitle}</strong><p>{copy.detail}</p></div></aside>;
}
