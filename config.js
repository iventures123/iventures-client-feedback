// ---------------------------------------------------------------------------
// SINGLE SOURCE OF TRUTH for everything client-specific in this form.
// Loaded two ways, so it uses a small UMD wrapper (see google-reviews-form's
// config.js, which this file is forked from):
//   - In the browser: index.html loads it as a plain <script> before app.js.
//   - On the server: api/submit.js does `require('../config')` to build
//     readable Sheet labels from the same ids the form renders.
// ---------------------------------------------------------------------------
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CONFIG = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    companyName: 'iVentures',
    companyFullName: 'iVentures Wealth',
    tagline: 'Responsibly Yours',

    pageTitle: 'iVentures Client Feedback',
    metaDescription: 'A private check-in with iVentures Wealth — seen and used only by our team.',

    brandPrefix: 'iVentures',
    brandAccent: 'Wealth',

    trustLine: 'SEBI Registered · Reg. No. INA000019026',

    thankYouSubtitle: 'This has been recorded with our team, in confidence. We will use it to put the right people and the right ideas behind you — so you and your family get the best of the iVentures team. If you have flagged something that needs attention, we will follow up personally.',

    // --- Welcome screen copy ---------------------------------------------
    hero: {
      badge: '3 minutes · Seen and used only by our team',
      titlePrefix: 'A Quick, Private',
      titleAccent: 'Check-In',
      titleSuffix: '',
      subtitle: 'So we can put the right team, the right skills and the right knowledge behind you and your family. Read personally by Nirmal and the team, never shared with your relationship manager — so please be candid.',
      ctaLabel: "Let's Begin",
      hint: 'A handful of quick questions — most are a single tap. Please answer honestly.',
    },

    stats: [
      { value: '20+', label: 'Years' },
      { value: '₹1200Cr+', label: 'AUM' },
      { value: '150+', label: 'Investors' },
    ],

    // --- Relationship Managers / Client Partners ----------------------------
    // Same roster as the public review form (google-reviews-form), kept in
    // sync by hand — this is a separate, private-feedback-only tool, so it
    // doesn't share a codebase with that one.
    team: [
      { id: 'nirmal', label: 'Nirmal Bansal', sub: 'Founder & CEO' },
      { id: 'krishna', label: 'Krishna Makhariya', sub: 'CIO & Head of Research' },
      { id: 'nitin', label: 'Nitin Jindal', sub: 'Executive Director, Head of Global Markets & Compliance' },
      { id: 'rishi', label: 'Rishi Kapur', sub: 'Executive Director, Private Client Group' },
      { id: 'girisha', label: 'Girisha Arora', sub: 'Assistant Vice President' },
      { id: 'other', label: 'Someone else', sub: 'Tell us who', hasOther: true },
    ],

    // --- Cities (optional, under the name field) ----------------------------
    cities: [
      { id: 'delhi', label: 'Delhi' },
      { id: 'gurugram', label: 'Gurugram' },
      { id: 'noida', label: 'Noida' },
      { id: 'faridabad', label: 'Faridabad' },
      { id: 'mumbai', label: 'Mumbai' },
      { id: 'bengaluru', label: 'Bengaluru' },
      { id: 'overseas', label: 'Overseas' },
      { id: 'other', label: 'Other', hasOther: true, placeholder: 'Which city?' },
    ],
    overseasCities: [
      { id: 'usa', label: 'USA' },
      { id: 'uk', label: 'UK' },
      { id: 'singapore', label: 'Singapore' },
      { id: 'uae', label: 'UAE (Dubai)' },
      { id: 'australia', label: 'Australia' },
      { id: 'canada', label: 'Canada' },
      { id: 'other', label: 'Other', hasOther: true, placeholder: 'Which country?' },
    ],

    // --- Service quality, rated part by part ---------------------------------
    // One screen, several sub-parts — a single "how's our service?" star can't
    // tell you WHICH part is failing, and that's the whole point of asking.
    // Each row is one tap on a 1-5 scale. Keep this list short: every row
    // added is another tap for every client, and a battery long enough to feel
    // like homework is where people start tapping 4s down the column without
    // reading.
    serviceQualities: [
      { key: 'qMarketKnowledge', label: 'Market knowledge', sub: 'Their grasp of the markets — and how clearly they explain it' },
      { key: 'qResponsiveness', label: 'Responsiveness', sub: 'Response time — do they call back, do they reply to messages' },
      { key: 'qFollowUps', label: 'Follow-through', sub: 'Whether they circle back when they say they will' },
      { key: 'qUnderstanding', label: 'Understanding your goals', sub: 'How well they know what you are actually trying to achieve' },
      { key: 'qProactivity', label: 'Proactivity', sub: 'Bringing you ideas before you have to ask for them' },
      { key: 'qReporting', label: 'Reporting & reviews', sub: 'How clear your statements and portfolio reviews are' },
    ],

    // --- What the RM has actually introduced them to -------------------------
    // A coverage checklist, not a rating: what a client has NEVER been walked
    // through is the more useful signal, and it arrives as an unticked box
    // without anyone having to criticise their RM to say so.
    rmCoverage: [
      { id: 'mutual-funds', label: 'Mutual funds' },
      { id: 'pms', label: 'PMS', sub: 'Portfolio Management Services' },
      { id: 'aif', label: 'AIF', sub: 'Alternative Investment Funds' },
      { id: 'fixed-income', label: 'Fixed income', sub: 'Bonds, debt, structured yield' },
      { id: 'venture', label: 'Startup & venture funds', sub: 'Private markets and venture capital' },
      { id: 'global-etfs', label: 'Global ETFs beyond India', sub: 'US, UK, Japan, South Korea, China' },
      { id: 'none', label: 'None of these, so far' },
      { id: 'other', label: 'Other product baskets', hasOther: true },
    ],
    rmCoverageOtherPlaceholder: 'Which other baskets have they walked you through?',

    // --- Webinar / event interest --------------------------------------------
    // Doubles as an invitation list: whatever gets ticked here is a client who
    // has already said yes to being invited, which is a warmer list than any
    // segmentation we could infer.
    webinarTopics: [
      { id: 'wills-trusts', label: 'Wills & trust creation' },
      { id: 'fund-managers', label: 'Sessions with top fund managers' },
      { id: 'kids-literacy', label: 'Financial literacy for children' },
      { id: 'kids-income', label: 'Building passive income for children' },
      { id: 'none', label: 'Not right now' },
      { id: 'other', label: 'Something else', hasOther: true },
    ],
    webinarOtherPlaceholder: 'What would you actually turn up for?',

    // --- Email opt-in ---------------------------------------------------------
    // Its own screen, and never pre-selected: consent bundled in with other
    // answers is not consent. No answer means no, which is the right default.
    mailOptIn: [
      { id: 'yes', label: 'Yes, keep me posted' },
      { id: 'no', label: 'No, thank you' },
    ],

    // --- Reporting timeliness -------------------------------------------------
    // Deliberately not a 1-5: "3/5 on time" is uninterpretable, whereas
    // "yes, but only when I chase" names a specific, fixable failure.
    reportingTimeliness: [
      { id: 'always', label: 'Always on time', sub: 'Without my ever having to ask' },
      { id: 'on-request', label: 'Yes — but I have to ask', sub: 'They arrive once I chase them' },
      { id: 'sometimes-late', label: 'Sometimes late' },
      { id: 'problem', label: 'No — this has been a problem' },
      { id: 'na', label: 'Not applicable to me' },
    ],

    // --- How often they want to hear from their RM ---------------------------
    // Worth asking outright: mismatched expectations about contact frequency
    // sit behind a good share of "they never call me" complaints, and it is
    // the one thing on this form that can be fixed the same afternoon.
    contactFrequency: [
      { id: 'monthly', label: 'Monthly' },
      { id: 'quarterly', label: 'Quarterly' },
      { id: 'half-yearly', label: 'Every six months' },
      { id: 'yearly', label: 'Once a year' },
      { id: 'as-needed', label: 'Only when something needs attention' },
    ],

    // --- Services currently in use -------------------------------------------
    // What the client is ALREADY using, as opposed to `newNeeds` below (what
    // they might want next). Plain service names, same roster as the public
    // review form's `services` list — kept as bare labels here since nothing
    // on this form assembles them into review-text sentences.
    services: [
      { id: 'portfolio-management', label: 'Portfolio Management (PMS & AIF)' },
      { id: 'global-etfs-hedge-funds', label: 'Global ETFs & Hedge Funds' },
      { id: 'stocks-etfs', label: 'Stocks & ETFs' },
      { id: 'mutual-funds', label: 'Mutual Fund Investments' },
      { id: 'asset-consolidation', label: 'Consolidation & Tracking of Financial Assets' },
      { id: 'estate-succession', label: 'Estate & Succession Planning' },
      { id: 'will-trusts', label: 'Will Drafting & Family Trusts' },
      { id: 'tax-planning', label: 'Taxation Advisory' },
      { id: 'nri-advisory', label: 'NRI Investment Advisory' },
      { id: 'global-investing', label: 'Global Investing (GIFT City)' },
      { id: 'real-estate', label: 'Real Estate Advisory' },
      { id: 'family-office', label: 'Family Office Advisory' },
      { id: 'other', label: 'Something else', hasOther: true },
    ],
    servicesOtherPlaceholder: 'What else are you working with us on?',

    // --- New needs / cross-sell signals --------------------------------------
    // Multi-select. No "Nothing right now, I'm all set" exclusivity logic —
    // picking it alongside other chips is harmless noise, not worth the extra
    // code for how rarely it would happen.
    newNeeds: [
      { id: 'tax-planning', label: 'Tax planning' },
      { id: 'estate-succession', label: 'Estate & succession planning' },
      { id: 'family-wills', label: 'A Will for every family member', sub: 'Succession planning across the whole family, not just one Will' },
      { id: 'real-estate', label: 'Real estate advisory' },
      { id: 'family-trust', label: 'Family trust / family office' },
      { id: 'nri-global', label: 'NRI / global investing' },
      { id: 'nothing', label: 'Nothing right now — all set' },
      { id: 'other', label: 'Something else', hasOther: true },
    ],
    newNeedsOtherPlaceholder: 'What else can we help with?',

    ratingWords: {
      1: 'Disappointing',
      2: 'Below expectations',
      3: 'Okay — room to improve',
      4: 'Very good',
      5: 'Exceptional',
    },
  };
});
