// Google Apps Script — paste this into your Apps Script project bound to the
// logging Sheet, then Deploy → Manage deployments → edit → New version (see
// ../README.md). It appends one row per submission.
//
// Everything lands in ONE sheet — unlike the public review form this project
// was forked from, there's no public/private split here: every response on
// this form is private by design, so there's nothing to route.
const SHEET_NAME = 'Client Feedback';

const HEADERS = [
  'Timestamp', 'Name', 'City', 'Relationship Manager',
  'Portfolio & Performance Rating', 'Service & Communication Rating', 'RM Rating',
  'Recommend Score (0-10)', 'New Needs', 'Anything Else',
];

// Google Sheets treats any cell value starting with =, +, -, or @ as a
// formula. Free-text fields (name, notes, "other" answers) come straight
// from the public form, so without this a submitted name like
// "=IMPORTXML(...)" would execute as a formula the moment someone opens the
// sheet. Prefixing with a straight apostrophe forces Sheets to treat it as
// literal text — the standard fix for this class of bug (CWE-1236).
function sanitizeForSheet(value) {
  const str = String(value == null ? '' : value);
  return /^[\s\uFEFF]*[=+\-@]/.test(str) ? "'" + str : str;
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = getOrCreateSheet(SHEET_NAME, HEADERS);

  sheet.appendRow([
    sanitizeForSheet(data.timestamp || new Date().toISOString()),
    sanitizeForSheet(data.name),
    sanitizeForSheet(data.city),
    sanitizeForSheet(data.rm),
    sanitizeForSheet(data.portfolioRating),
    sanitizeForSheet(data.serviceRating),
    sanitizeForSheet(data.rmRating),
    sanitizeForSheet(data.nps),
    sanitizeForSheet(data.newNeeds),
    sanitizeForSheet(data.notes),
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    formatSheet(sheet, headers);
    return sheet;
  }
  // Repair the header row in place if the question set has changed since this
  // tab was created. Only the header row is touched — existing data rows are
  // never rewritten or moved.
  var current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var matches = headers.every(function (h, i) { return current[i] === h; });
  if (!matches) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatSheet(sheet, headers);
  }
  return sheet;
}

function formatSheet(sheet, headers) {
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold').setBackground('#10203F').setFontColor('#FFFFFF');
  var widths = [150, 150, 130, 180, 130, 150, 100, 130, 220, 320];
  for (var i = 0; i < headers.length && i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }
  sheet.getRange(1, headers.length, sheet.getMaxRows(), 1)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
}
