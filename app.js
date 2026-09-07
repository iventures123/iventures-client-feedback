// ---------------------------------------------------------------------------
// Forked from google-reviews-form/iventures-live/app.js, stripped down to a
// private feedback form: no public review generation, no Google post-off,
// just six quick questions logged straight to a Sheet only management reads.
// Every client-specific value lives in config.js — edit that, not this.
// ---------------------------------------------------------------------------

const RM_OPTIONS = CONFIG.team;
const CITY_OPTIONS = CONFIG.cities;
const NEW_NEEDS_OPTIONS = CONFIG.newNeeds.concat([]); // config already includes "Other"

const ICONS = {
  name: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  rms: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  portfolio: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',
  relationship: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
  recommend: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',
  outcome: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
};

// Name of the selected RM, for the personalized "how has X been" question.
// Falls back to a neutral phrase if nothing's been picked yet (shouldn't
// happen — this question comes after the RM pick — or if "Someone else" was
// typed in.
function selectedRmName() {
  const id = state.answers.rm;
  const other = (state.answers.rmOther || '').trim();
  if (id === 'other') return other || 'them';
  const opt = RM_OPTIONS.find((o) => o.id === id);
  return opt ? opt.label.split(' ')[0] : 'them';
}

const QUESTIONS = [
  {
    key: 'name', type: 'text', icon: ICONS.name,
    title: 'Quick intro — what’s your name?',
    sub: 'So we know whose feedback this is. Only management sees it.',
    placeholder: 'e.g. Vikram Singhania',
    autocomplete: 'name',
    pills: { key: 'city', label: 'Where are you based? (optional)', options: CITY_OPTIONS },
  },
  {
    key: 'rm', type: 'single', icon: ICONS.rms,
    title: 'Who is your relationship manager at iVentures?',
    sub: 'This is so we know who your feedback is about — it is never shared back with them.',
    otherPlaceholder: 'Who do you work with?',
    options: RM_OPTIONS,
  },
  {
    key: 'portfolioRating', type: 'stars', icon: ICONS.portfolio,
    title: 'How satisfied are you with your portfolio’s performance and the advice behind it?',
    sub: 'Be honest — this goes straight to senior management, not your RM.',
  },
  {
    key: 'serviceRating', type: 'stars', icon: ICONS.relationship,
    title: 'How would you rate our service and communication?',
    sub: 'Responsiveness, clarity, and how well we understand what matters to you.',
  },
  {
    key: 'rmRating', type: 'stars', icon: ICONS.name,
    // Function form so the title updates with whichever RM was picked on the
    // previous screen — same mechanism as api/submit's dynamic labels.
    title: () => `Personally, how has ${selectedRmName()} been for you?`,
    sub: 'This answer is for leadership’s eyes only — never shared with your RM.',
  },
  {
    key: 'nps', type: 'slider', icon: ICONS.recommend,
    title: 'How likely are you to recommend iVentures to a friend or colleague?',
    sub: 'Drag to a number from 0 (not likely) to 10 (extremely likely).',
    sliderMin: 0, sliderMax: 10, sliderLowLabel: 'Not likely', sliderHighLabel: 'Extremely likely',
  },
  {
    key: 'newNeeds', type: 'multi', icon: ICONS.outcome,
    title: 'Is there anything else on your mind we could help with?',
    sub: 'Pick everything that applies.',
    display: 'chips',
    otherPlaceholder: CONFIG.newNeedsOtherPlaceholder,
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
  const pct = Math.round((step / (totalSteps + 1)) * 100);
  const milestone = pct < 40 ? 'Getting started' : pct < 75 ? 'Halfway there' : 'Almost done';
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
  el.qSub.textContent = q.sub || '';
  el.qSub.style.display = q.sub ? 'block' : 'none';

  el.choiceGrid.innerHTML = '';
  el.choiceGrid.className = 'choice-grid' + (q.display === 'chips' ? ' chips' : '');
  el.otherInputWrap.hidden = true;
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
    el.textInputLabel.textContent = typeof q.title === 'function' ? q.title() : q.title;
    el.textInput.placeholder = q.placeholder || '';
    el.textInput.autocomplete = q.autocomplete || 'off';
    el.textInput.inputMode = q.inputMode || '';
    el.textInput.value = state.answers[q.key] || '';
    el.textInput.oninput = () => {
      state.answers[q.key] = el.textInput.value;
      updateContinueVisibility(q);
    };
    el.textInput.onkeydown = (event) => {
      if (event.key === 'Enter' && (state.answers[q.key] || '').trim()) {
        event.preventDefault();
        el.textInput.blur();
        advance();
      }
    };
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

  el.choiceGrid.hidden = false;
  el.textInput.hidden = true;

  const current = state.answers[q.key];
  const isMulti = q.type === 'multi';

  q.options.forEach((opt) => {
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
        }
        state.answers[q.key] = Array.from(set);
        paintChoice(btn, set.has(opt.id));
        syncOtherInput(q);
        updateContinueVisibility(q);
      } else {
        state.answers[q.key] = opt.id;
        el.choiceGrid.querySelectorAll('.choice').forEach((b) => paintChoice(b, b === btn));
        syncOtherInput(q);
        updateContinueVisibility(q);
        if (opt.hasOther) {
          el.otherInput.focus();
        } else if (!q.pills) {
          setTimeout(() => advance(), 300);
        }
      }
    });

    el.choiceGrid.appendChild(btn);
  });

  syncOtherInput(q);
  updateContinueVisibility(q);
}

