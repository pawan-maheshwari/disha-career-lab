/** DISHA webhook — OTP delivery + payment receipts, with rate limiting.
 *
 *  The webhook URL and secret are readable by anyone who views the site,
 *  so treat the secret as a speed bump, not a lock. The real protection
 *  is the caps below: they bound what an abuser can do to your Gmail
 *  quota and to any single person's inbox.
 *
 *  Setup: paste, set the constants, Run > doGet once to grant Gmail
 *  access, then Deploy > New deployment > Web app (Execute as: Me,
 *  Who has access: Anyone). After ANY edit, redeploy via
 *  Deploy > Manage deployments > Edit > Version: New version. */

var SHARED_SECRET = 'YOUR_SHARED_SECRET';   // must equal 'Webhook secret' in DISHA settings
var ADMIN_EMAIL   = 'YOUR_ADMIN_EMAIL';

// --- Rate limits ---------------------------------------------------------
// Consumer Gmail allows ~100 mails/day; Workspace ~1500. Keep DAILY_TOTAL
// below your quota so abuse cannot lock out real students for the day.
var PER_ADDRESS_DAILY = 5;    // OTPs to any one email/mobile per day
var PER_ADDRESS_HOURLY = 3;   // burst guard
var DAILY_TOTAL = 80;         // all OTPs, all users, per day
var ENROL_DAILY = 60;         // enrolment notices to ADMIN_EMAIL per day

// --- SMS (optional) ------------------------------------------------------
var SMS_ENABLED   = false;
var SMS_AUTHKEY   = 'YOUR_GATEWAY_AUTH_KEY';
var SMS_SENDER    = 'DISHAC';
var SMS_TEMPLATE  = 'YOUR_DLT_TEMPLATE_ID';

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

function today_() { return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd'); }
function hour_()  { return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd-HH'); }

/** Addresses are hashed, so the counters never store anyone's email. */
function tag_(s) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, String(s || '').toLowerCase());
  var hex = '';
  for (var i = 0; i < 6; i++) {
    var b = (raw[i] + 256) % 256;
    hex += ('0' + b.toString(16)).slice(-2);
  }
  return hex;
}

/** Yesterday's counters are dropped the first time we run on a new day. */
function sweep_(props, day) {
  if (props.getProperty('sweep') === day) return;
  var all = props.getProperties();
  for (var k in all) {
    if (k.indexOf('q:') === 0 && k.indexOf('q:' + day) !== 0) props.deleteProperty(k);
    if (k.indexOf('h:') === 0 && k.indexOf('h:' + day) !== 0) props.deleteProperty(k);
  }
  props.setProperty('sweep', day);
}

function count_(props, key) { return parseInt(props.getProperty(key) || '0', 10); }
function bump_(props, key) { props.setProperty(key, String(count_(props, key) + 1)); }

