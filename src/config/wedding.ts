/**
 * ────────────────────────────────────────────────────────────────────────
 *  THE ONLY FILE YOU EDIT PER COUPLE.
 *  Everything on the page — text, dates, story, venue, RSVP options — is
 *  driven from this object. Swap these values and you have a new invitation.
 *  (This is the reusable, white-label core: one template, infinite couples.)
 * ────────────────────────────────────────────────────────────────────────
 */

export type StoryStep = {
  /** Two-digit step marker shown as a large ghost number, e.g. "01". */
  number: string;
  /** isiZulu title, e.g. "Ilobolo". */
  titleZu: string;
  /** English subtitle, e.g. "The Bride Price". */
  titleEn: string;
  /** Narrative paragraph for this step of the traditional journey. */
  body: string;
};

export type WeddingConfig = {
  /** Used in <title>, share cards, etc. */
  meta: {
    title: string;
    description: string;
  };
  couple: {
    /** Long script form shown in the header + footer, e.g. "Themba & Vuyokazi". */
    scriptName: string;
    /** Compact monogram shown inside the wax seal, e.g. "T & V". */
    monogram: string;
    partnerA: { firstName: string };
    partnerB: { firstName: string };
  };
  families: {
    a: { surname: string; house: string };
    b: { surname: string; house: string };
    /** Sentence joining the two families on the invitation. */
    invitationLine: string;
  };
  /** First-load envelope "gate" that the guest taps to unveil the invitation. */
  envelope: {
    /** Set false to skip the intro and load straight to the page. */
    enabled: boolean;
    /** Hint shown beneath the sealed envelope (first tap). */
    hint: string;
    /** Prompt shown once the letter is open (second tap enters the site). */
    enterLabel: string;
  };
  /** ISO 8601 date-time of the ceremony. Drives the live countdown. */
  dateISO: string;
  /** Pretty date string shown in the UI (kept separate for full control). */
  dateLabel: string;
  hero: {
    eyebrow: string;
    celebrationType: string;
    tagline: string;
    ctaLabel: string;
  };
  invitation: {
    eyebrow: string;
    heading: string;
    body: string;
  };
  story: {
    eyebrow: string;
    titleZu: string;
    titleEn: string;
    steps: StoryStep[];
  };
  venue: {
    eyebrow: string;
    titleZu: string;
    titleEn: string;
    name: string;
    area: string;
    address: string;
    /** Google Maps (or any) link for the "Open in Maps" button. */
    mapsUrl: string;
    doorsOpen: string;
    ceremony: string;
    /** Path under /public, or a remote URL. Falls back to a styled panel if absent. */
    image?: string;
  };
  countdown: {
    eyebrow: string;
    titleZu: string;
    titleEn: string;
    /** isiZulu / English unit labels, in [days, hours, minutes, seconds] order. */
    labels: { zu: string; en: string }[];
    /** Shown once the date has passed. */
    finishedMessage: string;
  };
  rsvp: {
    eyebrow: string;
    heading: string;
    intro: string;
    deadlineLabel: string;
    dressNote: string;
    acceptLabel: string;
    declineLabel: string;
    submitLabel: string;
    mealOptions: string[];
    dietaryOptions: string[];
    successMessage: string;
  };
  footer: {
    families: string;
    thanksZu: string;
    thanksEn: string;
    /** Studio / designer credit. */
    credit: string;
  };
};

