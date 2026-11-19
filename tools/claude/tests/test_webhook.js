/* Regression suite for disha-webhook.gs in Node with mocked Apps Script services.
   Usage: node tools/claude/tests/test_webhook.js [script.gs] [older.gs to compare] */
const fs = require('fs'), vm = require('vm'), crypto = require('crypto');
function load(path) {
  const sent = [], props = {}, fetched = [];
  const ctx = {
    console,
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: s => ({ s, setMimeType() { return this; } }) },
    MailApp: { sendEmail: (...a) => sent.push(a), getRemainingDailyQuota: () => 99 },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: k => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v); },
      deleteProperty: k => { delete props[k]; }, getProperties: () => ({ ...props }) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    Utilities: { formatDate: (d, tz, f) => f === 'yyyy-MM-dd' ? '2026-11-19' : '2026-11-19-08',
      DigestAlgorithm: { MD5: 'md5' },
      computeDigest: (_, s) => [...crypto.createHash('md5').update(s).digest()].map(b => b > 127 ? b - 256 : b) },
    UrlFetchApp: { fetch: (...a) => fetched.push(a) },
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path, 'utf8') + '\nSHARED_SECRET="s3cret";ADMIN_EMAIL="admin@x";', ctx);
  const post = d => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(d) } }).s);
  return { ctx, sent, props, post };
}
const full = { type: 'enrolment', token: 's3cret', id: 'U1', name: 'Asha', klass: '11', school: 'DPS',
  city: 'Kota', mobile: '9876543210', email: 'a@x.in', stream: 'Science (PCM)', countries: 'UAE',
  date: '2026-11-19T06:16:00.000Z' };
const cases = [
  ['blank enrolment (the bug)',      { type: 'enrolment', token: 's3cret' }, r => r.error === 'incomplete-enrolment', 0],
  ['enrolment, no name',             { ...full, name: '  ' },                r => r.detail === 'no-name', 0],
  ['enrolment, no contact',          { ...full, email: '', mobile: '' },     r => r.detail === 'no-contact', 0],
  ['enrolment, no id',               { ...full, id: '' },                    r => r.detail === 'no-account-id', 0],
  ['enrolment, bad date',            { ...full, date: 'x' },                 r => r.detail === 'no-date', 0],
  ['enrolment, mobile only',         { ...full, email: '' },                 r => r.ok === true, 1],
  ['full enrolment',                 full,                                   r => r.ok === true, 1],
  ['wrong secret',                   { ...full, token: 'nope' },             r => r.error === 'unauthorized', 0],
  ['empty body',                     null,                                   r => r.error === 'empty-request', 0],
  ['OTP',                            { type: 'otp', token: 's3cret', email: 'o@x.in', code: '123456', name: 'O' }, r => r.ok && r.email === 'sent', 1],
  ['consent',                        { type: 'consent', token: 's3cret', parentEmail: 'p@x.in', code: '42', studentName: 'A', notice: 'n', noticeVersion: 'v1' }, r => r.ok === true, 1],
  ['payment receipt',                { type: 'payment_confirmation', token: 's3cret', receiptNo: 'DISHA-PAY-1', name: 'A', email: 'a@x.in', amount: 590, currency: 'INR', taxable: 500, taxRate: 18, taxAmount: 90, taxName: 'GST', method: 'upi', date: 'd' }, r => r.ok === true, 2],
  ['webinar receipt',                { type: 'webinar_registration', token: 's3cret', receiptNo: 'W-1', name: 'A', email: 'a@x.in', amount: 1, currency: 'INR', method: 'upi', date: 'd' }, r => r.ok === true, 2],
  ['unknown type',                   { type: 'whatever', token: 's3cret', email: 'victim@x.in' }, r => r.error === 'unknown-type', 0],
  ['no type at all',                 { token: 's3cret', email: 'victim@x.in' }, r => r.error === 'unknown-type', 0],
  ['receipt without receiptNo',      { type: 'payment_confirmation', token: 's3cret', email: 'v@x.in' }, r => r.error === 'no-receipt', 0],
];
function run(path, label, strict) {
  let pass = 0, fail = 0;
  console.log(`\n== ${label} ==`);
  for (const [name, body, ok, mails] of cases) {
    const w = load(path);
    const r = body === null ? JSON.parse(w.ctx.doPost({}).s) : w.post(body);
    const good = ok(r) && w.sent.length === mails;
    good ? pass++ : fail++;
    console.log(`${good ? 'PASS' : 'FAIL'}  ${name.padEnd(28)} -> ${JSON.stringify(r).slice(0, 70)} | mails=${w.sent.length}`);
  }
  // body of the full enrolment mail is unchanged
  const w = load(path); w.post(full);
  const b = w.sent[0] && w.sent[0][2] || '';
  const bodyOk = /Name: Asha\n/.test(b) && /Signed up: 2026-11-19T06:16/.test(b) && /Account id: U1/.test(b) && w.sent[0][1] === 'DISHA enrolment: Asha';
  console.log(`${bodyOk ? 'PASS' : 'FAIL'}  full enrolment mail content intact`); bodyOk ? pass++ : fail++;
  // enrolment daily cap, independent of OTP counters
  if (strict) {
    const c = load(path); let okCount = 0, last;
    for (let i = 0; i < 61; i++) { last = c.post(full); if (last.ok) okCount++; }
    const otp = c.post({ type: 'otp', token: 's3cret', email: 'a@x.in', code: '1' });
    const capOk = okCount === 60 && last.detail === 'daily-cap-reached' && otp.ok === true;
    console.log(`${capOk ? 'PASS' : 'FAIL'}  enrol cap 60/day, OTP for same email unaffected`); capOk ? pass++ : fail++;
    // otp per-address hourly limit still works
    const o = load(path); const rs = [1,2,3,4].map(() => o.post({ type: 'otp', token: 's3cret', email: 'z@x.in', code: '1' }));
    const rl = rs[2].ok && rs[3].detail === 'too-many-right-now';
    console.log(`${rl ? 'PASS' : 'FAIL'}  OTP hourly limit (3) still enforced`); rl ? pass++ : fail++;
    const g = JSON.parse(o.ctx.doGet().s); const gOk = g.ok && g.secretSet === true;
    console.log(`${gOk ? 'PASS' : 'FAIL'}  doGet health check`); gOk ? pass++ : fail++;
  }
  console.log(`-- ${pass} passed, ${fail} failed`);
  return fail;
}
const path = require('path'), root = path.resolve(__dirname, '../../..');
const target = process.argv[2] || path.join(root, 'disha-webhook.gs');
if (process.argv[3]) run(process.argv[3], 'COMPARE: ' + process.argv[3], false);
process.exit(run(target, target, true) ? 1 : 0);
