import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import {initialSettings} from '../lib/content';
import {localSearchDescription,previousSearchDescription,studioPhone} from '../lib/studio-details';

test('local-search update replaces old defaults and preserves owner contact and description edits',async()=>{
 const directory=mkdtempSync(path.join(tmpdir(),'skinstinct-local-search-'));
 process.env.DATA_DIR=directory;
 const connection=new Database(path.join(directory,'skinstinct.db'));
 connection.exec('CREATE TABLE content (key TEXT PRIMARY KEY,value TEXT NOT NULL)');
 const insert=connection.prepare('INSERT INTO content VALUES (?,?)');
 insert.run('settings',JSON.stringify({...initialSettings,phone:'',seoDescription:{...previousSearchDescription,lv:'Mans individuālais apraksts'}}));
 connection.close();
 const {db,getSettings,setContent}=await import('../lib/db');
 try{
  const settings=getSettings();
  assert.equal(settings.phone,studioPhone);
  assert.equal(settings.seoDescription.lv,'Mans individuālais apraksts');
  assert.equal(settings.seoDescription.en,localSearchDescription.en);
  assert.ok(db().prepare("SELECT 1 FROM content WHERE key='local-search-release-2026-11-23'").get());
  setContent('settings',{...settings,phone:'',seoDescription:{...settings.seoDescription,en:'Owner revised description'}});
  assert.equal(getSettings().phone,'');
  assert.equal(getSettings().seoDescription.en,'Owner revised description');
 }finally{db().close()}
});
