const ROAR_SPREADSHEET_ID = '1FAorg05Aa8G7x9nOP0bYBKpzTle_tBvBkU4bWhFvQ7k';
const ROAR_SHEET_NAME = 'ROAR Report';
const ROAR_NOTIFICATION_SHEET_NAME = 'Notification Emails';
const ROAR_TIME_ZONE = 'America/Chicago';
const RECEIPT_TTL_SECONDS = 600;
const NOTIFICATION_EMAIL_CACHE_SECONDS = 300;

const ROAR_HEADERS = [
  'Timestamp',
  'Report Title',
  'Mentor/Student Reporter',
  'Date',
  'Time',
  'Bullying',
  'Harassment',
  'Harassment - Verbal',
  'Harassment - Physical',
  'Harassment - Digital',
  'Sexual Harassment',
  'Misconduct',
  'Retaliation',
  'Other',
  'Other Report Type',
  'Individual(s) Involved',
  'Incident Date(s)',
  'Description of Incident(s)'
];

function doGet(e) {
  const params = (e && e.parameter) || {};
  const action = String(params.action || '');

  if (action === 'health') {
    try {
      const sheet = getRoarSheet_();
      ensureHeaders_(sheet);
      return jsonpResponse_(params.callback, { ok: true, ready: true });
    } catch (error) {
      return jsonpResponse_(params.callback, {
        ok: false,
        ready: false,
        error: 'Backend reached, but spreadsheet access failed: ' + errorMessage_(error)
      });
    }
  }

  if (action === 'receiptStatus') {
    const receiptId = cleanReceiptId_(params.receiptId);
    if (!receiptId) {
      return jsonpResponse_(params.callback, { ok: false, error: 'Missing receipt ID.' });
    }

    const cache = CacheService.getScriptCache();
    const value = cache.get('roarReceipt:' + receiptId);
    if (!value) {
      return jsonpResponse_(params.callback, { ok: true, received: false });
    }

    if (value.indexOf('ERROR:') === 0) {
      return jsonpResponse_(params.callback, {
        ok: false,
        received: false,
        error: value.slice(6)
      });
    }

    return jsonpResponse_(params.callback, {
      ok: true,
      received: true,
      message: 'Your ROAR report was received and stored. If there is an immediate safety concern, make sure an adult has also been contacted directly.'
    });
  }

  let statusText = 'Backend is reachable.';
  try {
    const sheet = getRoarSheet_();
    ensureHeaders_(sheet);
    statusText = 'Backend is reachable and the ROAR Reporting sheet is ready.';
  } catch (error) {
    statusText = 'Backend is reachable, but the sheet connection needs attention: ' + errorMessage_(error);
  }

  return HtmlService.createHtmlOutput(
    '<!doctype html><html><body style="font-family:Arial,sans-serif;padding:24px">' +
    '<h2>5041 ROAR Reporting Backend</h2>' +
    '<p>' + htmlEscape_(statusText) + '</p>' +
    '<p><strong>Required deployment:</strong> Execute as Me; access Anyone.</p>' +
    '</body></html>'
  );
}

