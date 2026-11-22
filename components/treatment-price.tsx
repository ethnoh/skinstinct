import { priceForDate, isIntroductoryDate } from '@/lib/opening-offer';
import { servicePrice } from '@/lib/service-display';
import type { Lang, Service } from '@/lib/types';

export function TreatmentPrice({service, lang, date}: {service: Service; lang: Lang; date: string}) {
  const discounted = service.bookable !== false && service.price !== null && isIntroductoryDate(date);
  return <span className="treatment-price">
    {discounted && <del className="regular-treatment-price">{servicePrice(service, lang)}</del>}
    <span>{servicePrice(priceForDate(service, date), lang)}</span>
  </span>;
}