/** Returns null when allowed, or a reason string when blocked. */
function checkLimits_(contact) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch (err) { return 'busy'; }
  try {
    var props = PropertiesService.getScriptProperties();
    var day = today_(), hr = hour_(), id = tag_(contact);
    sweep_(props, day);
    var kTotal = 'q:' + day + ':total',
        kDay   = 'q:' + day + ':' + id,
        kHour  = 'h:' + hr + ':' + id;
    // check everything before charging anything, so a rejected
    // attempt never eats the caller's remaining allowance
    if (count_(props, kTotal) >= DAILY_TOTAL) return 'daily-cap-reached';
    if (count_(props, kDay) >= PER_ADDRESS_DAILY) return 'too-many-for-this-address';
    if (count_(props, kHour) >= PER_ADDRESS_HOURLY) return 'too-many-right-now';
    bump_(props, kTotal); bump_(props, kDay); bump_(props, kHour);
    return null;
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

/** Daily cap on enrolment notices, kept apart from the OTP counters so
 *  a signup never uses up the student's own OTP allowance. */
function enrolCap_() {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(5000); } catch (err) { return 'busy'; }
  try {
    var props = PropertiesService.getScriptProperties();
    var day = today_(), k = 'q:' + day + ':enrol';
    sweep_(props, day);
    if (count_(props, k) >= ENROL_DAILY) return 'daily-cap-reached';
    bump_(props, k);
    return null;
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

/** A real signup always carries an account id, a name, a way to reach
 *  the student and a timestamp. Anything less is a probe or a broken
 *  client, and must not land in the inbox as an "enrolment". */
function enrolmentProblem_(d) {
  function has(v) { return String(v == null ? '' : v).trim() !== ''; }
  if (!has(d.id))   return 'no-account-id';
  if (!has(d.name)) return 'no-name';
  if (!has(d.email) && !has(d.mobile)) return 'no-contact';
  if (!has(d.date) || isNaN(Date.parse(d.date))) return 'no-date';
  return null;
}

function doGet() {
  var quota = -1;
  try { quota = MailApp.getRemainingDailyQuota(); } catch (err) {
    return out({ ok: false, error: 'not-authorised', detail: String(err) });
  }
  var used = 0;
  try {
    used = parseInt(PropertiesService.getScriptProperties()
      .getProperty('q:' + today_() + ':total') || '0', 10);
  } catch (err) {}
  return out({ ok: true, service: 'DISHA webhook', mailQuotaLeft: quota,
               otpsSentToday: used, dailyCap: DAILY_TOTAL,
               secretSet: SHARED_SECRET !== 'YOUR_SHARED_SECRET' });
}

function sendSms(mobile, text, code) {
  if (!SMS_ENABLED || !mobile) return 'skipped';
  var to = String(mobile).replace(/\D/g, '');
  if (to.length === 10) to = '91' + to;
  try {
    UrlFetchApp.fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'post', contentType: 'application/json',
      headers: { authkey: SMS_AUTHKEY },
      payload: JSON.stringify({
        template_id: SMS_TEMPLATE, sender: SMS_SENDER,
        recipients: [{ mobiles: to, OTP: code || '', MESSAGE: text }]
      }),
      muteHttpExceptions: true
    });
    return 'sent';
  } catch (err) { return 'failed'; }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents)
      return out({ ok: false, error: 'empty-request' });
    var d = JSON.parse(e.postData.contents);

    if ((d.token || d.secret || '') !== SHARED_SECRET)
      return out({ ok: false, error: 'unauthorized',
                   detail: 'SHARED_SECRET here does not match the Webhook secret in DISHA settings' });

    if (d.type === 'consent') {
      var cb =
        'Dear ' + (d.parentName || 'Parent / Guardian') + ',\n\n' +
        (d.studentName ? d.studentName + ' has' : 'Your child has') +
        ' asked to take the DISHA 5-D Career Assessment.\n\n' +
        'Indian law requires your consent before we process a child\'s personal data.\n\n' +
        'WHAT WE COLLECT AND WHY\n' + (d.notice || '') + '\n\n' +
        'YOUR CONSENT CODE: ' + d.code + '\n' +
        'Give this code to your child, or enter it yourself on the DISHA page.\n' +
        'It is valid for 10 minutes.\n\n' +
        'If you do NOT consent, simply ignore this email. Nothing will proceed.\n' +
        'You can withdraw consent later at any time by replying to this address.\n\n' +
        'Notice version: ' + (d.noticeVersion || '') + '\n' +
        '\u2014 DISHA Career Lab';
      try {
        MailApp.sendEmail({ to: d.parentEmail,
          subject: 'Your consent is needed \u2014 DISHA Career Lab',
          body: cb, name: 'DISHA Career Lab' });
      } catch (err) {
        return out({ ok: false, error: 'mail-failed', detail: String(err) });
      }
      return out({ ok: true });
    }

    if (d.type === 'enrolment') {
      var bad = enrolmentProblem_(d);
      if (bad) return out({ ok: false, error: 'incomplete-enrolment', detail: bad });
      var capped = enrolCap_();
      if (capped) return out({ ok: false, error: 'rate-limited', detail: capped });
      var e2 =
        'New DISHA enrolment\n\n' +
        'Name: '      + (d.name   || '') + '\n' +
        'Class: '     + (d.klass  || '') + '\n' +
        'School: '    + (d.school || '') + '\n' +
        'City: '      + (d.city   || '') + '\n' +
        'Mobile: '    + (d.mobile || '') + '\n' +
        'Email: '     + (d.email  || '') + '\n' +
        'Stream: '    + (d.stream || '') + '\n' +
        'Overseas: '  + (d.countries || 'none') + '\n' +
        'Signed up: ' + (d.date || '') + '\n' +
        'Account id: '+ (d.id || '') + '\n\n' +
        'Keep this email. Until the database migration is complete it is ' +
        'the only central record that this student enrolled.';
      try {
        MailApp.sendEmail(ADMIN_EMAIL, 'DISHA enrolment: ' + (d.name || 'new student'), e2);
      } catch (err) {
        return out({ ok: false, error: 'mail-failed', detail: String(err) });
      }
      return out({ ok: true });
    }

    if (d.type === 'otp') {
      var contact = d.email || d.mobile || '';
      if (!contact) return out({ ok: false, error: 'no-contact' });

      var blocked = checkLimits_(contact);
      if (blocked) return out({ ok: false, error: 'rate-limited', detail: blocked });

      var body =
        'Hello ' + (d.name || 'there') + ',\n\n' +
        'Your DISHA verification code is ' + d.code + '.\n' +
        'It is valid for 10 minutes. Do not share it with anyone.\n\n' +
        'If you did not request this, you can ignore this email.\n\n' +
        '— DISHA Career Lab';
      var mail = 'skipped', mailErr = '';
      if (d.email) {
        try {
          MailApp.sendEmail({ to: d.email, subject: 'DISHA verification code ' + d.code,
                              body: body, name: 'DISHA Career Lab' });
          mail = 'sent';
        } catch (err) { mail = 'failed'; mailErr = String(err); }
      }
      var sms = sendSms(d.mobile, d.message || body, d.code);
      return out({ ok: mail === 'sent' || sms === 'sent',
                   email: mail, sms: sms, error: mailErr || undefined });
    }

    /* Only the two receipt types reach here. Anything else used to fall
       through and send a "payment received" email full of "undefined",
       to the admin and to whatever address the caller supplied. */
    if (d.type !== 'payment_confirmation' && d.type !== 'webinar_registration')
      return out({ ok: false, error: 'unknown-type', detail: String(d.type || '') });
    if (!String(d.receiptNo || '').trim())
      return out({ ok: false, error: 'no-receipt' });

    var r =
      'Hello ' + (d.name || 'there') + ',\n\n' +
      'We have received your payment for the DISHA 5-D Career Assessment.\n\n' +
      'Receipt no: ' + d.receiptNo + '\n' +
      'Assessment fee: ' + (d.taxable != null ? d.taxable : d.amount) + ' ' + d.currency + '\n' +
      (d.taxRate ? 'Add: ' + d.taxName + ' @ ' + d.taxRate + '%: ' + d.taxAmount + ' ' + d.currency + '\n' : '') +
      'Total paid: ' + d.amount + ' ' + d.currency + '\n' +
      (d.taxRate ? d.taxName + ' is charged additionally at ' + d.taxRate + '% as per government regulations.\n' : '') +
      'Billed by: PlanetAI LLP\n' +
      (d.gstin ? 'Provisional ID / GSTIN / UIN: ' + d.gstin + '\n' : '') +
      'Method: ' + d.method + '\n' +
      (d.promo ? 'Promo code: ' + d.promo + '\n' : '') +
      (d.reference ? 'Reference: ' + d.reference + '\n' : '') +
      'Date: ' + d.date + '\n\n' +
      'Your assessment is unlocked. — DISHA Career Lab';
    if (d.email) MailApp.sendEmail(d.email, 'DISHA payment receipt ' + d.receiptNo, r);
    MailApp.sendEmail(ADMIN_EMAIL, 'New DISHA payment ' + d.receiptNo, r);
    sendSms(d.mobile, 'DISHA: payment received. Receipt ' + d.receiptNo + '.', '');
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: 'script-error', detail: String(err) });
  }
}