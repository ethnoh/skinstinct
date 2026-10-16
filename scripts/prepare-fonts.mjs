import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const directory=path.join(process.cwd(),'public','fonts');
mkdirSync(directory,{recursive:true});
function download(url){const result=spawnSync(process.platform==='win32'?'curl.exe':'curl',[...(process.platform==='win32'?['--ssl-no-revoke']:[]),'--fail','--location','--silent','--show-error',url],{maxBuffer:10_000_000});if(result.status!==0)throw new Error('Font download failed');return result.stdout;}
const url='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap';
let css=download(url).toString();
const urls=[...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]))];
for(let index=0;index<urls.length;index++){const fontUrl=urls[index];const filename=`font-${index+1}.${fontUrl.includes('.woff2')?'woff2':'ttf'}`;writeFileSync(path.join(directory,filename),download(fontUrl));css=css.replaceAll(fontUrl,`/fonts/${filename}`);}
writeFileSync(path.join(directory,'fonts.css'),css);
console.log(`Self-hosted ${urls.length} font files.`);
