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
  { key: 'qMarketKnowledge', header: 'RM: Market Knowledge' },
  { key: 'qResponsiveness', header: 'RM: Responsiveness' },
  { key: 'qFollowUps', header: 'RM: Follow-through' },
  { key: 'qUnderstanding', header: 'RM: Understanding Goals' },
  { key: 'qProactivity', header: 'RM: Proactivity' },
  { key: 'qReporting', header: 'RM: Reporting & Reviews' },
];

const HEADERS = [
  'Timestamp', 'Name', 'Phone', 'Email', 'City', 'Relationship Manager', 'Services Currently Using',
  'Portfolio & Allocation Rating', 'Portfolio Note', 'Reports On Time',
].concat(
  QUALITY_COLUMNS.map(function (c) { return c.header; })
).concat([
  'RM Note (day to day)', 'Walked Through', 'Wants To Hear More About',
  'RM Rating (overall)', 'RM Note',
  'Wants Contact Every',
  'App Rating (1-10)', 'App Feedback',
  'Recommend Score (0-10)', 'Recommend Reason',
  'Webinar Interest', 'Email Updates', 'New Needs',
  'Feedback / Suggestions / Complaints',
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
    sanitizeForSheet(data.reporting),
  ].concat(
    QUALITY_COLUMNS.map(function (c) { return sanitizeForSheet(qualities[c.key]); })
  ).concat([
    sanitizeForSheet(data.serviceNote),
    sanitizeForSheet(data.rmCoverage),
    sanitizeForSheet(data.coverageNote),
    sanitizeForSheet(data.rmRating),
    sanitizeForSheet(data.rmNote),
    sanitizeForSheet(data.frequency),
    sanitizeForSheet(data.appRating),
    sanitizeForSheet(data.appNote),
    sanitizeForSheet(data.nps),
    sanitizeForSheet(data.npsNote),
    sanitizeForSheet(data.webinars),
    sanitizeForSheet(data.mailOptIn),
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
  var widths = [150, 150, 120, 180, 100, 180, 260, 90, 220, 170]
    .concat(QUALITY_COLUMNS.map(function () { return 75; }))
    .concat([220, 240, 220, 90, 220, 150, 90, 240, 110, 220, 240, 120, 220, 340]);
  for (var i = 0; i < headers.length && i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }
  sheet.getRange(1, headers.length, sheet.getMaxRows(), 1)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
}
