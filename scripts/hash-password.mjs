import { randomBytes, scryptSync } from 'node:crypto';
let input='';
for await (const chunk of process.stdin) input+=chunk;
const password=input.trim();
if(password.length<12||password.length>200)throw new Error('Use a password between 12 and 200 characters.');
const salt=randomBytes(16).toString('hex');
process.stdout.write(`${salt}:${scryptSync(password,salt,64).toString('hex')}`);