function paintChoice(btn, selected) {
  btn.classList.toggle('selected', selected);
  btn.setAttribute('aria-pressed', String(selected));
  btn.querySelector('.check').innerHTML = selected ? checkIcon() : '';
}

function syncOtherInput(q) {
  if (!q.options) { el.otherInputWrap.hidden = true; return; }
  const current = state.answers[q.key];
  const selectedIds = Array.isArray(current) ? current : current ? [current] : [];
  const wanted = q.options.some((o) => o.hasOther && selectedIds.includes(o.id));
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

  el.continueBtn.hidden = false;
  el.continueBtn.disabled = !current;
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
    valueDisplay.setAttribute('aria-live', 'off');
    input.classList.remove('slider-untouched');
    input.setAttribute('aria-valuetext', `${value} out of ${max}`);
    setPct(value);
    el.continueBtn.disabled = false;
  });
  input.addEventListener('change', () => valueDisplay.setAttribute('aria-live', 'polite'));

  wrap.append(valueDisplay, input, labels);
  el.choiceGrid.appendChild(wrap);

  el.continueBtn.hidden = false;
  // 0 is a valid, meaningful NPS answer, so gate on "has it been touched",
  // not on truthiness the way the star questions do.
  el.continueBtn.disabled = !hasAnswer;
}

function updateContinueVisibility(q) {
  if (q.type === 'text') {
    el.continueBtn.hidden = false;
    el.continueBtn.disabled = !(state.answers[q.key] || '').trim();
    return;
  }
  if (q.type === 'multi') {
    const answered = Array.isArray(state.answers[q.key]) && state.answers[q.key].length > 0;
    el.continueBtn.hidden = false;
    el.continueBtn.disabled = !answered;
    return;
  }
  if (q.type === 'single') {
    const current = state.answers[q.key];
    // A single-select whose picked option takes free text ("Someone else")
    // can't auto-advance — the click handler leaves Continue as the only way
    // forward once typing starts, same as the multi-select "Other" case.
    const otherPicked = q.options && q.options.find((o) => o.hasOther && current === o.id);
    if (otherPicked) {
      el.continueBtn.hidden = false;
      el.continueBtn.disabled = !(state.answers[`${q.key}Other`] || '').trim();
      return;
    }
    if (q.pills) {
      el.continueBtn.hidden = false;
      el.continueBtn.disabled = !current;
      return;
    }
    el.continueBtn.hidden = true;
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

function advance() {
  goToStep(state.stepIndex + 1);
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
    el.thankYouTitle.textContent = name ? `Thank you, ${name}` : 'Thank You';
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
