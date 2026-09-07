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
    metaDescription: 'A private, two-minute check-in with iVentures Wealth — seen only by senior management.',

    brandPrefix: 'iVentures',
    brandAccent: 'Wealth',

    trustLine: 'SEBI Registered · Reg. No. INA000019026',

    thankYouSubtitle: 'Your feedback has been recorded with our senior management team, in confidence. We’re grateful you took the time.',

    // --- Welcome screen copy ---------------------------------------------
    hero: {
      badge: '2 minutes · Seen only by senior management',
      titlePrefix: 'A Quick, Private',
      titleAccent: 'Check-In',
      titleSuffix: '',
      subtitle: 'Nirmal and the leadership team read every response personally. Your relationship manager never sees your answers — so please be candid.',
      ctaLabel: "Let's Begin",
      hint: 'Six quick questions. Please answer honestly.',
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

    // --- New needs / cross-sell signals --------------------------------------
    // Multi-select. No "Nothing right now, I'm all set" exclusivity logic —
    // picking it alongside other chips is harmless noise, not worth the extra
    // code for how rarely it would happen.
    newNeeds: [
      { id: 'tax-planning', label: 'Tax planning' },
      { id: 'estate-succession', label: 'Estate & succession planning' },
      { id: 'real-estate', label: 'Real estate advisory' },
      { id: 'insurance', label: 'Insurance planning' },
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
