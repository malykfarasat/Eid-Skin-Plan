// ═══════════════════════════════════════════════════════════════
//  EID SKIN PLAN — Google Apps Script Reminder Sender
//  Paste this entire file into script.google.com
//  Trigger: sendReminders → every 1 minute (or 15 minutes)
// ═══════════════════════════════════════════════════════════════

var DB_URL     = 'https://studio-3197135393-11508-default-rtdb.firebaseio.com';
var DB_SECRET  = 'sWjc6aYT3JgtH6NkIAK1kSX9fsXl6WjBTv1VcwT3';
var PROJECT_ID = 'studio-3197135393-11508';
var SVC_EMAIL  = 'firebase-adminsdk-fbsvc@studio-3197135393-11508.iam.gserviceaccount.com';
var PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC+aGsJi/ScOqra\n3mEYOB69Qr3/dqXydZuPbaM5355Rk3PgAXFJumBAMzZ9JOmcrmDuDw/UKoizR6zl\niNrceprhtjR4RF25NnwjHhehZht52a9T6oQNpWWo17uKa+S6tHDs6T7tAWG1DxAb\nQZpcldcRYBIlhdzVH6w3pSNej90FyS52SjC/6KqNbA/90q3RsELH92F+V9BwHXM1\nkMkF8Ef+d93cVRBo24nLyood9QzF9Ir+rgaW1fwCTj95xfZPXTOTkW3Ymb0ZdRd3\nA4KpK35z7Lu7rN0ivEGTqRdGg8QTYXPML5pSR2ylICNEJikpewQ4jFcUYHE/7D87\nUY1WaOjzAgMBAAECggEACEEMitBnXTJp360ONneQVZIEHIPvM7CHetM85TBdc5nZ\nxxco6xJKQ940eX5VJjak+wzqGb9yR5tO0nB5VF94QVqdsaz9Bx9miDswuQ1tGX4n\nTJL5AIJwAr6/YYPF2ZYi4xJFaQ7LRocNorDYWTUhqp4oiznfVdnWpF7jRqEj6rE3\nq+s0lrv9vVgy9faOjV9JL2xYq7OdHF0mhE5c4eNr8mUwnVgQetUjvXqWuNrQoEnD\n+hjHLjyfWVc6udDxNwyoe710VMrO4zx5/dS378O+59SuWB5ABrI96F4ZW9bNoeGR\nr8bAOblRcOm8rXMQvXmEWy/MpBPKA2Cqwvak+MwtmQKBgQD43agICYLWZM3qhcrd\nJHWe/TP6W/L1A+kscz3/GKnaXLTbVTTi0/uIEbNm+nsTBtlNBmMl8s22US/46kuP\nSqtF/lxGmdtz3GK45cWmITvzbI1zKKLoUyAG+zxboNEherd6pKXQfCnvt6ONgMYQ\n2v8gq7y2ulz6CTm0enTUHswUFwKBgQDD3cIaHsgvaLDcjlS4zdz3WXK/KqiLxKr1\n+uw6RTG3zuTj17ZQ0tB01KSXKL6Ya1wYxGlmRW98B+5r856Iiih2sWraFucLVGCQ\nR6YMbO590iern1SNuyGgRhB8ZW92HGKlUmQIVE8fjcZUxxfPcyKbIQbJ5yz/cZFH\neaOwtQfvhQKBgQC/8Z3vDP7nwvn6/1Q2+i7qAFq9p3udNHX8fan8fZZLwCMR5AcV\nR/CBwz0+mMSiKS8itGF2XG4DR10bvAGpNCsjogqjvXlARGO0PiwSdSGbH0d94YK8\nc5iJKe8ksMV77/1hz2nAgnOJ23Z+5ipdx7rtBOhZeyXJB6KFK8m97T7z4wKBgFjQ\nNFSNwq4kpZXNAEOwLVMHf02JtVVzPyY8umMNvyaerRFXXfc2MInZZiyYsBwDCoa8\ngSJ7t7qhCg5vMGKvavuvJUlw+yEbCJJDutqFhnsNESn0HG4L/YpkWtNdV3ZSFrTq\nMCvKtvoS2mzUvko15eo7xo1EwxWtVHf5gyz8WXXVAoGBAPJ/jHzeBmvEzMEql+n4\nQKt3riLmAwdsXQdKhLw8jsiyA208Ogs0dpmtjA7AmRlGIe1uFmAJPOwYsHDZFHOK\nJL9D+IU0swqGTYAk+fjYIo+yRWpMd6QV1DWJrKc/K2STAmK4KOnR3Bblj/ztD6NT\naV+sLpjlamCo8wpxNWn6yBk/\n-----END PRIVATE KEY-----\n';

