// ---------------------------------------------------------------------------
// Forked from google-reviews-form/iventures-live/app.js, stripped down to a
// private feedback form: no public review generation, no Google post-off,
// just six quick questions logged straight to a Sheet only management reads.
// Every client-specific value lives in config.js — edit that, not this.
// ---------------------------------------------------------------------------

const RM_OPTIONS = CONFIG.team;
const CITY_OPTIONS = CONFIG.cities;
const SERVICE_OPTIONS = CONFIG.services;
const COVERAGE_OPTIONS = CONFIG.rmCoverage;
const NEW_NEEDS_OPTIONS = CONFIG.newNeeds;

const ICONS = {
  name: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  phone: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
  rms: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  services: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
  portfolio: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',
  relationship: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
  recommend: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',
  doc: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
  share: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>',
  mail: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><polyline points="22,6 12,13 2,6"></polyline></svg>',
  calendar: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
  app: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',
  globe: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
  outcome: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
};

// Name of the selected RM, for the personalized "how has X been" question.
// Falls back to a neutral phrase if nothing's been picked yet (shouldn't
// happen — this question comes after the RM pick — or if "Someone else" was
// typed in.
// A question's options/rows can be a function, evaluated at render time —
// the follow-up questions about relationship managers are built out of
// whichever managers the client actually picked.
function questionOptions(q) {
  return typeof q.options === 'function' ? q.options() : (q.options || []);
}
function questionRows(q) {
  return typeof q.rows === 'function' ? q.rows() : (q.rows || []);
}

// Plenty of clients deal with more than one person, so the answer is a list.
function selectedRmIds() {
  const v = state.answers.rm;
  return Array.isArray(v) ? v : (v ? [v] : []);
}

// Whoever the detailed questions are about: the only pick when there's one,
// and the one they nominated as their main contact when there are several.
function primaryRmId() {
  const ids = selectedRmIds();
  if (ids.length <= 1) return ids[0] || '';
  return ids.includes(state.answers.primaryRm) ? state.answers.primaryRm : ids[0];
}

function rmLabelById(id) {
  if (id === 'other') return (state.answers.rmOther || '').trim() || 'Someone else';
  const opt = RM_OPTIONS.find((o) => o.id === id);
  return opt ? opt.label : '';
}

function selectedRmName() {
  const label = rmLabelById(primaryRmId());
  return label || 'them';
}