function doPost(e) {
  const params = (e && e.parameter) || {};
  const receiptId = cleanReceiptId_(params.receiptId);

  try {
    if (String(params.website || '').trim()) {
      throw new Error('Submission rejected by spam protection.');
    }

    if (String(params.action || '') !== 'submitRoarReport') {
      throw new Error('Unsupported request.');
    }

    const description = String(params.description || '').trim();
    if (!description) {
      throw new Error('A description is required.');
    }

    const sheet = getRoarSheet_();

    // Headers are verified during setup/health checks. Avoid re-reading the
    // header row on every report submission; this removes an extra Sheets API
    // operation from the critical path.
    const now = new Date();
    const reportDate = clean_(params.date || Utilities.formatDate(now, ROAR_TIME_ZONE, 'yyyy-MM-dd'), 40);
    const reportTime = clean_(params.time || Utilities.formatDate(now, ROAR_TIME_ZONE, 'HH:mm'), 40);
    const reportTitle = clean_(params.reportTitle || ('ROAR Report - ' + reportDate + ' ' + reportTime), 250);

    const newerOtherTypes = [];
    if (truthy_(params.discrimination)) newerOtherTypes.push('Discrimination or Exclusion');
    if (truthy_(params.safetyConcern)) newerOtherTypes.push('Safety Concern');
    if (truthy_(params.other) && String(params.otherReportType || '').trim()) {
      newerOtherTypes.push(clean_(params.otherReportType, 1000));
    }

    const otherSelected = truthy_(params.other) || newerOtherTypes.length > 0;

    const safetyLines = [
      '',
      '--- Immediate Safety Information ---',
      'Immediate Safety Concern: ' + String(params.immediateSafety || 'No'),
      'Adult/School Official Contacted: ' + (String(params.adultContacted || '').trim() || 'Not provided')
    ];

    const combinedDescription = description + safetyLines.join('\n');

    const row = [
      now,
      reportTitle,
      clean_(params.reporter, 250),
      reportDate,
      reportTime,
      truthy_(params.bullying),
      truthy_(params.harassment),
      truthy_(params.harassmentVerbal),
      truthy_(params.harassmentPhysical),
      truthy_(params.harassmentDigital),
      truthy_(params.sexualHarassment),
      truthy_(params.misconduct),
      truthy_(params.retaliation),
      otherSelected,
      clean_(newerOtherTypes.join('; '), 1000),
      clean_(params.individualsInvolved, 2000),
      clean_(params.incidentDates, 1000),
      clean_(combinedDescription, 15000)
    ];

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }

    // Confirm storage before sending notification email so the user's receipt
    // can be acknowledged without waiting on MailApp.
    if (receiptId) {
      CacheService.getScriptCache().put('roarReceipt:' + receiptId, 'RECEIVED', RECEIPT_TTL_SECONDS);
    }

    // Email is intentionally non-blocking from the report's perspective: if a
    // mail quota/recipient issue occurs, the report remains safely stored.
    try {
      sendRoarNotificationEmail_({
        reportTitle: reportTitle,
        reportDate: reportDate,
        reportTime: reportTime,
        immediateSafety: String(params.immediateSafety || 'No')
      });
    } catch (notificationError) {
      console.error(
        'ROAR report was stored, but notification email failed: ' +
        errorMessage_(notificationError)
      );
    }

    return textResponse_('ROAR report stored.');
  } catch (error) {
    const message = errorMessage_(error);
    console.error(error && error.stack ? error.stack : error);
    if (receiptId) {
      CacheService.getScriptCache().put('roarReceipt:' + receiptId, 'ERROR:' + message.slice(0, 900), RECEIPT_TTL_SECONDS);
    }
    return textResponse_('ROAR report was not stored: ' + message);
  }
}


function sendRoarNotificationEmail_(reportInfo) {
  const recipients = getRoarNotificationEmails_();
  if (!recipients.length) {
    console.log('ROAR report stored; no valid notification email addresses were found.');
    return;
  }

  const immediateSafety = String(reportInfo.immediateSafety || '').toLowerCase() === 'yes';
  const subject = immediateSafety
    ? '[5041 ROAR] IMMEDIATE SAFETY CONCERN submitted'
    : '[5041 ROAR] New report submitted';

  const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/' + ROAR_SPREADSHEET_ID + '/edit';
  const body = [
    'A new 5041 ROAR report has been submitted and stored.',
    '',
    'Report title: ' + String(reportInfo.reportTitle || 'ROAR Report'),
    'Submitted date: ' + String(reportInfo.reportDate || ''),
    'Submitted time: ' + String(reportInfo.reportTime || ''),
    'Immediate safety concern: ' + (immediateSafety ? 'YES' : 'No'),
    '',
    'Review the report in the secure ROAR Reporting spreadsheet:',
    spreadsheetUrl,
    '',
    'This notification intentionally omits incident details. Please do not forward it.'
  ].join('\n');

  // Send one message to the first address and BCC the rest so the full
  // notification list is not exposed to recipients.
  const message = {
    to: recipients[0],
    subject: subject,
    body: body,
    name: '5041 ROAR Reporting'
  };
  if (recipients.length > 1) {
    message.bcc = recipients.slice(1).join(',');
  }

  MailApp.sendEmail(message);
}