// ═══════════════════════════════════════════════════════════════
//  MAIN — trigger calls this every 1 or 15 minutes
// ═══════════════════════════════════════════════════════════════
function sendReminders() {
  try {
    var accessToken = getAccessToken_();
    var users = dbGet_('users');
    if (!users) { Logger.log('No users registered yet.'); return; }

    var REMINDERS = [
      { field: 'sehri', title: '🌅 Sehri Time!',        body: 'Drink 3 glasses of water & apply sunscreen. Eid skin starts now!' },
      { field: 'iftar', title: '🌇 Iftar Time!',         body: 'Prepare for Ubtan. Do your full skin routine after Iftar.' },
      { field: 'night', title: '🌙 Night Skin Routine!', body: "Time for your mask & aloe vera. Don't skip — your skin needs this!" }
    ];

    var sent = [];
    var skipped = [];

    for (var hash in users) {
      var user = users[hash];

      // ── FIX: NEVER skip based on active flag ──
      // active=false was set when old token expired — we always retry
      // If token is missing entirely, skip
      if (!user.token) {
        skipped.push(hash.slice(0,6) + ' (no token)');
        continue;
      }

      // Calculate user's local time using their timezone offset
      var localNow = new Date(Date.now() + (user.tz || 0) * 60000);
      var nowMins  = localNow.getUTCHours() * 60 + localNow.getUTCMinutes();
      var todayKey = localNow.toISOString().slice(0, 10);

      for (var i = 0; i < REMINDERS.length; i++) {
        var r = REMINDERS[i];
        if (!user[r.field]) continue;

        var parts = user[r.field].split(':');
        var tMins = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        var diff  = nowMins - tMins;

        // Fire within a 15-minute window after the set time
        if (diff < 0 || diff > 14) continue;

        // Already sent today? Skip
        var firedPath = 'fired/' + hash + '/' + todayKey + '/' + r.field;
        if (dbGet_(firedPath)) continue;

        // Send FCM
        var result = sendFCM_(user.token, r.title, r.body, accessToken);

        if (result && result.name) {
          // ── Success: mark fired + ensure active=true ──
          dbPut_(firedPath, true);
          if (!user.active) dbPut_('users/' + hash + '/active', true); // re-activate!
          sent.push(hash.slice(0,6) + ' → ' + r.field);
          Logger.log('✅ Sent: ' + r.title + ' to ' + hash.slice(0,6));
        } else {
          Logger.log('❌ FCM error for ' + hash.slice(0,6) + ': ' + JSON.stringify(result));
          // Only deactivate if token truly unregistered
          if (result && result.error && result.error.status === 'NOT_FOUND') {
            dbPut_('users/' + hash + '/active', false);
            Logger.log('   Token unregistered — user marked inactive. They need to refresh token in app.');
          }
        }
      }
    }

    Logger.log('Done. Sent: ' + (sent.length > 0 ? sent.join(', ') : 'none due') +
               (skipped.length > 0 ? ' | Skipped: ' + skipped.join(', ') : ''));
  } catch(e) {
    Logger.log('Error in sendReminders: ' + e.message);
  }
}

// ═══════════════════════════════════════════════════════════════
//  DEBUG — run this to see EXACTLY what time the script thinks it is
//  and whether your reminders should fire right now
// ═══════════════════════════════════════════════════════════════
function debugReminders() {
  try {
    var users = dbGet_('users');
    if (!users) { Logger.log('No users in DB.'); return; }

    Logger.log('══════ DEBUG ══════');
    Logger.log('Server UTC time: ' + new Date().toUTCString());
    Logger.log('Server UTC mins: ' + (new Date().getUTCHours()*60 + new Date().getUTCMinutes()));
    Logger.log('');

    for (var hash in users) {
      var user = users[hash];
      var tz = user.tz || 0;
      var localNow = new Date(Date.now() + tz * 60000);
      var nowMins  = localNow.getUTCHours() * 60 + localNow.getUTCMinutes();
      var todayKey = localNow.toISOString().slice(0, 10);

      Logger.log('User: ' + hash.slice(0,8));
      Logger.log('  active: ' + user.active + ' | tz: UTC+' + (tz/60));
      Logger.log('  Local time: ' + localNow.getUTCHours() + ':' + String(localNow.getUTCMinutes()).padStart(2,'0') + ' (' + nowMins + ' mins)');
      Logger.log('  Today key: ' + todayKey);

      var fields = ['sehri','iftar','night'];
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        var val = user[f];
        if (!val) { Logger.log('  ' + f + ': not set'); continue; }
        var parts = val.split(':');
        var tMins = parseInt(parts[0])*60 + parseInt(parts[1]);
        var diff  = nowMins - tMins;
        var firedPath = 'fired/' + hash + '/' + todayKey + '/' + f;
        var alreadyFired = dbGet_(firedPath) ? 'YES (already sent today)' : 'no';
        var inWindow = (diff >= 0 && diff <= 14) ? '✅ IN WINDOW' : '❌ not in window (diff=' + diff + ')';
        Logger.log('  ' + f + ': ' + val + ' (' + tMins + ' mins) → ' + inWindow + ' | fired: ' + alreadyFired);
      }
      Logger.log('');
    }
    Logger.log('══════════════════');
  } catch(e) {
    Logger.log('Debug error: ' + e.message);
  }
}

