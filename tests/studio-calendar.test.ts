import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {isPublicHoliday} from '../lib/holidays';

test('Latvian holiday dates include Easter and observed May/November holidays',()=>{
 for(const day of ['2026-12-24','2026-12-25','2026-12-26','2026-12-31','2027-01-01','2026-04-03','2026-04-05','2026-04-06','2026-05-10','2026-05-24','2025-05-05','2028-11-20'])assert.equal(isPublicHoliday(day),true,day);
 for(const day of ['2026-12-23','2026-12-30','2027-01-04','2026-11-11'])assert.equal(isPublicHoliday(day),false,day);
});

test('booking follows owner hours and opens only specifically enabled Saturdays, never holidays',async()=>{
 process.env.DATA_DIR=mkdtempSync(path.join(tmpdir(),'skinstinct-hours-'));
 const {db}=await import('../lib/db');
 const {getSlots}=await import('../lib/booking');
 try{
  const monday=getSlots('2026-12-07','youth-facial');
  assert.equal(monday[0].time,'09:00');assert.equal(monday.at(-1)?.time,'16:30');
  assert.equal(getSlots('2026-12-08','youth-facial').at(-1)?.time,'17:00');
  assert.equal(getSlots('2026-12-04','youth-facial').at(-1)?.time,'14:00');
  assert.deepEqual(getSlots('2026-12-05','youth-facial'),[]);
  db().prepare('INSERT INTO opening_days VALUES (?,?,?)').run('2026-12-05',540,720);
  assert.equal(getSlots('2026-12-05','youth-facial').at(-1)?.time,'11:00');
  db().prepare('DELETE FROM opening_days WHERE date=?').run('2026-12-05');
  assert.deepEqual(getSlots('2026-12-05','youth-facial'),[]);
  db().prepare('INSERT INTO opening_days VALUES (?,?,?)').run('2026-12-25',540,1080);
  assert.deepEqual(getSlots('2026-12-25','youth-facial'),[]);
  assert.deepEqual(getSlots('2026-12-31','youth-facial'),[]);
  assert.deepEqual(getSlots('2027-01-01','youth-facial'),[]);
 }finally{db().close()}
});
