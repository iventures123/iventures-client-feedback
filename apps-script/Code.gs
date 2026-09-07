// Google Apps Script — paste this into your Apps Script project bound to the
// logging Sheet, then Deploy → Manage deployments → edit → New version (see
// ../README.md). It appends one row per submission.
//
// Everything lands in ONE sheet — unlike the public review form this project
// was forked from, there's no public/private split here: every response on
// this form is private by design, so there's nothing to route.
const SHEET_NAME = 'Client Feedback';

// The six service-quality sub-parts, in the order they're asked. Keys match
// `serviceQualities` in config.js — add a row there and add its key + header
// here, and nothing else needs to change.
const QUALITY_COLUMNS = [
  { key: 'qCommunication', header: 'Communication' },
  { key: 'qResponsiveness', header: 'Responsiveness' },
  { key: 'qFollowUps', header: 'Follow-ups' },
  { key: 'qReporting', header: 'Reporting & Presentation' },
  { key: 'qProactivity', header: 'Proactivity' },
  { key: 'qUnderstanding', header: 'Understanding Goals' },
];

const HEADERS = [
  'Timestamp', 'Name', 'Phone', 'Email', 'City', 'Relationship Manager', 'Services Currently Using',
  'Portfolio & Performance Rating', 'Portfolio Note',
].concat(
  QUALITY_COLUMNS.map(function (c) { return c.header; })
).concat([
  'Service Note', 'RM Rating', 'RM Note',
  'Recommend Score (0-10)', 'Recommend Reason', 'New Needs', 'Anything Else',
]);

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

  var qualities = data.serviceQualities || {};
  var row = [
    sanitizeForSheet(data.timestamp || new Date().toISOString()),
    sanitizeForSheet(data.name),
    sanitizeForSheet(data.phone),
    sanitizeForSheet(data.email),
    sanitizeForSheet(data.city),
    sanitizeForSheet(data.rm),
    sanitizeForSheet(data.services),
    sanitizeForSheet(data.portfolioRating),
    sanitizeForSheet(data.portfolioNote),
  ].concat(
    QUALITY_COLUMNS.map(function (c) { return sanitizeForSheet(qualities[c.key]); })
  ).concat([
    sanitizeForSheet(data.serviceNote),
    sanitizeForSheet(data.rmRating),
    sanitizeForSheet(data.rmNote),
    sanitizeForSheet(data.nps),
    sanitizeForSheet(data.npsNote),
    sanitizeForSheet(data.newNeeds),
    sanitizeForSheet(data.notes),
  ]);

  sheet.appendRow(row);

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
  // Identity and context columns are wide; the 1-5 rating columns are narrow
  // so the whole quality block stays readable side by side on one screen.
  var widths = [150, 150, 120, 180, 100, 180, 260, 90, 220]
    .concat(QUALITY_COLUMNS.map(function () { return 75; }))
    .concat([220, 90, 220, 110, 220, 220, 320]);
  for (var i = 0; i < headers.length && i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }
  sheet.getRange(1, headers.length, sheet.getMaxRows(), 1)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
}
