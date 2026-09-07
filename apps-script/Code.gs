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
  { key: 'qNewIdeas', header: 'RM: Explaining New Products' },
  { key: 'qProactivity', header: 'RM: Proactivity' },
  { key: 'qReporting', header: 'RM: Reporting & Reviews' },
];

const HEADERS = [
  'Timestamp', 'Name', 'Phone', 'Email', 'City', 'Deals With', 'Main Contact', 'Services Currently Using',
  'Portfolio & Allocation Rating', 'Portfolio Note', 'Reports On Time',
].concat(
  QUALITY_COLUMNS.map(function (c) { return c.header; })
).concat([
  'RM Note (day to day)', 'Walked Through', 'Wants To Hear More About',
  'RM Rating (overall)', 'RM Note',
  'Other RM Scores', 'Other RM Note',
  'Wants Contact Every',
  'App Rating (1-10)', 'App Issues', 'App Feedback',
  'Recommend Score (0-10)', 'Recommend Reason', 'Referrals',
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
    sanitizeForSheet(data.primaryRm),
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
    sanitizeForSheet(data.otherRmScores),
    sanitizeForSheet(data.otherRmsNote),
    sanitizeForSheet(data.frequency),
    sanitizeForSheet(data.appRating),
    sanitizeForSheet(data.appIssues),
    sanitizeForSheet(data.appNote),
    sanitizeForSheet(data.nps),
    sanitizeForSheet(data.npsNote),
    sanitizeForSheet(data.referrals),
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
  var widths = [150, 150, 120, 180, 100, 200, 160, 260, 90, 220, 170]
    .concat(QUALITY_COLUMNS.map(function () { return 75; }))
    .concat([220, 240, 220, 90, 220, 200, 220, 150, 90, 240, 240, 110, 220, 260, 240, 120, 220, 340]);
  for (var i = 0; i < headers.length && i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }
  sheet.getRange(1, headers.length, sheet.getMaxRows(), 1)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
}

// ===========================================================================
// Dashboard
// ===========================================================================
// Built INSIDE the spreadsheet on purpose. A hosted dashboard would need its
// own URL, its own password and its own copy of the data — and this data is
// candid criticism of named employees plus client and third-party phone
// numbers. Living in the Sheet, it inherits the access control you already
// set: whoever you shared the file with sees it, and nobody else can, with no
// public endpoint to leak.
//
// Refresh it from the "iVentures" menu that appears when you open the file,
// or run installHourlyRefresh() once to have it rebuild on its own.
const DASHBOARD_SHEET = 'Dashboard';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('iVentures')
    .addItem('Refresh dashboard', 'buildDashboard')
    .addItem('Auto-refresh every hour', 'installHourlyRefresh')
    .addToUi();
}

function installHourlyRefresh() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'buildDashboard') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('buildDashboard').timeBased().everyHours(1).create();
  SpreadsheetApp.getActive().toast('The dashboard will now refresh every hour.', 'iVentures', 5);
}

// --- small helpers ---------------------------------------------------------
// Values are read by HEADER NAME, never by column position, so adding or
// reordering a question in the form can't silently point a statistic at the
// wrong column.
function cell(row, header) {
  const v = row[header];
  return v == null ? '' : String(v).trim();
}

// "4/5" -> 4, "9/10" -> 9, anything else -> null (which means "not answered"
// and is skipped by the averages rather than counted as a zero).
function scoreOf(value) {
  const m = String(value == null ? '' : value).match(/^(\d+(?:\.\d+)?)\s*\/\s*\d+$/);
  return m ? Number(m[1]) : null;
}

function average(nums) {
  const clean = nums.filter(function (n) { return typeof n === 'number' && !isNaN(n); });
  if (!clean.length) return null;
  return clean.reduce(function (a, b) { return a + b; }, 0) / clean.length;
}

function round1(n) { return n == null ? '—' : Math.round(n * 10) / 10; }

function pct(part, whole) {
  if (!whole) return '—';
  return Math.round((part / whole) * 100) + '%';
}

// A multi-select lands as "Mutual funds, PMS". Split it back out.
function listOf(value) {
  return String(value == null ? '' : value)
    .split(/,(?![^(]*\))/)
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
}

