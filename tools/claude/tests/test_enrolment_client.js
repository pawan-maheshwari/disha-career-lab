/* notifyEnrolment (index.html) against the real webhook script, end to end.
   Usage: node tools/claude/tests/test_enrolment_client.js */
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync(process.argv[2] || require('path').resolve(__dirname, '../../../index.html'), 'utf8');
const s = html.indexOf('  function notifyEnrolment(user) {');
const e = html.indexOf('\n  }\n', s) + 4;
const fnSrc = html.slice(s, e);
const gs = fs.readFileSync(process.argv[3] || require('path').resolve(__dirname, '../../../disha-webhook.gs'), 'utf8');
// server under test, same mocks as before (minimal)
const sent = [];
const sctx = { ContentService: { MimeType: {}, createTextOutput: s => ({ s, setMimeType() { return this; } }) },
  MailApp: { sendEmail: (...a) => sent.push(a) },
  PropertiesService: { getScriptProperties: () => { const p = sctx.__p || (sctx.__p = {}); return {
    getProperty: k => p[k] ?? null, setProperty: (k, v) => p[k] = String(v), deleteProperty: k => delete p[k], getProperties: () => ({ ...p }) }; } },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  Utilities: { formatDate: () => '2026-11-19' } };
vm.createContext(sctx); vm.runInContext(gs + ';SHARED_SECRET="k";ADMIN_EMAIL="a@x";', sctx);
const calls = [];
const ctx = { cfg: () => ({ notifyUrl: 'https://hook', notifyKey: 'k' }), Promise,
  fetch: (url, o) => { calls.push(o.body); const r = JSON.parse(sctx.doPost({ postData: { contents: o.body } }).s); return Promise.resolve(r); } };
vm.createContext(ctx); vm.runInContext(fnSrc, ctx);
// shapes produced by the two real signup paths
const cloudUser = { id: '3f2a-uuid', role: 'student', name: 'Asha', parent: '', klass: '11', school: 'DPS', city: 'Kota',
  mobile: '', email: 'asha@x.in', stream: 'Commerce (with Maths)', overseas: 'yes', overseasCountries: ['UAE','UK'], paid: false, plan: '', createdAt: 0 };
const localUser = { id: 'Um3x9abc', role: 'student', createdAt: Date.now(), name: 'Ravi', mobile: '9876543210', klass: '9' };
const tests = [
  ['cloud signup user',  cloudUser, r => r.ok === true],
  ['local signup user',  localUser, r => r.ok === true],
  ['nameless user',      { ...cloudUser, name: '' }, r => r.reason === 'incomplete'],
  ['no contact',         { ...cloudUser, email: '', mobile: '' }, r => r.reason === 'incomplete'],
  ['null user',          null, r => r.reason === 'unconfigured'],
];
(async () => {
  let fail = 0;
  for (const [n, u, ok] of tests) {
    const before = calls.length, mb = sent.length;
    const r = await ctx.notifyEnrolment(u);
    const g = ok(r);
    const posted = calls.length - before, mailed = sent.length - mb;
    const want = n.includes('signup') ? 1 : 0;
    const good = g && posted === want && mailed === want; if (!good) fail++;
    console.log(`${good ? 'PASS' : 'FAIL'}  ${n.padEnd(18)} -> ${JSON.stringify(r)} posted=${posted} mailed=${mailed}`);
  }
  const body = sent[0][2];
  const ok = /Name: Asha/.test(body) && /Overseas: UAE, UK/.test(body) && /Signed up: 20\d\d-/.test(body);
  console.log(`${ok ? 'PASS' : 'FAIL'}  cloud enrolment email filled in`); if (!ok) fail++;
  console.log(`-- ${fail ? fail + ' failed' : 'all passed'}`); process.exit(fail ? 1 : 0);
})();