// ═══════════════════════════════════════════════════════════════
//  TEST CONNECTION
// ═══════════════════════════════════════════════════════════════
function testConnection() {
  try {
    Logger.log('Testing Firebase DB connection...');
    var users = dbGet_('users');
    Logger.log('Users in DB: ' + JSON.stringify(users));
    Logger.log('Testing FCM token...');
    var token = getAccessToken_();
    Logger.log('FCM access token obtained: ' + token.slice(0, 20) + '...');
    Logger.log('✅ Everything working!');
  } catch(e) {
    Logger.log('❌ Error: ' + e.message);
  }
}

// ═══════════════════════════════════════════════════════════════
//  INSTANT TEST — sends notification immediately regardless of time
// ═══════════════════════════════════════════════════════════════
function sendTestNow() {
  try {
    Logger.log('Getting FCM access token...');
    var accessToken = getAccessToken_();
    Logger.log('Reading users from Firebase...');
    var users = dbGet_('users');
    if (!users) { Logger.log('❌ No users in DB.'); return; }

    var count = 0;
    for (var hash in users) {
      var user = users[hash];
      if (!user.token) { Logger.log('Skipping ' + hash.slice(0,6) + ' — no token'); continue; }
      Logger.log('Sending to ' + hash.slice(0,6) + '...');
      var result = sendFCM_(user.token, '🌙 Test Notification', 'FCM is working! Your reminders are active.', accessToken);
      if (result && result.name) {
        Logger.log('✅ SUCCESS → ' + hash.slice(0,6) + ' | ID: ' + result.name);
        // Re-activate if was inactive (fixes users who had UNREGISTERED error)
        if (!user.active) dbPut_('users/' + hash + '/active', true);
        count++;
      } else {
        Logger.log('❌ FAILED → ' + hash.slice(0,6) + ': ' + JSON.stringify(result));
        if (result && result.error) {
          Logger.log('   Code: ' + result.error.status + ' | ' + result.error.message);
        }
      }
    }
    Logger.log('─────────');
    Logger.log(count > 0 ? '✅ Sent to ' + count + ' device(s). Check your phone!' : '❌ Nothing sent.');
  } catch(e) {
    Logger.log('❌ Error: ' + e.message);
  }
}

// ═══════════════════════════════════════════════════════════════
//  HELPER: OAuth2 access token via service account JWT
// ═══════════════════════════════════════════════════════════════
function getAccessToken_() {
  var now = Math.floor(Date.now() / 1000);
  var header  = Utilities.base64EncodeWebSafe(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).replace(/=+$/, '');
  var payload = Utilities.base64EncodeWebSafe(JSON.stringify({
    iss: SVC_EMAIL, sub: SVC_EMAIL,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging'
  })).replace(/=+$/, '');
  var toSign   = header + '.' + payload;
  var sig      = Utilities.base64EncodeWebSafe(Utilities.computeRsaSha256Signature(toSign, PRIVATE_KEY)).replace(/=+$/, '');
  var res = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'post', contentType: 'application/x-www-form-urlencoded',
    payload: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + toSign + '.' + sig,
    muteHttpExceptions: true
  });
  var data = JSON.parse(res.getContentText());
  if (!data.access_token) throw new Error('Token failed: ' + JSON.stringify(data));
  return data.access_token;
}

// ═══════════════════════════════════════════════════════════════
//  HELPER: Send FCM data-only message (always triggers SW)
// ═══════════════════════════════════════════════════════════════
function sendFCM_(token, title, body, accessToken) {
  var res = UrlFetchApp.fetch(
    'https://fcm.googleapis.com/v1/projects/' + PROJECT_ID + '/messages:send',
    {
      method: 'post', contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + accessToken },
      payload: JSON.stringify({
        message: {
          token: token,
          data: { title: title, body: body },   // data-only → SW always fires
          android: { priority: 'high' },
          webpush: { headers: { Urgency: 'high' } }
        }
      }),
      muteHttpExceptions: true
    }
  );
  return JSON.parse(res.getContentText());
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS: Firebase REST API
// ═══════════════════════════════════════════════════════════════
function dbGet_(path) {
  var res = UrlFetchApp.fetch(DB_URL + '/' + path + '.json?auth=' + DB_SECRET, { muteHttpExceptions: true });
  return JSON.parse(res.getContentText());
}
function dbPut_(path, value) {
  UrlFetchApp.fetch(DB_URL + '/' + path + '.json?auth=' + DB_SECRET, {
    method: 'put', contentType: 'application/json',
    payload: JSON.stringify(value), muteHttpExceptions: true
  });
}
