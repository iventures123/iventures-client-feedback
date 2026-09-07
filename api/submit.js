const CONFIG = require('../config');

// Logs every submission to a Google Sheet via an Apps Script Web App.
// Set SHEETS_WEBHOOK_URL as a Vercel environment variable (see README.md).
// If it's not configured yet, we skip logging but still tell the client their
// feedback went through — a Sheets hiccup should never surface to them.
async function logToSheet(payload) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;

  // Each attempt is capped so a slow Apps Script response can't hold the
  // client on the loading spinner.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) return;
    } catch (err) {
      // Timed out or failed outright — retry once, then give up quietly.
    }
  }
  console.error('Sheets logging failed after retry for submission at', payload.timestamp);
}

// The Sheet must show what the CLIENT SAW, not internal ids — 'nps' stays a
// number, but 'rm': 'nirmal' should read "Nirmal Bansal", and a multi-select
// like newNeeds should read as a comma-joined list of labels.
function labelsById(list) {
  return list.reduce((acc, option) => {
    acc[option.id] = option.label;
    return acc;
  }, {});
}

const LABELS = {
  city: labelsById(CONFIG.cities),
  rm: labelsById(CONFIG.team),
  services: labelsById(CONFIG.services),
  rmCoverage: labelsById(CONFIG.rmCoverage),
  reporting: labelsById(CONFIG.reportingTimeliness),
  frequency: labelsById(CONFIG.contactFrequency),
  webinars: labelsById(CONFIG.webinarTopics),
  mailOptIn: labelsById(CONFIG.mailOptIn),
  newNeeds: labelsById(CONFIG.newNeeds),
};
const OVERSEAS_LABELS = labelsById(CONFIG.overseasCities);

function humanize(id) {
  return String(id == null ? '' : id).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Renders one answer as readable text, whether it arrived as a single id or a
// list of them, substituting the client's own words wherever they picked
// the free-text option.
function describe(key, ids, otherText) {
  const list = Array.isArray(ids) ? ids : ids ? [ids] : [];
  return list
    .map((id) => {
      if (id === 'other') return String(otherText || 'Other').trim();
      return (LABELS[key] && LABELS[key][id]) || humanize(id);
    })
    .filter(Boolean)
    .join(', ');
}

// City has one special case: "Overseas" is a category, not an answer, so the
// Sheet should show the country picked underneath it.
function describeCity(answers) {
  const id = Array.isArray(answers.city) ? answers.city[0] : answers.city;
  if (id !== 'overseas') return describe('city', answers.city, answers.cityOther);
  const sub = answers.cityOverseas;
  if (sub === 'other') {
    const typed = String(answers.cityOverseasOther || '').trim();
    return typed ? `Overseas – ${typed}` : 'Overseas';
  }
  return sub && OVERSEAS_LABELS[sub] ? `Overseas – ${OVERSEAS_LABELS[sub]}` : 'Overseas';
}

// Sheets cells cap at 50,000 characters, and appendRow silently drops the
// WHOLE ROW if one cell is oversized — so free text is clamped well below
// that on arrival, generous enough that no genuine answer is ever touched.
const TEXT_LIMITS = { name: 100, phone: 30, email: 100, notes: 1200, other: 200, followUp: 400 };
const FOLLOW_UP_KEYS = ['portfolioNote', 'serviceNote', 'coverageNote', 'rmNote', 'npsNote', 'appNote'];

function clamp(value, max) {
  return String(value == null ? '' : value).slice(0, max);
}

function clampFreeText(answers, notes) {
  const safe = {
    ...answers,
    name: clamp(answers.name, TEXT_LIMITS.name),
    phone: clamp(answers.phone, TEXT_LIMITS.phone),
    email: clamp(answers.email, TEXT_LIMITS.email),
  };
  for (const key of Object.keys(safe)) {
    if (key.endsWith('Other')) safe[key] = clamp(safe[key], TEXT_LIMITS.other);
  }
  for (const key of FOLLOW_UP_KEYS) {
    if (safe[key] != null) safe[key] = clamp(safe[key], TEXT_LIMITS.followUp);
  }
  return { answers: safe, notes: clamp(notes, TEXT_LIMITS.notes) };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  if (!body.answers || typeof body.answers !== 'object') {
    res.status(400).json({ error: 'Missing answers' });
    return;
  }

  const { answers, notes } = clampFreeText(body.answers, body.notes || '');

  const rating = (key) => {
    const n = Math.min(5, Math.max(0, Number(answers[key]) || 0));
    return n ? `${n}/5` : '';
  };
  const nps = Number.isFinite(Number(answers.nps)) && answers.nps !== '' && answers.nps !== undefined
    ? `${Math.min(10, Math.max(0, Number(answers.nps)))}/10`
    : '';

  try {
    await logToSheet({
      // Readable IST, not raw ISO.
      timestamp: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      }),
      name: String(answers.name || '').trim() || '(not given)',
      phone: String(answers.phone || '').trim(),
      email: String(answers.email || '').trim(),
      city: describeCity(answers),
      rm: describe('rm', answers.rm, answers.rmOther),
      services: describe('services', answers.services, answers.servicesOther),
      portfolioRating: rating('portfolioRating'),
      portfolioNote: String(answers.portfolioNote || '').trim(),
      // The service-quality sub-parts, one column each — sent as a flat map
      // keyed by the same row keys config.js defines, so adding a row there
      // needs no change here (only a new column header in Code.gs).
      serviceQualities: CONFIG.serviceQualities.reduce((acc, row) => {
        acc[row.key] = rating(row.key);
        return acc;
      }, {}),
      serviceNote: String(answers.serviceNote || '').trim(),
      rmRating: rating('rmRating'),
      rmNote: String(answers.rmNote || '').trim(),
      nps,
      npsNote: String(answers.npsNote || '').trim(),
      reporting: describe('reporting', answers.reporting, answers.reportingOther),
      frequency: describe('frequency', answers.frequency, answers.frequencyOther),
      rmCoverage: describe('rmCoverage', answers.rmCoverage, answers.rmCoverageOther),
      coverageNote: String(answers.coverageNote || '').trim(),
      // Rated out of 10 like the NPS, not out of 5 like the star questions —
      // and skippable, so an empty cell means "never used it", not "hated it".
      appRating: Number(answers.appRating) ? `${Math.min(10, Math.max(1, Number(answers.appRating)))}/10` : '',
      appNote: String(answers.appNote || '').trim(),
      webinars: describe('webinars', answers.webinars, answers.webinarsOther),
      // Blank means they never answered, which is a "no" — recorded as such
      // rather than left ambiguous for whoever builds the mailing list.
      mailOptIn: answers.mailOptIn ? describe('mailOptIn', answers.mailOptIn) : 'No answer',
      newNeeds: describe('newNeeds', answers.newNeeds, answers.newNeedsOther),
      notes,
    });
  } catch (err) {
    console.error('Building/sending the Sheets payload failed:', err);
  }

  res.status(200).json({ ok: true });
};