function getRoarNotificationEmails_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('roarNotificationEmails');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      cache.remove('roarNotificationEmails');
    }
  }

  const ss = SpreadsheetApp.openById(ROAR_SPREADSHEET_ID);
  const sheet = ss.getSheetByName(ROAR_NOTIFICATION_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 1) return [];

  const values = sheet.getRange(1, 1, sheet.getLastRow(), 1).getDisplayValues();
  const seen = {};
  const emails = [];

  values.forEach(function (row) {
    String(row[0] || '')
      .split(/[,;\n]+/)
      .map(function (value) { return value.trim(); })
      .filter(function (value) { return isValidEmail_(value); })
      .forEach(function (email) {
        const key = email.toLowerCase();
        if (!seen[key]) {
          seen[key] = true;
          emails.push(email);
        }
      });
  });

  cache.put('roarNotificationEmails', JSON.stringify(emails), NOTIFICATION_EMAIL_CACHE_SECONDS);
  return emails;
}

function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function clearRoarNotificationEmailCache() {
  CacheService.getScriptCache().remove('roarNotificationEmails');
  console.log('ROAR notification email cache cleared.');
}

/** Run manually to verify the current Notification Emails list and MailApp permission. */
function testRoarNotificationEmail() {
  clearRoarNotificationEmailCache();
  const recipients = getRoarNotificationEmails_();
  if (!recipients.length) {
    throw new Error('No valid email addresses were found in column A of the "' + ROAR_NOTIFICATION_SHEET_NAME + '" sheet.');
  }

  const now = new Date();
  sendRoarNotificationEmail_({
    reportTitle: 'ROAR notification email test',
    reportDate: Utilities.formatDate(now, ROAR_TIME_ZONE, 'yyyy-MM-dd'),
    reportTime: Utilities.formatDate(now, ROAR_TIME_ZONE, 'HH:mm'),
    immediateSafety: 'No'
  });
  console.log('Test ROAR notification sent to ' + recipients.length + ' configured recipient(s).');
}

function getRoarSheet_() {
  const ss = SpreadsheetApp.openById(ROAR_SPREADSHEET_ID);
  const sheet = ss.getSheetByName(ROAR_SHEET_NAME);
  if (!sheet) throw new Error('Sheet tab "' + ROAR_SHEET_NAME + '" was not found.');
  return sheet;
}

function ensureHeaders_(sheet) {
  const range = sheet.getRange(1, 1, 1, ROAR_HEADERS.length);
  const existing = range.getDisplayValues()[0].map(function (value) {
    return String(value || '').trim();
  });
  const rowIsBlank = existing.every(function (value) { return !value; });

  if (rowIsBlank) {
    range.setValues([ROAR_HEADERS]);
    range.setFontWeight('bold');
    sheet.setFrozenRows(1);
    return;
  }

  for (let i = 0; i < ROAR_HEADERS.length; i += 1) {
    if (existing[i] !== ROAR_HEADERS[i]) {
      throw new Error(
        'Unexpected header in column ' + (i + 1) + '. Expected "' +
        ROAR_HEADERS[i] + '", found "' + existing[i] + '".'
      );
    }
  }
}

function jsonpResponse_(callbackName, payload) {
  const safeCallback = String(callbackName || '').replace(/[^A-Za-z0-9_$\.]/g, '');
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  if (!safeCallback) {
    return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService
    .createTextOutput(safeCallback + '(' + json + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function textResponse_(text) {
  return ContentService.createTextOutput(String(text || '')).setMimeType(ContentService.MimeType.TEXT);
}

function cleanReceiptId_(value) {
  const id = String(value || '').trim();
  return /^[A-Za-z0-9._-]{8,160}$/.test(id) ? id : '';
}

function truthy_(value) {
  const text = String(value || '').toLowerCase();
  return text === 'true' || text === '1' || text === 'yes' || text === 'on';
}

function clean_(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength || 5000);
}

function errorMessage_(error) {
  return String(error && error.message ? error.message : error || 'Unknown error');
}

function htmlEscape_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Run once from the Apps Script editor to authorize and verify sheet access. */
function testRoarSheetConnection() {
  const sheet = getRoarSheet_();
  ensureHeaders_(sheet);
  console.log('ROAR Reporting connection and A:R headers verified.');
}