const QUESTIONS = [
  {
    key: 'name', type: 'text', icon: ICONS.name,
    eyebrow: 'First things first',
    title: 'Quick intro — what’s your name?',
    sub: 'So we know whose feedback this is. Seen and used only by our team.',
    placeholder: 'e.g. Vikram Singhania',
    inputType: 'text', autocomplete: 'name',
    pills: { key: 'city', label: 'Where are you based? (optional)', options: CITY_OPTIONS },
  },
  {
    // Asked second, on purpose: the number is what turns a written complaint
    // into a phone call, and someone who abandons halfway is exactly the
    // client worth calling. Required — email stays optional beside it.
    key: 'phone', type: 'text', icon: ICONS.phone,
    eyebrow: 'So we can reach you',
    title: () => (firstName()
      ? `${firstName()}, what’s the best number to reach you on?`
      : 'What’s the best number to reach you on?'),
    // Function form so an overseas client is asked for a country code and
    // everyone else isn't — the city pill on the previous screen already
    // told us which.
    sub: () => (state.answers.city === 'overseas'
      ? 'So Nirmal or the team can call you back personally. Please include your country code. It stays with our team.'
      : 'So Nirmal or the team can call you back personally about anything you raise. It stays with our team.'),
    placeholder: 'e.g. +91 98765 43210',
    fieldLabel: 'Mobile number (required)',
    inputType: 'tel', autocomplete: 'tel', inputMode: 'tel',
    phoneFree: true,
    // Flexible on purpose: the client can type the number however they like —
    // with or without +91, spaces, dashes, brackets, or any other country code.
    // Only letters are dropped. It is saved exactly as typed.
    // Blocking rule: just needs at least one digit (the field is required).
    validate: (value) => /\d/.test(String(value || '')),
    // Soft rule: a gentle warning (never blocks Continue) when the number
    // doesn't look like a normal 10-digit Indian mobile once a +91 / 91 / 0 /
    // 0091 prefix is set aside. Overseas clients: warn only outside 7-15 digits.
    warn: (value) => {
      let d = String(value || '').replace(/\D/g, '');
      if (!d) return false;
      if (state.answers.city === 'overseas') return d.length < 7 || d.length > 15;
      if (d.startsWith('00')) d = d.slice(2);
      if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
      else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
      return d.length !== 10;
    },
    secondary: {
      key: 'email', label: 'Email (required)', placeholder: 'e.g. vikram@email.com',
      inputType: 'email', autocomplete: 'email', inputMode: 'email',
      // Loose on purpose: an "@", a dot, something either side. A strict
      // pattern that rejects a valid unusual address is worse than one that
      // lets a typo through — a typo still bounces and gets noticed.
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim()),
    },
  },
  {
    // Multi-select: plenty of clients genuinely deal with more than one
    // person, and forcing a single pick points the whole rest of the form at
    // the wrong name.
    key: 'rm', type: 'multi', icon: ICONS.rms,
    eyebrow: 'Your relationship',
    title: 'Who do you deal with at iVentures?',
    sub: 'Pick everyone you work with. None of this is shared back with them.',
    otherPlaceholder: 'Who else do you deal with?',
    options: RM_OPTIONS,
  },
  {
    // Only when they named several. The detailed questions that follow have
    // to be about one person to mean anything, so we ask which one rather
    // than guessing from the order the chips happen to sit in.
    key: 'primaryRm', type: 'single', icon: ICONS.rms,
    eyebrow: 'Your main contact',
    showIf: () => selectedRmIds().length > 1,
    title: 'Which of them do you deal with most?',
    sub: 'The next few questions are about that one person — there is a place for the others straight after.',
    options: () => selectedRmIds().map((id) => {
      const opt = RM_OPTIONS.find((o) => o.id === id);
      return { id, label: rmLabelById(id), sub: opt ? opt.sub : '' };
    }),
  },
  {
    key: 'services', type: 'multi', icon: ICONS.services,
    eyebrow: 'What we look after',
    title: 'Which services are you currently using with us?',
    sub: 'Pick everything that applies — this helps us understand the full relationship.',
    display: 'chips',
    otherPlaceholder: CONFIG.servicesOtherPlaceholder,
    options: SERVICE_OPTIONS,
  },
  {
    key: 'portfolioRating', type: 'stars', icon: ICONS.portfolio,
    eyebrow: 'Your portfolio',
    title: 'Are you happy with your portfolio’s performance and the asset allocation mix?',
    sub: 'Be honest — this is seen and used only by our team, not your RM.',
    followUp: { key: 'portfolioNote', label: 'Want to add anything? (optional)', placeholder: 'e.g. a fund, a decision, the mix between asset classes…' },
  },
  {
    // Its own screen rather than a row in the grid below: timeliness is a
    // yes/no fact with a date attached, not a matter of degree, and "I have
    // to chase for them" is a different problem from "they never come".
    key: 'reporting', type: 'single', icon: ICONS.doc,
    eyebrow: 'Paperwork',
    title: 'Do your tax reports and statements reach you on time?',
    sub: 'Whenever you have needed or asked for them.',
    options: CONFIG.reportingTimeliness,
  },
  {
    // One screen, several sub-parts. A single "rate our service" star tells
    // you a client is unhappy but never which part to fix — this one does.
    key: 'serviceGrid', type: 'grid', icon: ICONS.relationship,
    eyebrow: 'The day to day',
    title: () => (selectedRmName() === 'them'
      ? 'How is your RM doing on each of these?'
      : `How is ${selectedRmName()} doing on each of these?`),
    sub: 'One tap per row — 1 needs work, 5 is excellent.',
    rows: CONFIG.serviceQualities,
    followUp: { key: 'serviceNote', label: 'Want to add anything? (optional)', placeholder: 'e.g. a specific interaction, something that has been missed…' },
  },
  {
    key: 'rmRating', type: 'stars', icon: ICONS.name,
    eyebrow: 'Just between us',
    // Deliberately AFTER the skillset grid and the coverage checklist: this
    // is the overall verdict, and people give a truer one once they've been
    // made to think about the parts rather than before.
    title: () => (selectedRmName() === 'them'
      ? 'Overall, how would you rate your RM across all of this?'
      : `Overall, how would you rate ${selectedRmName()} across all of this?`),
    sub: 'Everything together — knowledge, responsiveness, ideas, the lot. For our team\u2019s eyes only, never shared with your RM.',
    followUp: { key: 'rmNote', label: 'Anything you\u2019d like to tell us about them? (optional)', placeholder: 'Whatever you\u2019d say if they weren\u2019t in the room\u2026' },
  },
  {
    // Everyone else they named, on a single screen. Repeating the seven-row
    // grid per manager would add three screens per extra name and nobody
    // would finish; one considered score each is the honest trade.
    key: 'otherRms', type: 'grid', icon: ICONS.rms,
    eyebrow: 'The others',
    showIf: () => selectedRmIds().length > 1,
    title: 'And how are the others doing?',
    sub: 'One tap each — 1 needs work, 5 is excellent.',
    rows: () => selectedRmIds()
      .filter((id) => id !== primaryRmId())
      .map((id) => {
        const opt = RM_OPTIONS.find((o) => o.id === id);
        return { key: `rmScore_${id}`, label: rmLabelById(id), sub: opt ? opt.sub : '' };
      }),
    followUp: { key: 'otherRmsNote', label: 'Anything to add about any of them? (optional)', placeholder: 'Whatever you would say if they weren’t in the room…' },
  },
  {
    // The single most fixable thing on this form: a client who wants monthly
    // contact and gets it yearly reads as "they never call me", and nobody
    // ever finds out unless asked outright.
    key: 'frequency', type: 'single', icon: ICONS.calendar,
    eyebrow: 'Staying in touch',
    title: 'How often would you like to hear from your wealth RM?',
    sub: 'Tell us what suits you, and we will hold ourselves to it.',
    options: CONFIG.contactFrequency,
  },
  {
    // The app is a different thing from the person — someone can love their
    // RM and find the app unusable, and a single "how are we doing" would
    // never separate the two. Optional, because plenty of clients have never
    // opened it and forcing a score there is how you get noise.
    key: 'appRating', type: 'slider', icon: ICONS.app,
    eyebrow: 'The app',
    title: 'How is your experience with the iVentures Wealth app?',
    sub: 'Drag to rate, and tell us anything that would make it better. Never used it? Just skip ahead.',
    optional: true,
    sliderMin: 1, sliderMax: 10, sliderLowLabel: 'Needs work', sliderHighLabel: 'Excellent',
    sliderWords: CONFIG.appRatingWords,
    issues: {
      key: 'appIssues', threshold: 7,
      label: 'What is getting in the way? (tap any that apply)',
      options: CONFIG.appIssues,
    },
    followUp: { key: 'appNote', label: 'Any feedback or suggestions to improve it? (optional)', placeholder: 'e.g. what you wish it showed, what is hard to find\u2026' },
  },
  {
    key: 'nps', type: 'slider', icon: ICONS.recommend,
    eyebrow: 'The big one',
    title: 'How likely are you to recommend iVentures to a friend or colleague?',
    sub: 'Drag to a number from 0 (not likely) to 10 (extremely likely).',
    sliderMin: 0, sliderMax: 10, sliderLowLabel: 'Not likely', sliderHighLabel: 'Extremely likely',
    followUp: { key: 'npsNote', label: 'What’s the main reason for that score? (optional)', placeholder: 'Totally optional, but it helps us a lot…' },
    // The score and the introduction share a screen on purpose: the moment
    // someone has just weighed up whether they'd recommend us is the one
    // point in the form where "who would you introduce?" follows naturally.
    referralsKey: 'referrals',
  },
  {
    key: 'webinars', type: 'multi', icon: ICONS.calendar,
    eyebrow: 'Invitation only',
    title: 'Which of these sessions would you actually attend?',
    sub: 'Online sessions we curate for private clients only — a small room, a selective few, and room to ask your own questions. Tick anything you would want an invite to.',
    // Shown once they tick something: an invitation list is only worth
    // joining if you know how the invitation is going to reach you.
    pickedNote: 'Noted — we will keep you posted on dates over email and WhatsApp.',
    display: 'chips',
    otherPlaceholder: CONFIG.webinarOtherPlaceholder,
    exclusiveOption: 'none',
    options: CONFIG.webinarTopics,
  },
  {
    // Consent gets its own screen and starts unselected — an opt-in bundled
    // in among other answers, or pre-ticked, is not consent.
    key: 'mailOptIn', type: 'single', icon: ICONS.mail,
    eyebrow: 'Staying in the loop',
    title: 'Would you like us to email you about what we are working on?',
    sub: 'New research, ideas and invitations. Unsubscribe whenever you like — we never pass your details to anyone.',
    options: CONFIG.mailOptIn,
  },
  {
    key: 'newNeeds', type: 'multi', icon: ICONS.outcome,
    eyebrow: 'Looking ahead',
    title: 'Is there anything else on your mind we could help with?',
    sub: 'Pick everything that applies.',
    display: 'chips',
    otherPlaceholder: CONFIG.newNeedsOtherPlaceholder,
    // "Nothing right now" contradicts every other chip, so picking it clears
    // them and picking any of them clears it (see the exclusive handling in
    // the multi-select click handler).
    exclusiveOption: 'nothing',
    options: NEW_NEEDS_OPTIONS,
  },
];

