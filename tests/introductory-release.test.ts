import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import {priceCatalogue} from '../lib/price-catalogue';
import {initialSettings} from '../lib/content';

test('introductory release adds one choice to an existing catalogue and preserves owner edits',async()=>{
 const directory=mkdtempSync(path.join(tmpdir(),'skinstinct-intro-'));
 process.env.DATA_DIR=directory;
 const connection=new Database(path.join(directory,'skinstinct.db'));
 connection.exec('CREATE TABLE content (key TEXT PRIMARY KEY,value TEXT NOT NULL)');
 const saved=priceCatalogue.map((s,i)=>i===0?{...s,price:65,active:false}:s);
 const insert=connection.prepare('INSERT INTO content VALUES (?,?)');
 insert.run('services',JSON.stringify(saved));
 insert.run('settings',JSON.stringify({...initialSettings,bookingEnabled:false}));
 insert.run('price-release-2026-11-23','true');
 connection.close();
 const {db,getServices,getSettings,setContent}=await import('../lib/db');
 try {
  const services=getServices();
  assert.equal(services.filter(s=>s.id==='introductory-treatment').length,1);
  assert.deepEqual(services.filter(s=>s.id!=='introductory-treatment'),saved);
  assert.equal(getSettings().bookingEnabled,false);
  assert.ok(db().prepare("SELECT 1 FROM content WHERE key='introductory-treatment-release-2026-11-23'").get());
  setContent('services',saved);
  assert.deepEqual(getServices(),saved,'later owner deletions remain authoritative');
 } finally {db().close()}
});