// The timestamp column is written for humans ("07 Sept 2026, 04:39 pm"), so
// it needs parsing back before it can be compared to a date. Returns null on
// anything unexpected rather than guessing.
const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
function parseStamp(value) {
  const m = String(value == null ? '' : value)
    .match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/);
  if (!m) return null;
  const month = MONTHS[m[2].slice(0, 3).toLowerCase()];
  if (month === undefined) return null;
  return new Date(Number(m[3]), month, Number(m[1]));
}

function tally(values) {
  const counts = {};
  values.forEach(function (v) {
    if (!v) return;
    counts[v] = (counts[v] || 0) + 1;
  });
  return Object.keys(counts)
    .map(function (k) { return { label: k, count: counts[k] }; })
    .sort(function (a, b) { return b.count - a.count; });
}

// --- the numbers -----------------------------------------------------------
// Pure: takes rows, returns the grid of cells to write. Kept free of
// SpreadsheetApp so it can be exercised outside Apps Script.
function computeSummary(rows, now) {
  const out = [];
  // Variadic: the per-manager table is 3 columns plus one per skillset, so a
  // fixed arity here silently dropped the last skillset off the report.
  const push = function () {
    out.push(Array.prototype.slice.call(arguments).map(function (v) { return v == null ? '' : v; }));
  };
  const blank = function () { push(''); };
  const heading = function (text) { blank(); push(text); };

  const total = rows.length;
  push('iVentures — Client Feedback');
  push('Refreshed', Utilities_formatDate(now));
  blank();

  // -- responses ------------------------------------------------------------
  push('RESPONSES');
  push('Total', total);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recent = rows.filter(function (r) {
    const d = parseStamp(cell(r, 'Timestamp'));
    return d && d >= weekAgo;
  }).length;
  push('In the last 7 days', recent);

  const nps = rows.map(function (r) { return scoreOf(cell(r, 'Recommend Score (0-10)')); })
    .filter(function (n) { return n != null; });
  const promoters = nps.filter(function (n) { return n >= 9; }).length;
  const passives = nps.filter(function (n) { return n >= 7 && n <= 8; }).length;
  const detractors = nps.filter(function (n) { return n <= 6; }).length;
  push('Average recommend score', round1(average(nps)), nps.length ? 'out of 10' : '');
  push('Promoters (9-10)', promoters, pct(promoters, nps.length));
  push('Passives (7-8)', passives, pct(passives, nps.length));
  push('Detractors (0-6)', detractors, pct(detractors, nps.length));
  // The standard NPS figure, so it can be compared with anything else the
  // firm already tracks.
  push('Net Promoter Score', nps.length ? Math.round(((promoters - detractors) / nps.length) * 100) : '—');

  // -- per relationship manager --------------------------------------------
  // Grouped by MAIN CONTACT, not by "Deals With": the seven skillset scores
  // describe the one person the client nominated, so crediting them to
  // everyone they happened to name would be wrong.
  heading('BY RELATIONSHIP MANAGER — scored 1-5 by clients who named them as main contact');
  const skillHeaders = QUALITY_COLUMNS.map(function (c) { return c.header; });
  push.apply(null, ['Manager', 'Responses', 'Overall'].concat(
    skillHeaders.map(function (h) { return h.replace(/^RM:\s*/, ''); })
  ));

  const byRm = {};
  rows.forEach(function (r) {
    const name = cell(r, 'Main Contact');
    if (!name) return;
    if (!byRm[name]) byRm[name] = [];
    byRm[name].push(r);
  });
  Object.keys(byRm).sort().forEach(function (name) {
    const group = byRm[name];
    const overall = average(group.map(function (r) { return scoreOf(cell(r, 'RM Rating (overall)')); }));
    const skills = skillHeaders.map(function (h) {
      return round1(average(group.map(function (r) { return scoreOf(cell(r, h)); })));
    });
    push.apply(null, [name, group.length, round1(overall)].concat(skills));
  });
  if (!Object.keys(byRm).length) push('(no responses yet)');

  // Scores given to managers who weren't the main contact, kept separate so
  // they can't quietly dilute the detailed averages above.
  const otherScores = {};
  rows.forEach(function (r) {
    String(cell(r, 'Other RM Scores')).split('\n').forEach(function (line) {
      const m = line.match(/^(.*)\s(\d+)\/5$/);
      if (!m) return;
      const name = m[1].trim();
      if (!otherScores[name]) otherScores[name] = [];
      otherScores[name].push(Number(m[2]));
    });
  });
  if (Object.keys(otherScores).length) {
    blank();
    push('Also rated (as a secondary contact)', 'Times rated', 'Average');
    Object.keys(otherScores).sort().forEach(function (name) {
      push(name, otherScores[name].length, round1(average(otherScores[name])));
    });
  }

  // -- coverage gaps --------------------------------------------------------
  // The commercial one. Every "never mentioned" is a product conversation
  // that has not happened yet.
  heading('WHAT CLIENTS HAVE NOT BEEN WALKED THROUGH');
  push('Product', 'Walked through', 'Never mentioned', '% never mentioned');
  const coverage = {};
  rows.forEach(function (r) {
    listOf(cell(r, 'Walked Through')).forEach(function (item) {
      if (item === 'None of these so far') return;
      coverage[item] = (coverage[item] || 0) + 1;
    });
  });
  Object.keys(coverage).sort(function (a, b) { return coverage[a] - coverage[b]; })
    .forEach(function (item) {
      push(item, coverage[item], total - coverage[item], pct(total - coverage[item], total));
    });
  if (!Object.keys(coverage).length) push('(no responses yet)');

  // -- service delivery -----------------------------------------------------
  heading('DO REPORTS AND STATEMENTS ARRIVE ON TIME');
  tally(rows.map(function (r) { return cell(r, 'Reports On Time'); }))
    .forEach(function (t) { push(t.label, t.count, pct(t.count, total)); });

  heading('HOW OFTEN CLIENTS WANT TO HEAR FROM US');
  tally(rows.map(function (r) { return cell(r, 'Wants Contact Every'); }))
    .forEach(function (t) { push(t.label, t.count, pct(t.count, total)); });

  heading('PORTFOLIO & ALLOCATION');
  const portfolio = rows.map(function (r) { return scoreOf(cell(r, 'Portfolio & Allocation Rating')); })
    .filter(function (n) { return n != null; });
  push('Average', round1(average(portfolio)), 'out of 5');
  push('Rated 3 or below', portfolio.filter(function (n) { return n <= 3; }).length, pct(portfolio.filter(function (n) { return n <= 3; }).length, portfolio.length));

  // -- the app --------------------------------------------------------------
  heading('THE APP');
  const app = rows.map(function (r) { return scoreOf(cell(r, 'App Rating (1-10)')); })
    .filter(function (n) { return n != null; });
  push('Average', round1(average(app)), 'out of 10');
  push('Rated it', app.length, pct(app.length, total));
  push('Skipped it (never used)', total - app.length, pct(total - app.length, total));
  const issues = [];
  rows.forEach(function (r) { listOf(cell(r, 'App Issues')).forEach(function (i) { issues.push(i); }); });
  if (issues.length) {
    push('What is getting in the way', 'Mentions');
    tally(issues).forEach(function (t) { push(t.label, t.count); });
  }

  // -- interest and permission ---------------------------------------------
  heading('WEBINAR INTEREST');
  const webinars = [];
  rows.forEach(function (r) { listOf(cell(r, 'Webinar Interest')).forEach(function (w) { webinars.push(w); }); });
  tally(webinars).forEach(function (t) { push(t.label, t.count, pct(t.count, total)); });
  if (!webinars.length) push('(no responses yet)');

  heading('EMAIL UPDATES');
  tally(rows.map(function (r) { return cell(r, 'Email Updates'); }))
    .forEach(function (t) { push(t.label, t.count, pct(t.count, total)); });

  heading('NEW NEEDS RAISED');
  const needs = [];
  rows.forEach(function (r) { listOf(cell(r, 'New Needs')).forEach(function (n) { needs.push(n); }); });
  tally(needs).forEach(function (t) { push(t.label, t.count); });
  if (!needs.length) push('(no responses yet)');

  // -- referrals ------------------------------------------------------------
  heading('INTRODUCTIONS OFFERED');
  const referrals = [];
  rows.forEach(function (r) {
    String(cell(r, 'Referrals')).split('\n').forEach(function (line) {
      if (line.trim()) referrals.push({ by: cell(r, 'Name'), who: line.trim() });
    });
  });
  push('People introduced', referrals.length);
  push('Clients who introduced someone', rows.filter(function (r) { return cell(r, 'Referrals'); }).length);
  if (referrals.length) {
    blank();
    push('Introduced by', 'Who');
    referrals.forEach(function (r) { push(r.by, r.who); });
  }

  // -- who to call ----------------------------------------------------------
  // The point of the whole exercise: a call list, ordered by who is least
  // happy, rather than a page of averages nobody acts on.
  heading('CALL THESE CLIENTS FIRST — lowest recommend scores');
  push('Client', 'Phone', 'Score', 'Main contact', 'What they said');
  rows.map(function (r) {
    return {
      name: cell(r, 'Name'),
      phone: cell(r, 'Phone'),
      score: scoreOf(cell(r, 'Recommend Score (0-10)')),
      rm: cell(r, 'Main Contact'),
      said: cell(r, 'Feedback / Suggestions / Complaints') || cell(r, 'Recommend Reason') || cell(r, 'RM Note'),
    };
  })
    .filter(function (r) { return r.score != null && r.score <= 6; })
    .sort(function (a, b) { return a.score - b.score; })
    .slice(0, 25)
    .forEach(function (r) { push(r.name, r.phone, r.score + '/10', r.rm, r.said); });

  // setValues rejects a ragged grid, so square it off before it leaves here.
  const width = out.reduce(function (m, r) { return Math.max(m, r.length); }, 1);
  return out.map(function (r) {
    const padded = r.slice();
    while (padded.length < width) padded.push('');
    return padded;
  });
}