const LOADING_MESSAGES = [
  'Packaging up your feedback…',
  'Sending this straight to our team…',
  'Almost there…',
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const state = {
  stepIndex: -1, // -1 = welcome
  answers: {}, // key -> id / [ids] / text
  notes: '',
};

const totalSteps = QUESTIONS.length + 1; // +1 for notes screen

// ---------------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------------
const el = {
  progressTrack: document.getElementById('progressTrack'),
  progressFill: document.getElementById('progressFill'),
  progressLabel: document.getElementById('progressLabel'),
  startBtn: document.getElementById('startBtn'),
  qIcon: document.getElementById('qIcon'),
  qEyebrow: document.getElementById('qEyebrow'),
  qTitle: document.getElementById('qTitle'),
  qSub: document.getElementById('qSub'),
  choiceGrid: document.getElementById('choiceGrid'),
  textInput: document.getElementById('textInput'),
  textInputLabel: document.getElementById('textInputLabel'),
  secondaryInputWrap: document.getElementById('secondaryInputWrap'),
  secondaryInputLabel: document.getElementById('secondaryInputLabel'),
  secondaryInput: document.getElementById('secondaryInput'),
  contactHint: document.getElementById('contactHint'),
  otherInputWrap: document.getElementById('otherInputWrap'),
  otherInput: document.getElementById('otherInput'),
  pillRowWrap: document.getElementById('pillRowWrap'),
  pillRowLabel: document.getElementById('pillRowLabel'),
  pillRow: document.getElementById('pillRow'),
  pillOtherWrap: document.getElementById('pillOtherWrap'),
  pillOtherLabel: document.getElementById('pillOtherLabel'),
  pillOtherInput: document.getElementById('pillOtherInput'),
  pillSubWrap: document.getElementById('pillSubWrap'),
  pillSubRow: document.getElementById('pillSubRow'),
  pillSubOtherWrap: document.getElementById('pillSubOtherWrap'),
  pillSubOtherInput: document.getElementById('pillSubOtherInput'),
  backBtn: document.getElementById('backBtn'),
  continueBtn: document.getElementById('continueBtn'),
  notesEyebrow: document.getElementById('notesEyebrow'),
  notesTitle: document.getElementById('notesTitle'),
  notesSub: document.getElementById('notesSub'),
  notesInput: document.getElementById('notesInput'),
  notesBackBtn: document.getElementById('notesBackBtn'),
  generateBtn: document.getElementById('generateBtn'),
  loadingText: document.getElementById('loadingText'),
  thankYouTitle: document.getElementById('thankYouTitle'),
  thankYouSubtitle: document.getElementById('thankYouSubtitle'),
  restartBtn: document.getElementById('restartBtn'),
  retryBtn: document.getElementById('retryBtn'),
  errorText: document.getElementById('errorText'),
  toast: document.getElementById('toast'),
};

// ---------------------------------------------------------------------------
// Screen navigation
// ---------------------------------------------------------------------------
function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const screen = document.querySelector(`.screen[data-screen="${name}"]`);
  screen.classList.add('active');

  const heading = screen.querySelector('h1, h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    try { heading.focus({ preventScroll: true }); } catch (e) { heading.focus(); }
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function firstName() {
  const n = (state.answers.name || '').trim();
  return n ? n.split(/\s+/)[0] : '';
}

function updateProgress() {
  if (state.stepIndex < 0) {
    el.progressTrack.hidden = true;
    el.progressLabel.hidden = true;
    return;
  }
  el.progressTrack.hidden = false;
  el.progressLabel.hidden = false;
  const step = Math.min(state.stepIndex + 1, totalSteps);
  const pct = state.submitted ? 100 : Math.round((step / (totalSteps + 1)) * 100);
  const milestone = state.submitted ? 'Complete' : pct < 40 ? 'Getting started' : pct < 75 ? 'Halfway there' : 'Almost done';
  el.progressFill.style.width = pct + '%';
  el.progressLabel.textContent = `${milestone} · ${pct}%`;
  el.progressLabel.classList.toggle('progress-label-final', pct >= 75);
  el.progressTrack.setAttribute('aria-valuenow', String(pct));
  el.progressTrack.setAttribute('aria-valuetext', `${milestone}, ${pct} percent complete`);
}

function goToStep(index, fromHistory) {
  state.stepIndex = index;
  updateProgress();

  if (!fromHistory) history.pushState({ step: index, token: pageToken }, '');

  if (index === totalSteps - 1) {
    if (!fromHistory) {
      const name = firstName();
      showToast(name ? `Nice, ${name} — almost done!` : 'Nice — almost done!');
    }
    renderNotesScreen();
    showScreen('notes');
    return;
  }

  const q = QUESTIONS[index];
  renderQuestion(q);
  showScreen('question');
}

// Optional single-select row of small pills under the main question (city).
function renderPillRow(q) {
  if (!q.pills) { el.pillRowWrap.hidden = true; return; }
  el.pillRowWrap.hidden = false;
  el.pillRowLabel.textContent = q.pills.label;
  el.pillRow.setAttribute('aria-label', q.pills.label);
  el.pillRow.innerHTML = '';

  const current = state.answers[q.pills.key];

  q.pills.options.forEach((opt) => {
    const b = document.createElement('button');
    b.type = 'button';
    const selected = current === opt.id;
    b.className = 'pill' + (selected ? ' selected' : '');
    b.setAttribute('aria-pressed', String(selected));
    b.textContent = opt.label;
    b.addEventListener('click', () => {
      buzz();
      state.answers[q.pills.key] = selected ? '' : opt.id;
      renderPillRow(q);
      updateContinueVisibility(q);
      if (!selected && opt.hasOther) el.pillOtherInput.focus();
    });
    el.pillRow.appendChild(b);
  });

  const otherOpt = q.pills.options.find((o) => o.hasOther && current === o.id);
  el.pillOtherWrap.hidden = !otherOpt;
  if (otherOpt) {
    const otherKey = `${q.pills.key}Other`;
    el.pillOtherLabel.textContent = otherOpt.placeholder || 'Tell us more';
    el.pillOtherInput.placeholder = otherOpt.placeholder || 'Tell us more…';
    el.pillOtherInput.value = state.answers[otherKey] || '';
    el.pillOtherInput.oninput = () => { state.answers[otherKey] = el.pillOtherInput.value; };
  }

  renderOverseasRow(q.pills.key === 'city' && current === 'overseas');
}

// One-off, not a generic "nested pills" system — city is the only field that
// needs a second level.
function renderOverseasRow(show) {
  el.pillSubWrap.hidden = !show;
  if (!show) return;

  const subCurrent = state.answers.cityOverseas;
  el.pillSubRow.innerHTML = '';
  CONFIG.overseasCities.forEach((opt) => {
    const b = document.createElement('button');
    b.type = 'button';
    const selected = subCurrent === opt.id;
    b.className = 'pill' + (selected ? ' selected' : '');
    b.setAttribute('aria-pressed', String(selected));
    b.textContent = opt.label;
    b.addEventListener('click', () => {
      buzz();
      state.answers.cityOverseas = selected ? '' : opt.id;
      renderOverseasRow(true);
      if (!selected && opt.hasOther) el.pillSubOtherInput.focus();
    });
    el.pillSubRow.appendChild(b);
  });

  const subOtherOpt = CONFIG.overseasCities.find((o) => o.hasOther && subCurrent === o.id);
  el.pillSubOtherWrap.hidden = !subOtherOpt;
  if (subOtherOpt) {
    el.pillSubOtherInput.value = state.answers.cityOverseasOther || '';
    el.pillSubOtherInput.oninput = () => { state.answers.cityOverseasOther = el.pillSubOtherInput.value; };
  }
}

function renderQuestion(q) {
  el.qIcon.innerHTML = q.icon || '';
  el.qEyebrow.style.display = '';
  el.qEyebrow.textContent = q.eyebrow || `Step ${state.stepIndex + 1} of ${totalSteps}`;
  el.qTitle.textContent = typeof q.title === 'function' ? q.title() : q.title;
  // Function form, same as the title: lets a question's sub-line react to an
  // earlier answer (the phone screen asks an overseas client for a country
  // code and nobody else).
  const subText = typeof q.sub === 'function' ? q.sub() : q.sub;
  el.qSub.textContent = subText || '';
  el.qSub.style.display = subText ? 'block' : 'none';

  el.choiceGrid.innerHTML = '';
  el.choiceGrid.className = 'choice-grid' + (q.display === 'chips' ? ' chips' : '');
  el.otherInputWrap.hidden = true;
  el.secondaryInputWrap.hidden = true;
  // #textInputLabel and #contactHint are single elements shared by every
  // screen, and the contact question turns both of them on. Reset them here,
  // with the other shared-element resets, or "Mobile number (required)" and a
  // stale "that email looks off" hint follow the client through the rest of
  // the form — which is exactly what they did.
  el.textInputLabel.className = 'sr-only';
  if (el.contactHint) el.contactHint.hidden = true;
  el.otherInput.value = state.answers[`${q.key}Other`] || '';
  el.otherInput.placeholder = q.otherPlaceholder || 'Tell us more…';

  renderPillRow(q);

  if (q.pills) {
    if (q.type === 'text') el.textInput.after(el.pillRowWrap);
    else el.choiceGrid.before(el.pillRowWrap);
  }

  if (q.type === 'text') {
    el.choiceGrid.hidden = true;
    el.textInput.hidden = false;
    // A visible field label when the question sets one, so "(required)" sits
    // right above the box it applies to. Continue stays disabled until the
    // number is plausible, and a disabled button swallows the tap with no
    // explanation — without the word "required" on screen that's a silent
    // dead end. Falls back to the screen-reader-only label otherwise.
    if (q.fieldLabel) {
      el.textInputLabel.textContent = q.fieldLabel;
      el.textInputLabel.className = 'secondary-input-label';
    } else {
      el.textInputLabel.textContent = typeof q.title === 'function' ? q.title() : q.title;
      el.textInputLabel.className = 'sr-only';
    }
    el.textInput.placeholder = q.placeholder || '';
    // type, not just inputMode: it's what gets a phone the numeric keypad and
    // lets the browser offer the right saved value to autofill. Reset per
    // render because this is one shared input reused by every text question.
    el.textInput.type = q.inputType || 'text';
    el.textInput.autocomplete = q.autocomplete || 'off';
    el.textInput.inputMode = q.inputMode || '';
    el.textInput.value = state.answers[q.key] || '';
    el.textInput.oninput = () => {
      // No letters or symbols, and no more than the fixed length — done on
      // the value rather than maxlength so a pasted "+91 98765 43210" survives.
      if (q.phoneFree) {
        // Keep digits and normal phone punctuation (+ space - ( ) .), drop
        // letters, cap at 25 characters. Nothing is reformatted.
        const cleaned = el.textInput.value.replace(/[^\d+\s\-().]/g, '').slice(0, 25);
        if (el.textInput.value !== cleaned) el.textInput.value = cleaned;
      }
      state.answers[q.key] = el.textInput.value;
      updateContinueVisibility(q);
      updateContactHint(q);
    };
    el.textInput.onkeydown = (event) => {
      // Enter follows exactly the same rule as the Continue button, so the
      // keyboard can't sneak past a check the button enforces.
      const canAdvance = isTextAnswerValid(q);
      if (event.key === 'Enter' && canAdvance) {
        event.preventDefault();
        el.textInput.blur();
        advance();
      }
    };

    // Second field on the same screen (phone + email). A plain second text
    // input rather than a generic "N fields per screen" system — this is the
    // only question that needs one.
    if (q.secondary) {
      el.secondaryInputWrap.hidden = false;
      el.secondaryInputLabel.textContent = q.secondary.label || '';
      el.secondaryInput.placeholder = q.secondary.placeholder || '';
      el.secondaryInput.type = q.secondary.inputType || 'text';
      el.secondaryInput.autocomplete = q.secondary.autocomplete || 'off';
      el.secondaryInput.inputMode = q.secondary.inputMode || '';
      el.secondaryInput.value = state.answers[q.secondary.key] || '';
      el.secondaryInput.oninput = () => {
        state.answers[q.secondary.key] = el.secondaryInput.value;
        updateContactHint(q);
        updateContinueVisibility(q);
      };
      updateContactHint(q);
      el.secondaryInput.onkeydown = (event) => {
        if (event.key === 'Enter') { event.preventDefault(); el.secondaryInput.blur(); advance(); }
      };
    } else {
      el.secondaryInputWrap.hidden = true;
    }

    updateContinueVisibility(q);
    el.continueBtn.hidden = false;
    setTimeout(() => el.textInput.focus(), 300);
    return;
  }

  if (q.type === 'stars') {
    renderStars(q);
    return;
  }

  if (q.type === 'slider') {
    renderSlider(q);
    return;
  }

  if (q.type === 'grid') {
    renderGrid(q);
    return;
  }

  el.choiceGrid.hidden = false;
  el.textInput.hidden = true;

  const current = state.answers[q.key];
  const isMulti = q.type === 'multi';

  questionOptions(q).forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice';
    const isSelected = isMulti
      ? Array.isArray(current) && current.includes(opt.id)
      : current === opt.id;
    if (isSelected) btn.classList.add('selected');
    btn.setAttribute('aria-pressed', String(isSelected));

    btn.innerHTML = `
      <span class="choice-main"><span>${opt.label}${opt.sub ? `<span class="choice-sub">${opt.sub}</span>` : ''}</span></span>
      <span class="check">${isSelected ? checkIcon() : ''}</span>
    `;

    btn.addEventListener('click', () => {
      buzz();
      if (isMulti) {
        const set = new Set(Array.isArray(state.answers[q.key]) ? state.answers[q.key] : []);
        if (set.has(opt.id)) {
          set.delete(opt.id);
        } else {
          set.add(opt.id);
          // "Nothing right now" and an actual request are contradictory
          // answers; whichever was tapped last wins rather than both landing
          // in the Sheet for someone to puzzle over.
          if (q.exclusiveOption) {
            if (opt.id === q.exclusiveOption) { set.clear(); set.add(opt.id); }
            else set.delete(q.exclusiveOption);
          }
        }
        state.answers[q.key] = Array.from(set);
        // An exclusive pick can deselect buttons other than the one tapped,
        // so repaint the whole grid rather than just this button.
        if (q.exclusiveOption) {
          const opts = questionOptions(q);
          el.choiceGrid.querySelectorAll('.choice').forEach((b, i) => paintChoice(b, set.has(opts[i].id)));
        } else {
          paintChoice(btn, set.has(opt.id));
        }
        syncOtherInput(q);
        toggleFollowUp(q);
        updateContinueVisibility(q);
      } else {
        state.answers[q.key] = opt.id;
        el.choiceGrid.querySelectorAll('.choice').forEach((b) => paintChoice(b, b === btn));
        syncOtherInput(q);
        toggleFollowUp(q);
        updateContinueVisibility(q);
        if (opt.hasOther) el.otherInput.focus();
      }
    });

    el.choiceGrid.appendChild(btn);
  });

  // Choice questions get an optional comment box as well, so "anything you'd
  // want to hear more about" isn't only askable on a rating screen. Hidden
  // until something is picked — a comment box above an untouched list of
  // chips just reads as more work.
  renderFollowUp(q, el.choiceGrid, hasSelection(q));
  renderPickedNote(q, el.choiceGrid, hasSelection(q));

  syncOtherInput(q);
  updateContinueVisibility(q);
}

