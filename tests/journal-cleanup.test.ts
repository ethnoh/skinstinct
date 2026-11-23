import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import {journalArticles} from '../lib/journal-content';
import {cleanJournalBody} from '../lib/journal-cleanup';

test('journal cleanup removes the old saved production note while preserving content and links',async()=>{
 const note='Raksts veidots, izvēršot manā Instagram iepazīšanās ierakstā aprakstītās vērtības. Attēls ir no SKINSTINCT fotosesijas; tas ilustrē studijas darbu, nevis sola konkrētu procedūras rezultātu.';
 const keep='## Mans teksts\nIndividuāla kopšana.\n\n[Instagram ieraksts](https://www.instagram.com/p/DeGuHoeDNfY/)';
 assert.equal(cleanJournalBody(keep+'\n\n'+note),keep);
 const directory=mkdtempSync(path.join(tmpdir(),'skinstinct-journal-cleanup-'));
 process.env.DATA_DIR=directory;
 const connection=new Database(path.join(directory,'skinstinct.db'));
 connection.exec('CREATE TABLE content (key TEXT PRIMARY KEY,value TEXT NOT NULL)');
 const article={...journalArticles[1],body:{...journalArticles[1].body,lv:keep+'\n\n'+note},published:false,image:'/api/media/owner.webp'};
 connection.prepare('INSERT INTO content VALUES (?,?)').run('articles',JSON.stringify([article]));
 connection.close();
 const {db,getArticles}=await import('../lib/db');
 try{
  const saved=getArticles().find(a=>a.id===article.id)!;
  assert.equal(saved.body.lv,keep);
  assert.equal(saved.published,false);
  assert.equal(saved.image,article.image);
  const stored=db().prepare("SELECT value FROM content WHERE key='articles'").get() as {value:string};
  assert.ok(!stored.value.includes(note));
  for(const a of journalArticles)for(const body of Object.values(a.body))assert.doesNotMatch(body,/photoshoot|fotosesij|фотосесси/);
 }finally{db().close()}
});