// Apps Script has Utilities.formatDate; this wrapper keeps computeSummary
// free of it so the same function can run outside Apps Script.
function Utilities_formatDate(d) {
  try {
    return Utilities.formatDate(d, 'Asia/Kolkata', 'd MMM yyyy, h:mm a');
  } catch (err) {
    return d.toISOString();
  }
}

function buildDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const source = ss.getSheetByName(SHEET_NAME);
  if (!source || source.getLastRow() < 2) {
    const empty = getOrCreateDashboard(ss);
    empty.clear();
    empty.getRange(1, 1).setValue('No responses yet. This fills in as soon as the first one arrives.');
    return;
  }

  const values = source.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1).map(function (r) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = r[i]; });
    return obj;
  });

  const grid = computeSummary(rows, new Date());
  const sheet = getOrCreateDashboard(ss);
  sheet.clear();
  sheet.getRange(1, 1, grid.length, grid[0].length).setValues(grid);
  formatDashboard(sheet, grid);
  ss.setActiveSheet(sheet);
}

function getOrCreateDashboard(ss) {
  let sheet = ss.getSheetByName(DASHBOARD_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(DASHBOARD_SHEET, 0);
  }
  return sheet;
}

function formatDashboard(sheet, grid) {
  sheet.setHiddenGridlines(true);
  const width = grid[0].length;
  sheet.getRange(1, 1, 1, width).merge();
  sheet.getRange(1, 1)
    .setFontSize(16).setFontWeight('bold').setFontColor('#10203F');
  sheet.setColumnWidth(1, 320);
  for (let c = 2; c <= width; c++) sheet.setColumnWidth(c, 150);

  // A row whose first cell is ALL CAPS and whose second cell is empty is a
  // section heading — style those rather than tracking row numbers, which
  // would drift every time a section is added.
  grid.forEach(function (row, i) {
    const first = String(row[0] || '');
    const isHeading = first.length > 3 && first === first.toUpperCase() && first !== '' && !row[1];
    if (isHeading) {
      sheet.getRange(i + 1, 1, 1, width)
        .setBackground('#10203F').setFontColor('#FFFFFF').setFontWeight('bold');
    }
  });
  sheet.getRange(1, 1, grid.length, width).setVerticalAlignment('middle');
}