// True once this question has at least one option selected, for either shape
// of answer (a single id, or an array of them).
function hasSelection(q) {
  const current = state.answers[q.key];
  return Array.isArray(current) ? current.length > 0 : !!current;
}

// Shows the follow-up box once the question has an answer. Needed because the
// choice grid repaints buttons in place rather than re-rendering, so nothing
// else would ever unhide it.
function toggleFollowUp(q) {
  const answered = hasSelection(q);
  if (q.followUp) {
    const wrap = el.choiceGrid.querySelector('.rating-followup');
    if (wrap) wrap.hidden = !answered;
  }
  if (q.pickedNote) {
    const note = el.choiceGrid.querySelector('.picked-note');
    if (note) note.hidden = !answered;
  }
}

// A plain confirmation line under a choice question — what happens next, once
// they've actually chosen something.
function renderPickedNote(q, container, show) {
  if (!q.pickedNote) return null;
  const note = document.createElement('p');
  note.className = 'picked-note';
  note.hidden = !show;
  note.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  const span = document.createElement('span');
  span.textContent = q.pickedNote;
  note.appendChild(span);
  container.appendChild(note);
  return note;
}

// Advisory only — these fields are optional and this never blocks Continue.
// It exists because the cost of a silent typo is asymmetric: a wrong email
// means our follow-up on someone's complaint simply never arrives, and
// neither side ever finds out. Deliberately loose (an "@" and a dot, a
// plausible digit count) rather than a strict pattern — a regex that rejects
// a valid unusual address is worse than one that lets a wrong one through.
function updateContactHint(q) {
  if (!el.contactHint || !q.secondary) return;
  const phone = (state.answers[q.key] || '').trim();
  const email = (state.answers[q.secondary.key] || '').trim();
  // Only complain about a number once they've started typing one — an empty
  // field on arrival isn't a mistake, and the "(required)" label already says
  // what's needed.
  // Each field is judged by its OWN rule. isTextAnswerValid() answers "can
  // this screen advance", which now folds in both — using it here would blame
  // the number for a bad email address.
  const phoneBad = !!phone && q.validate && !q.validate(phone);
  const phoneWarn = !!phone && !phoneBad && !!q.warn && q.warn(phone);
  const emailBad = !!email && q.secondary.validate && !q.secondary.validate(email);

  if (!phoneBad && !emailBad && !phoneWarn) { el.contactHint.hidden = true; el.contactHint.style.color = ''; return; }
  el.contactHint.hidden = false;

  // Phone looks unusual but is allowed: a soft, amber reminder that never
  // blocks Continue. Shown on its own, or alongside an email problem.
  if (phoneWarn) {
    const warnText = state.answers.city === 'overseas'
      ? 'Just checking — that number looks unusual. Please make sure it includes your country code. You can still continue.'
      : 'Just checking — Indian mobile numbers have 10 digits. If this is an overseas number or it is correct, you can still continue.';
    el.contactHint.textContent = emailBad
      ? warnText + ' Also, that email address does not look right — please check it.'
      : warnText;
    el.contactHint.style.color = emailBad ? '' : '#8a6100';
    return;
  }
  el.contactHint.style.color = '';

  // Both fields block Continue now, so neither message may promise the client
  // can carry on regardless.
  if (phoneBad && emailBad) {
    el.contactHint.textContent = 'That number and that email address both look incomplete — please check them.';
  } else if (phoneBad) {
    el.contactHint.textContent = 'Please enter a phone number we can reach you on.';
  } else {
    el.contactHint.textContent = 'That email address does not look right — please check it.';
  }
}