export const wedding: WeddingConfig = {
  meta: {
    title: "Themba & Vuyokazi · Umshado",
    description:
      "The Nkosi and Dlamini families joyfully invite you to the traditional wedding of Themba & Vuyokazi — 14 February 2027, Summer Place, Hyde Park.",
  },
  couple: {
    scriptName: "Themba & Vuyokazi",
    monogram: "T & V",
    partnerA: { firstName: "Themba" },
    partnerB: { firstName: "Vuyokazi" },
  },
  families: {
    a: { surname: "Nkosi", house: "House of Nkosi" },
    b: { surname: "Dlamini", house: "House of Dlamini" },
    invitationLine:
      "joyfully request the honour of your presence at the wedding celebration of their children",
  },
  envelope: {
    enabled: true,
    hint: "Tap the seal to open",
    enterLabel: "Open invitation",
  },
  dateISO: "2027-02-14T15:00:00+02:00",
  dateLabel: "14 February 2027",
  hero: {
    eyebrow: "Umshado",
    celebrationType: "Traditional Wedding Celebration",
    tagline: "Ngobukhosi · Together in tradition",
    ctaLabel: "RSVP — Bhalisa",
  },
  invitation: {
    eyebrow: "Umemo · You are invited",
    heading: "The Nkosi & Dlamini Families",
    body:
      "joyfully request the honour of your presence at the wedding celebration of their children, as two clans become one family in the way of those who came before us.",
  },
  story: {
    eyebrow: "Indlela Yethu",
    titleZu: "Indlela Yethu",
    titleEn: "Our Path · The Traditional Journey",
    steps: [
      {
        number: "01",
        titleZu: "Ukushela",
        titleEn: "The Courtship",
        body:
          "Themba made his intentions known the way his forefathers did — with respect, through family, in the proper way. He approached Vuyokazi's family with dignity, and the two were given the blessing to walk the path together.",
      },
      {
        number: "02",
        titleZu: "Ilobolo",
        titleEn: "The Bride Price",
        body:
          "The two families gathered in sacred negotiation. Eleven cattle were agreed upon — a testament to Vuyokazi's great worth and the deep honour the Nkosi family holds for the Dlamini clan. Ubuntu was lived, not spoken.",
      },
      {
        number: "03",
        titleZu: "Umembeso",
        titleEn: "The Gift Exchange",
        body:
          "Blankets, cloth, and beaded jewellery passed between the families — each gift a thread weaving two households into one. The women ululated, the men gave thanks, and two clans became one family.",
      },
      {
        number: "04",
        titleZu: "Umshado",
        titleEn: "The Wedding Day",
        body:
          "Today, Themba and Vuyokazi stand before those they love most and complete what tradition began. The journey that started with a glance across a family gathering ends here — and a new story begins. Siyabonga.",
      },
    ],
  },
  venue: {
    eyebrow: "Indawo Yomcimbi",
    titleZu: "Indawo Yomcimbi",
    titleEn: "The Venue · Where we celebrate",
    name: "Summer Place",
    area: "Hyde Park · Johannesburg",
    address: "69 Melville Road, Hyde Park, Johannesburg, South Africa",
    mapsUrl: "https://maps.google.com/?q=Summer+Place+Hyde+Park+Johannesburg",
    doorsOpen: "Doors open at 13:00",
    ceremony: "Ceremony begins at 15:00",
    // Drop a real image at /public/venue.jpg and set image: "/venue.jpg"
    image: undefined,
  },
  countdown: {
    eyebrow: "Uhlelo Lwezikhathi",
    titleZu: "Counting the Days",
    titleEn: "Until we are united",
    labels: [
      { zu: "Izinsuku", en: "Days" },
      { zu: "Amahora", en: "Hours" },
      { zu: "Amaminithi", en: "Minutes" },
      { zu: "Amasekendi", en: "Seconds" },
    ],
    finishedMessage: "Today we are united. Siyabonga.",
  },
  rsvp: {
    eyebrow: "Bhalisa · Register",
    heading: "Confirm Your Attendance",
    intro: "You are invited.",
    deadlineLabel: "Please RSVP by 31 October 2026",
    dressNote: "Traditional attire is warmly encouraged.",
    acceptLabel: "Ngizobuya — Accept",
    declineLabel: "Ngixolele — Decline",
    submitLabel: "Thumela — Send Confirmation",
    mealOptions: ["Beef", "Chicken", "Lamb", "Vegetarian", "Vegan"],
    dietaryOptions: ["Gluten-free", "Dairy-free", "Nut allergy", "Seafood allergy"],
    successMessage: "Siyabonga — your RSVP has been received.",
  },
  footer: {
    families: "Nkosi · Dlamini",
    thanksZu: "Siyabonga",
    thanksEn: "We give thanks",
    credit: "Designed by Wedico",
  },
};
