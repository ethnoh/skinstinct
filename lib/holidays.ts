// Recurring Latvian public holidays: https://likumi.lv/ta/id/72608
// Additional one-off public holidays can be added here when officially announced.
export function latvianHolidayDates(year:number) {
 const dates=new Set(['01-01','05-01','05-04','06-23','06-24','11-18','12-24','12-25','12-26','12-31'].map(day=>`${year}-${day}`));
 const key=(date:Date)=>date.toISOString().slice(0,10);
 const add=(date:Date,days:number)=>new Date(date.getTime()+days*86400000);
 const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3);
 const h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
 const month=Math.floor((h+l-7*m+114)/31),day=(h+l-7*m+114)%31+1;
 const easter=new Date(Date.UTC(year,month-1,day,12));
 for(const offset of [-2,0,1,49])dates.add(key(add(easter,offset)));
 const mayFirst=new Date(Date.UTC(year,4,1,12));
 const mothersDay=1+(7-mayFirst.getUTCDay())%7+7;
 dates.add(`${year}-05-${String(mothersDay).padStart(2,'0')}`);
 for(const holiday of ['05-04','11-18']){
  const date=new Date(`${year}-${holiday}T12:00:00Z`),weekday=date.getUTCDay();
  if(weekday===0||weekday===6)dates.add(key(add(date,weekday===6?2:1)));
 }
 return dates;
}
export const isPublicHoliday=(date:string)=>latvianHolidayDates(Number(date.slice(0,4))).has(date);