function paintChoice(btn, selected) {
  btn.classList.toggle('selected', selected);
  btn.setAttribute('aria-pressed', String(selected));
  btn.querySelector('.check').innerHTML = selected ? checkIcon() : '';
}

function syncOtherInput(q) {
  if (!q.options) { el.otherInputWrap.hidden = true; return; }
  const opts = questionOptions(q);
  const current = state.answers[q.key];
  const selectedIds = Array.isArray(current) ? current : current ? [current] : [];
  const wanted = opts.some((o) => o.hasOther && selectedIds.includes(o.id));
  el.otherInputWrap.hidden = !wanted;
  if (wanted) {
    el.otherInput.oninput = () => {
      state.answers[`${q.key}Other`] = el.otherInput.value;
      updateContinueVisibility(q);
    };
  }
}

const RATING_WORDS = CONFIG.ratingWords;

function renderStars(q) {
  el.choiceGrid.hidden = false;
  el.textInput.hidden = true;
  el.choiceGrid.className = 'choice-grid stars-grid';
  el.choiceGrid.innerHTML = '';

  const current = Number(state.answers[q.key]) || 0;

  const row = document.createElement('div');
  row.className = 'star-row';
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', 'Star rating, 1 to 5');

  for (let n = 1; n <= 5; n++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'star' + (n <= current ? ' on' : '');
    b.setAttribute('aria-label', `${n} star${n > 1 ? 's' : ''} — ${RATING_WORDS[n]}`);
    b.setAttribute('aria-pressed', String(n === current));
    b.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7.3L12 17.6 5.8 21.5l1.6-7.3L2 9.5l7.1-.6z"/></svg>';
    b.addEventListener('click', () => {
      buzz();
      state.answers[q.key] = n;
      renderStars(q);
      if (n === 5) celebrateFiveStars();
    });
    row.appendChild(b);
  }

  const caption = document.createElement('p');
  caption.className = 'star-caption';
  caption.setAttribute('aria-live', 'polite');
  caption.textContent = current ? RATING_WORDS[current] : 'Tap to rate';

  el.choiceGrid.appendChild(row);
  el.choiceGrid.appendChild(caption);
  renderFollowUp(q, el.choiceGrid, current > 0);

  el.continueBtn.hidden = false;
  el.continueBtn.disabled = !current;
}

// A question with sub-parts: several things rated 1-5 on one screen, so the
// client answers "how are we doing" once but management can see WHICH part
// is weak. Rendered as one compact scale per row rather than six separate
// star screens — six screens of stars is where a form starts feeling long,
// and identical star rows back-to-back invite autopilot answering.
function renderGrid(q) {
  el.choiceGrid.hidden = false;
  el.textInput.hidden = true;
  el.choiceGrid.className = 'choice-grid grid-grid';
  el.choiceGrid.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'grid-rows';

  questionRows(q).forEach((row) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'grid-row';

    const head = document.createElement('div');
    head.className = 'grid-row-head';
    const label = document.createElement('span');
    label.className = 'grid-row-label';
    label.textContent = row.label;
    head.appendChild(label);
    if (row.sub) {
      const sub = document.createElement('span');
      sub.className = 'grid-row-sub';
      sub.textContent = row.sub;
      head.appendChild(sub);
    }

    const scale = document.createElement('div');
    scale.className = 'grid-scale';
    scale.setAttribute('role', 'group');
    scale.setAttribute('aria-label', `${row.label}, rate 1 to 5`);

    for (let n = 1; n <= 5; n++) {
      const b = document.createElement('button');
      b.type = 'button';
      const selected = Number(state.answers[row.key]) === n;
      b.className = 'grid-dot' + (selected ? ' selected' : '');
      b.textContent = String(n);
      b.setAttribute('aria-pressed', String(selected));
      b.setAttribute('aria-label', `${row.label}: ${n} out of 5 — ${RATING_WORDS[n]}`);
      b.addEventListener('click', () => {
        buzz();
        state.answers[row.key] = n;
        // Repaint just this row — a full re-render would drop the element
        // under the user's finger mid-tap, the same reason paintChoice()
        // exists for the choice grid.
        scale.querySelectorAll('.grid-dot').forEach((other, i) => {
          const on = i + 1 === n;
          other.classList.toggle('selected', on);
          other.setAttribute('aria-pressed', String(on));
        });
        updateGridProgress(q);
        updateContinueVisibility(q);
      });
      scale.appendChild(b);
    }

    rowEl.append(head, scale);

    // Anchors under the first row only. The sub-line explains the scale, but
    // it scrolls away on a phone by the third row — and a bare row of digits
    // with no anchor is where people start guessing which end is good.
    // Repeating them on all six rows is noise; once at the top is enough.
    if (!wrap.childElementCount) {
      const anchors = document.createElement('div');
      anchors.className = 'grid-anchors';
      const low = document.createElement('span');
      low.textContent = 'Needs work';
      const high = document.createElement('span');
      high.textContent = 'Excellent';
      anchors.append(low, high);
      rowEl.appendChild(anchors);
    }

    wrap.appendChild(rowEl);
  });

  el.choiceGrid.appendChild(wrap);

  // Says how many rows are left. Without it, Continue sits disabled with no
  // explanation on a screen with six separate things to answer — the exact
  // situation where a silent disabled button reads as a broken form.
  const counter = document.createElement('p');
  counter.className = 'grid-counter';
  counter.id = 'gridCounter';
  counter.setAttribute('aria-live', 'polite');
  el.choiceGrid.appendChild(counter);

  renderFollowUp(q, el.choiceGrid, gridAnsweredCount(q) > 0);
  updateGridProgress(q);
}

function gridAnsweredCount(q) {
  return questionRows(q).filter((row) => Number(state.answers[row.key]) > 0).length;
}

function updateGridProgress(q) {
  const counter = document.getElementById('gridCounter');
  const done = gridAnsweredCount(q);
  const total = questionRows(q).length;
  if (counter) {
    counter.textContent = done === total ? 'All done — thank you' : `${done} of ${total} answered`;
    counter.classList.toggle('grid-counter-done', done === total);
  }
  // The follow-up box is built hidden when nothing is rated yet; reveal it as
  // soon as there's something to comment on.
  const followUp = el.choiceGrid.querySelector('.rating-followup');
  if (followUp && done > 0) followUp.hidden = false;
}

