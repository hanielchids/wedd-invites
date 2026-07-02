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

export type StayOption = {
  /** Small tier tag shown above the name, e.g. "Budget Beauty". */
  tier: string;
  name: string;
  address: string;
  /** One-line description of the place. */
  blurb: string;
  /** Approximate nightly rate, e.g. "± R850 / night". Omit to hide. */
  priceGuide?: string;
  /** Google Maps link for the place. */
  mapsUrl: string;
};

export type WeddingConfig = {
  /** Used in <title>, share cards, etc. */
  meta: {
    title: string;
    description: string;
  };
  couple: {
    /** Long script form shown in the header + footer, e.g. "Haniel & Zenzeleni". */
    scriptName: string;
    /** Compact monogram shown inside the wax seal, e.g. "H & Z". */
    monogram: string;
    partnerA: { firstName: string };
    partnerB: { firstName: string };
  };
  families: {
    a: { surname: string };
    b: { surname: string };
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
    /** Polite "confirmed RSVPs only" notice, highlighted in the RSVP section. */
    entryNote: string;
    dressNote: string;
    acceptLabel: string;
    declineLabel: string;
    submitLabel: string;
    dietaryOptions: string[];
    successMessage: string;
  };
  /** "Where to stay" section — suggested accommodation for travelling guests. */
  stay: {
    eyebrow: string;
    titleEn: string;
    intro: string;
    options: StayOption[];
  };
  footer: {
    families: string;
    thanksZu: string;
    thanksEn: string;
  };
};

export const wedding: WeddingConfig = {
  meta: {
    title: "Haniel & Zenzeleni · Umshado",
    description:
      "The Chidavose and Zondo families joyfully invite you to the traditional wedding of Haniel & Zenzeleni — 28 November 2026, Vryheid.",
  },
  couple: {
    scriptName: "Haniel & Zenzeleni",
    monogram: "H & Z",
    partnerA: { firstName: "Haniel" },
    partnerB: { firstName: "Zenzeleni" },
  },
  families: {
    a: { surname: "Chidavose" },
    b: { surname: "Zondo" },
    invitationLine:
      "joyfully request the honour of your presence at the wedding celebration of their children",
  },
  envelope: {
    enabled: true,
    hint: "Tap the seal to open",
    enterLabel: "Open invitation",
  },
  dateISO: "2026-11-28T15:00:00+02:00",
  dateLabel: "28 November 2026",
  hero: {
    eyebrow: "Umshado",
    celebrationType: "Traditional Wedding Celebration",
    ctaLabel: "RSVP — Bhalisa",
  },
  invitation: {
    eyebrow: "Umemo · You are invited",
    heading: "The Chidavose & Zondo Families",
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
          "Haniel made his intentions known the way his forefathers did — with respect, through family, in the proper way. He approached Zenzeleni's family with dignity.\n\nBut truth be told, the spark had been lit long before the elders ever gathered. The very first time they met, out in field service, Haniel's stunning presence caught Zenzeleni's eye. Right there in the ministry, captivated by him, Zenzi couldn't help but *shela* him on the spot.",
      },
      {
        number: "02",
        titleZu: "Ilobolo",
        titleEn: "The Bride Price",
        body:
          "The two families gathered in sacred negotiation. Ilobolo was agreed upon — a testament to Zenzeleni's great worth and the deep honour the Chidavose family holds for the Zondo clan. Ubuntu was lived, not spoken.",
      },
      {
        number: "03",
        titleZu: "Umshado",
        titleEn: "The Wedding Day",
        body:
          "Today, Haniel and Zenzeleni stand before those they love most and complete what tradition began. The journey that started with a sudden spark out in field service — where Zenzi simply couldn't look away from how stunning Haniel was — starts a new story. Siyabonga.",
      },
    ],
  },
  venue: {
    eyebrow: "Indawo Yomcimbi",
    titleZu: "Indawo Yomcimbi",
    titleEn: "The Venue · Where we celebrate",
    name: "80 Boeren St",
    area: "Vryheid · KwaZulu-Natal",
    address: "80 Boeren St, Vryheid, South Africa",
    mapsUrl: "https://maps.google.com/?q=80+Boeren+St+Vryheid",
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
    deadlineLabel: "Please RSVP by 30 September 2026",
    entryNote:
      "Kindly note — so that we may welcome every guest by name, entry on the day is reserved for confirmed RSVPs only. Please do respond by the date above; we would hate for you to miss it.",
    dressNote: "Traditional attire is warmly encouraged.",
    acceptLabel: "Yebo — Accept",
    declineLabel: "Cha — Decline",
    submitLabel: "Thumela — Send Confirmation",
    dietaryOptions: [
      "Vegetarian",
      "Vegan",
      "Gluten-free",
      "Dairy-free",
      "Nut allergy",
      "Seafood allergy",
    ],
    successMessage: "Siyabonga — your RSVP has been received.",
  },
  stay: {
    eyebrow: "Indawo Yokulala · Where to Stay",
    titleEn: "Places to Rest",
    intro:
      "For guests travelling from afar, these are our suggested stays in and around Vryheid — book early, rooms in town are limited.",
    options: [
      {
        tier: "Charming · Budget-Friendly",
        name: "Presidents Boutique Lodge by iLawu",
        address: "193 President Street, Vryheid",
        blurb:
          "A stylish, modern boutique lodge with an outdoor pool, minutes from the town centre — remarkable value for the finish.",
        priceGuide: "from ± R750 / night",
        mapsUrl:
          "https://maps.google.com/?q=Presidents+Boutique+Lodge+by+iLawu+193+President+Street+Vryheid",
      },
      {
        tier: "Comfortable · Mid-Range",
        name: "Shonalanga Lodge",
        address: "136 Kerk Street, Vryheid",
        blurb:
          "A warm garden lodge renovated to a plush finish, with secure parking and hearty breakfasts — an easy, restful stay.",
        priceGuide: "± R1 350 / night",
        mapsUrl: "https://maps.google.com/?q=Shonalanga+Lodge+136+Kerk+Street+Vryheid",
      },
      {
        tier: "Heritage · Luxury",
        name: "Villa Beryl Guesthouse",
        address: "169 Hoog Street, Vryheid",
        blurb:
          "One of Vryheid's grand old homes — sandstone foundations, Oregon pine floors and wide verandas, kept in true luxury style.",
        priceGuide: "± R1 550 / night",
        mapsUrl: "https://maps.google.com/?q=Villa+Beryl+Guesthouse+169+Hoog+Street+Vryheid",
      },
      {
        tier: "Our Pick",
        name: "Oxford Lodge",
        address: "128 Deputasie Street, Vryheid",
        blurb:
          "A gracious four-star lodge set in lush gardens with an on-site restaurant — our pick for guests who want everything taken care of.",
        mapsUrl: "https://maps.google.com/?q=Oxford+Lodge+128+Deputasie+Street+Vryheid",
      },
    ],
  },
  footer: {
    families: "Chidavose · Zondo",
    thanksZu: "Siyabonga",
    thanksEn: "We give thanks",
  },
};