// Optional free-text box under a star, slider or grid question — same idea as
// the "Other" field on a choice question, but for a rating: appears once the
// client has actually answered, never gates Continue, and is never required.
function renderFollowUp(q, container, show) {
  if (!q.followUp) return null;
  const wrap = document.createElement('div');
  wrap.className = 'rating-followup';
  wrap.hidden = !show;
  const label = document.createElement('label');
  label.className = 'rating-followup-label';
  label.textContent = q.followUp.label;
  label.htmlFor = 'ratingFollowUpInput';
  const input = document.createElement('textarea');
  input.id = 'ratingFollowUpInput';
  input.className = 'notes-textarea rating-followup-input';
  input.maxLength = 400;
  input.placeholder = q.followUp.placeholder || '';
  input.value = state.answers[q.followUp.key] || '';
  input.addEventListener('input', () => { state.answers[q.followUp.key] = input.value; });
  wrap.append(label, input);
  container.appendChild(wrap);
  return wrap;
}

function celebrateFiveStars() {
  const row = el.choiceGrid.querySelector('.star-row');
  if (!row) return;
  const burst = document.createElement('div');
  burst.className = 'star-burst';
  const COUNT = 10;
  for (let i = 0; i < COUNT; i++) {
    const spark = document.createElement('span');
    const angle = (i / COUNT) * Math.PI * 2;
    const radius = 40 + (i % 3) * 12;
    spark.style.setProperty('--dx', `${Math.cos(angle) * radius}px`);
    spark.style.setProperty('--dy', `${Math.sin(angle) * radius}px`);
    spark.style.animationDelay = `${(i % 3) * 0.03}s`;
    if (i % 2) spark.classList.add('bronze');
    burst.appendChild(spark);
  }
  row.appendChild(burst);
}

function renderSlider(q) {
  el.choiceGrid.hidden = false;
  el.textInput.hidden = true;
  el.choiceGrid.className = 'choice-grid slider-grid';
  el.choiceGrid.innerHTML = '';

  const min = q.sliderMin ?? 1;
  const max = q.sliderMax ?? 10;
  const current = state.answers[q.key];
  const hasAnswer = current !== undefined && current !== '';

  const wrap = document.createElement('div');
  wrap.className = 'slider-wrap';

  const valueDisplay = document.createElement('p');
  valueDisplay.className = 'slider-value';
  valueDisplay.setAttribute('aria-live', 'polite');
  valueDisplay.textContent = hasAnswer ? `${current} / ${max}` : 'Drag to rate';

  // A word for every point on the scale. "Needs work" and "Excellent" at the
  // two ends leave everything between them to interpretation, so a 6 means
  // whatever the person happens to think 6 means.
  const words = q.sliderWords || null;
  const captionFor = (v) => (words && words[v]) || '';
  const caption = document.createElement('p');
  caption.className = 'slider-caption';
  caption.setAttribute('aria-live', 'polite');
  caption.textContent = hasAnswer ? captionFor(current) : '';
  caption.hidden = !(words && hasAnswer);

  const input = document.createElement('input');
  input.type = 'range';
  input.className = 'slider-input';
  input.classList.toggle('slider-untouched', !hasAnswer);
  input.min = String(min);
  input.max = String(max);
  input.step = '1';
  input.value = String(hasAnswer ? current : Math.round((min + max) / 2));
  input.setAttribute('aria-label', typeof q.title === 'function' ? q.title() : q.title);
  input.setAttribute('aria-valuetext', hasAnswer ? `${current} out of ${max}` : 'Not yet rated');
  const setPct = (value) => input.style.setProperty('--pct', String(((value - min) / (max - min)) * 100));
  setPct(Number(input.value));

  const labels = document.createElement('div');
  labels.className = 'slider-labels';
  const lowLabel = document.createElement('span');
  lowLabel.textContent = q.sliderLowLabel || '';
  const highLabel = document.createElement('span');
  highLabel.textContent = q.sliderHighLabel || '';
  labels.append(lowLabel, highLabel);

  input.addEventListener('input', () => {
    buzz();
    const value = Number(input.value);
    state.answers[q.key] = value;
    valueDisplay.textContent = `${value} / ${max}`;
    if (words) { caption.textContent = captionFor(value); caption.hidden = false; }
    valueDisplay.setAttribute('aria-live', 'off');
    input.classList.remove('slider-untouched');
    input.setAttribute('aria-valuetext', `${value} out of ${max}`);
    setPct(value);
    el.continueBtn.disabled = false;
  });
  input.addEventListener('change', () => valueDisplay.setAttribute('aria-live', 'polite'));
  // Releasing on the starting value fires no 'input' event, so the midpoint
  // (5) could never be picked and Continue stayed disabled. Treat it as one.
  input.addEventListener('pointerup', () => {
    if (input.classList.contains('slider-untouched')) input.dispatchEvent(new Event('input'));
  });

  wrap.append(valueDisplay, caption, input, labels);
  el.choiceGrid.appendChild(wrap);

  // Issue picker for a low score. "The app is a 4" is nothing an engineer can
  // act on; "hard to find what I need" is. Cleared if the client drags back
  // up, so a 9/10 never arrives with a complaint still attached to it.
  let issuesWrap = null;
  if (q.issues) {
    issuesWrap = document.createElement('div');
    issuesWrap.className = 'app-issues';
    const issuesLabel = document.createElement('p');
    issuesLabel.className = 'rating-followup-label';
    issuesLabel.textContent = q.issues.label;
    const row = document.createElement('div');
    row.className = 'pill-row issue-row';
    q.issues.options.forEach((opt) => {
      const b = document.createElement('button');
      b.type = 'button';
      const picked = () => (Array.isArray(state.answers[q.issues.key]) ? state.answers[q.issues.key] : []).includes(opt.id);
      b.className = 'pill' + (picked() ? ' selected' : '');
      b.setAttribute('aria-pressed', String(picked()));
      b.textContent = opt.label;
      b.addEventListener('click', () => {
        buzz();
        const set = new Set(Array.isArray(state.answers[q.issues.key]) ? state.answers[q.issues.key] : []);
        if (set.has(opt.id)) set.delete(opt.id); else set.add(opt.id);
        state.answers[q.issues.key] = Array.from(set);
        b.classList.toggle('selected', set.has(opt.id));
        b.setAttribute('aria-pressed', String(set.has(opt.id)));
      });
      row.appendChild(b);
    });
    issuesWrap.append(issuesLabel, row);
    issuesWrap.hidden = !(hasAnswer && Number(current) <= q.issues.threshold);
    el.choiceGrid.appendChild(issuesWrap);
  }
  // Unlike stars (which fully re-render on every tap), dragging the slider
  // updates the DOM in place via the 'input' listener below — so the
  // follow-up box, once built, needs to unhide itself there rather than
  // waiting for a re-render that never comes.
  const followUpWrap = renderFollowUp(q, el.choiceGrid, hasAnswer);

  input.addEventListener('input', () => {
    if (followUpWrap) followUpWrap.hidden = false;
    if (issuesWrap) {
      const show = Number(input.value) <= q.issues.threshold;
      issuesWrap.hidden = !show;
      if (!show) state.answers[q.issues.key] = [];
    }
  });

  // The introduction sits on this screen too, in its own container, so adding
  // or removing someone repaints only itself and leaves the slider alone.
  if (q.referralsKey) {
    const refWrap = document.createElement('div');
    el.choiceGrid.appendChild(refWrap);
    renderReferralBlock(q, refWrap);
  }

  el.continueBtn.hidden = false;
  // 0 is a valid, meaningful NPS answer, so gate on "has it been touched",
  // not on truthiness the way the star questions do. An `optional` slider
  // (the app question — plenty of clients have never opened it) never gates
  // at all.
  el.continueBtn.disabled = q.optional ? false : !hasAnswer;
}

// One rule for whether a text question is answered well enough to move on,
// used by both the Continue button and the Enter key. `optional` skips the
// check entirely; `validate` replaces the default "not blank" test.
function isTextAnswerValid(q) {
  if (q.optional) return true;
  const value = state.answers[q.key] || '';
  const primaryOk = q.validate ? q.validate(value) : !!value.trim();
  if (!primaryOk) return false;
  // A second field on the same screen gates Continue too when it carries its
  // own check — the contact screen needs both a number and an address.
  if (q.secondary && q.secondary.validate) {
    return q.secondary.validate(state.answers[q.secondary.key] || '');
  }
  return true;
}

// ---------------------------------------------------------------------------
// Referrals
// ---------------------------------------------------------------------------
// A short list of {name, phone} the client chooses to share. Two ways in:
// the browser's Contact Picker where it exists, and typing, which always
// works. Manual entry is NOT a fallback bolted on afterwards — the picker is
// Chrome-on-Android only, and a good share of this client base is on an
// iPhone, where typing is the only path there will ever be.
const MAX_REFERRALS = 10;

// Feature-detect rather than sniff the user agent. Safari, Firefox and every
// desktop browser land here and simply never see the button.
function contactPickerSupported() {
  return typeof navigator !== 'undefined'
    && 'contacts' in navigator
    && navigator.contacts
    && typeof navigator.contacts.select === 'function'
    && 'ContactsManager' in window;
}

function referralList(q) {
  const list = state.answers[q.referralsKey];
  return Array.isArray(list) ? list : [];
}

// The picker is entirely user-mediated: the browser draws it, and the page
// receives only the people tapped. We never read, and could never read, the
// address book itself.
async function pickFromContacts(q, wrap) {
  let picked;
  try {
    picked = await navigator.contacts.select(['name', 'tel'], { multiple: true });
  } catch (err) {
    // Cancelled, or the browser refused. Nothing to report — the typing path
    // is right there.
    return;
  }
  if (!picked || !picked.length) return;

  const list = referralList(q).slice();
  picked.forEach((c) => {
    const name = (c.name && c.name[0] ? String(c.name[0]) : '').trim().slice(0, 100);
    const phone = (c.tel && c.tel[0] ? String(c.tel[0]) : '').trim().slice(0, 30);
    if (!name && !phone) return;
    // Same person twice (picked already, or listed twice on the phone) is a
    // duplicate row for whoever calls them.
    const dupe = list.some((r) => r.phone.replace(/\D/g, '') === phone.replace(/\D/g, '') && phone);
    if (!dupe) list.push({ name, phone });
  });
  state.answers[q.referralsKey] = list.slice(0, MAX_REFERRALS);
  buzz();
  renderReferralBlock(q, wrap);
}

function renderReferralBlock(q, wrap) {
  const key = q.referralsKey;
  wrap.innerHTML = '';
  wrap.className = 'referral-wrap';

  const heading = document.createElement('p');
  heading.className = 'referral-heading';
  // "Finances" is the word a bank uses; "wealth deserves the same attention"
  // is the one a client uses, and it flatters both sides of the introduction
  // — it implies the attention they are getting is worth passing on.
  heading.textContent = firstName()
    ? `${firstName()}, is there someone in your circle whose wealth deserves the same attention?`
    : 'Is there someone in your circle whose wealth deserves the same attention?';
  wrap.appendChild(heading);

  const blurb = document.createElement('p');
  blurb.className = 'referral-privacy';
  blurb.textContent = 'Entirely optional. Leave a name and number and we will reach out personally, with your introduction — never before it.';
  wrap.appendChild(blurb);

  const list = referralList(q);

  if (contactPickerSupported() && list.length < MAX_REFERRALS) {
    const pick = document.createElement('button');
    pick.type = 'button';
    pick.className = 'btn btn-secondary referral-pick';
    pick.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg><span>Choose from my contacts</span>';
    pick.addEventListener('click', () => pickFromContacts(q, wrap));
    wrap.appendChild(pick);

    const hint = document.createElement('p');
    hint.className = 'referral-privacy';
    hint.textContent = 'Your phone shows you the picker — we only ever receive the people you tap.';
    wrap.appendChild(hint);

    const or = document.createElement('p');
    or.className = 'referral-or';
    or.innerHTML = '<span>or type their details</span>';
    wrap.appendChild(or);
  }

  if (list.length < MAX_REFERRALS) {
    const form = document.createElement('div');
    form.className = 'referral-form';

    const nameIn = document.createElement('input');
    nameIn.type = 'text'; nameIn.className = 'text-input referral-input';
    nameIn.placeholder = 'Their name'; nameIn.maxLength = 100;
    nameIn.setAttribute('aria-label', 'Name of the person you are introducing');

    const telIn = document.createElement('input');
    telIn.type = 'tel'; telIn.className = 'text-input referral-input';
    telIn.placeholder = 'Their number'; telIn.maxLength = 30; telIn.inputMode = 'tel';
    telIn.setAttribute('aria-label', 'Their phone number');

    // A native <select> rather than another chip row: one tap on a phone,
    // keyboard and screen-reader support for free, and it can't be mistaken
    // for one of the form's own multi-selects.
    const relIn = document.createElement('select');
    relIn.className = 'text-input referral-input referral-relation';
    relIn.setAttribute('aria-label', 'How you know them');
    const ph = document.createElement('option');
    ph.value = ''; ph.textContent = 'How you know them';
    ph.disabled = true; ph.selected = true;
    relIn.appendChild(ph);
    CONFIG.referralRelations.forEach((r) => {
      const o = document.createElement('option');
      o.value = r.id; o.textContent = r.label;
      relIn.appendChild(o);
    });

    const add = document.createElement('button');
    add.type = 'button'; add.className = 'btn btn-secondary referral-add';
    add.textContent = 'Add';

    const valid = () => {
      const digits = telIn.value.replace(/\D/g, '');
      return nameIn.value.trim().length > 0 && digits.length >= 7 && digits.length <= 15;
    };
    const sync = () => { add.disabled = !valid(); };
    sync();
    nameIn.addEventListener('input', sync);
    telIn.addEventListener('input', () => { telIn.value = telIn.value.replace(/[^\d+\s-]/g, ''); sync(); });

    const commit = () => {
      if (!valid()) return;
      const rel = CONFIG.referralRelations.find((r) => r.id === relIn.value);
      state.answers[key] = referralList(q).concat([{
        name: nameIn.value.trim().slice(0, 100),
        phone: telIn.value.trim().slice(0, 30),
        // Not gated on: someone who fills in a name and number and ignores
        // the dropdown should still be able to add them.
        relation: rel ? rel.label : '',
      }]).slice(0, MAX_REFERRALS);
      buzz();
      renderReferralBlock(q, wrap);
      // Straight back to the name field: someone adding one person often has
      // a second in mind, and hunting for the box again is where they stop.
      const next = wrap.querySelector('.referral-input');
      if (next) next.focus();
    };
    add.addEventListener('click', commit);
    telIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
    nameIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); telIn.focus(); } });

    form.append(nameIn, telIn, relIn, add);
    wrap.appendChild(form);
  }

  if (list.length) {
    const ul = document.createElement('ul');
    ul.className = 'referral-list';
    ul.setAttribute('aria-label', 'People you are introducing');
    list.forEach((r, i) => {
      const li = document.createElement('li');
      li.className = 'referral-item';

      const text = document.createElement('div');
      text.className = 'referral-item-text';
      const nm = document.createElement('strong');
      nm.textContent = r.name || '(no name given)';
      const meta = document.createElement('span');
      meta.textContent = r.relation ? `${r.phone} · ${r.relation}` : (r.phone || '(no number)');
      text.append(nm, meta);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'referral-remove';
      remove.setAttribute('aria-label', `Remove ${r.name || 'this person'}`);
      remove.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      remove.addEventListener('click', () => {
        state.answers[key] = referralList(q).filter((_, j) => j !== i);
        buzz();
        renderReferralBlock(q, wrap);
      });

      li.append(text, remove);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);

    if (list.length >= MAX_REFERRALS) {
      const capped = document.createElement('p');
      capped.className = 'referral-privacy';
      capped.textContent = `That's ${MAX_REFERRALS} — plenty to be going on with. Thank you.`;
      wrap.appendChild(capped);
    }
  }

}

function updateContinueVisibility(q) {
  if (q.type === 'text') {
    el.continueBtn.hidden = false;
    el.continueBtn.disabled = !isTextAnswerValid(q);
    return;
  }
  if (q.type === 'multi') {
    const answered = Array.isArray(state.answers[q.key]) && state.answers[q.key].length > 0;
    el.continueBtn.hidden = false;
    el.continueBtn.disabled = !answered;
    return;
  }
  if (q.type === 'grid') {
    // Every row required: a half-filled matrix can't be compared across
    // clients or RMs, which is the only reason to ask it this way.
    el.continueBtn.hidden = false;
    el.continueBtn.disabled = gridAnsweredCount(q) < questionRows(q).length;
    return;
  }
  if (q.type === 'single') {
    const current = state.answers[q.key];
    // A single-select whose picked option takes free text ("Someone else")
    // can't auto-advance — the click handler leaves Continue as the only way
    // forward once typing starts, same as the multi-select "Other" case.
    const otherPicked = q.options && questionOptions(q).find((o) => o.hasOther && current === o.id);
    el.continueBtn.hidden = false;
    el.continueBtn.disabled = otherPicked
      ? !(state.answers[`${q.key}Other`] || '').trim()
      : !current;
    return;
  }
  el.continueBtn.hidden = true;
}

function buzz() {
  if (navigator.vibrate) { try { navigator.vibrate(10); } catch (e) { /* unsupported */ } }
}

function checkIcon() {
  return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
}

// A question can opt out based on earlier answers — the two follow-ups about
// multiple relationship managers only exist for clients who named more than
// one. Forward-only: Back walks the entries actually visited, and changing
// the answer that hid a question is picked up by the next Continue.
function isQuestionActive(q) {
  return typeof q.showIf === 'function' ? q.showIf(state.answers) : true;
}

function advance() {
  let next = state.stepIndex + 1;
  while (next < QUESTIONS.length && !isQuestionActive(QUESTIONS[next])) next++;
  goToStep(next);
}

function goBack() {
  history.back();
}

function showWelcome() {
  state.stepIndex = -1;
  updateProgress();
  showScreen('welcome');
}

let pageToken = newPageToken();

function newPageToken() {
  return `${Date.now()}-${Math.random()}`;
}

window.addEventListener('popstate', (event) => {
  const s = event.state;
  if (s && s.token === pageToken && typeof s.step === 'number') goToStep(s.step, true);
  else showWelcome();
});

function renderNotesScreen() {
  el.notesInput.value = state.notes || '';
  el.notesInput.oninput = () => { state.notes = el.notesInput.value; };
  updateGenerateState();
}

// Never gated — this box is always optional, unlike the public review form
// this was forked from, which required it on a low rating. Kept as its own
// function anyway in case a future edit wants to add a condition here.
function updateGenerateState() {
  el.generateBtn.disabled = false;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
el.startBtn.addEventListener('click', () => goToStep(0));
el.backBtn.addEventListener('click', goBack);
el.continueBtn.addEventListener('click', advance);
el.notesBackBtn.addEventListener('click', goBack);
el.restartBtn.addEventListener('click', resetApp);
el.retryBtn.addEventListener('click', submitForm);

el.generateBtn.addEventListener('click', () => {
  state.notes = el.notesInput.value.trim();
  submitForm();
});

function resetApp() {
  pageToken = newPageToken();
  state.answers = {};
  state.notes = '';
  state.submitted = false;
  showWelcome();
}

// ---------------------------------------------------------------------------
// Branding — writes config.js strings into the page at boot. index.html
// carries the same text statically as a fallback.
// ---------------------------------------------------------------------------
function applyBranding() {
  const h = CONFIG.hero || {};
  document.title = CONFIG.pageTitle || document.title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta && CONFIG.metaDescription) meta.setAttribute('content', CONFIG.metaDescription);

  const set = (node, text) => { if (node && text) node.textContent = text; };
  const brand = document.getElementById('brandText');
  if (brand && CONFIG.brandPrefix) {
    brand.textContent = '';
    brand.append(`${CONFIG.brandPrefix} `);
    const em = document.createElement('em');
    em.textContent = CONFIG.brandAccent || '';
    brand.appendChild(em);
  }
  const title = document.getElementById('heroTitle');
  if (title && h.titlePrefix) {
    title.textContent = '';
    title.append(h.titlePrefix);
    title.appendChild(document.createElement('br'));
    const accent = document.createElement('span');
    accent.className = 'accent';
    accent.textContent = h.titleAccent || '';
    title.appendChild(accent);
    if (h.titleSuffix) title.append(` ${h.titleSuffix}`);
  }
  set(document.getElementById('welcomeBadgeText'), h.badge);
  set(document.getElementById('heroSubtitle'), h.subtitle);
  set(document.getElementById('startBtnLabel'), h.ctaLabel);
  set(document.getElementById('heroHint'), h.hint);
  set(document.getElementById('footerText'), `${CONFIG.companyFullName} · ${CONFIG.tagline}`);
  set(el.thankYouSubtitle, CONFIG.thankYouSubtitle);

  const statsRow = document.getElementById('statsRow');
  if (statsRow && Array.isArray(CONFIG.stats) && CONFIG.stats.length) {
    statsRow.textContent = '';
    CONFIG.stats.slice(0, 4).forEach((s) => {
      const tile = document.createElement('div');
      tile.className = 'stat';
      const strong = document.createElement('strong');
      strong.textContent = s.value;
      const span = document.createElement('span');
      span.textContent = s.label;
      tile.append(strong, span);
      statsRow.appendChild(tile);
    });
  }

  const trust = document.getElementById('trustBadge');
  if (trust) {
    if (CONFIG.trustLine) set(document.getElementById('trustBadgeText'), CONFIG.trustLine);
    else trust.hidden = true;
  }
}
applyBranding();

// ---------------------------------------------------------------------------
// Submission
// ---------------------------------------------------------------------------
let isSubmitting = false;

async function submitForm() {
  if (isSubmitting) return;
  isSubmitting = true;
  el.generateBtn.disabled = true;
  el.retryBtn.disabled = true;

  pageToken = newPageToken();
  showScreen('loading');
  animateLoadingMessages();

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: state.answers, notes: state.notes }),
    });
    if (!res.ok) throw new Error('Request failed: ' + res.status);
    clearInterval(loadingTimer);

    const name = firstName();
    el.thankYouTitle.textContent = name ? `Thanks for your feedback, ${name}` : 'Thanks for your feedback';
    state.submitted = true;
    updateProgress();
    showScreen('thankyou');
  } catch (err) {
    console.error(err);
    clearInterval(loadingTimer);
    el.errorText.textContent = "Couldn't send your feedback. Please try again.";
    showScreen('error');
  } finally {
    isSubmitting = false;
    updateGenerateState();
    el.retryBtn.disabled = false;
  }
}

let loadingTimer = null;
function animateLoadingMessages() {
  let i = 0;
  el.loadingText.textContent = LOADING_MESSAGES[0];
  clearInterval(loadingTimer);
  loadingTimer = setInterval(() => {
    i = (i + 1) % LOADING_MESSAGES.length;
    el.loadingText.textContent = LOADING_MESSAGES[i];
  }, 900);
}

let toastTimer = null;
function showToast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('show'), 2600);
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
updateProgress();
