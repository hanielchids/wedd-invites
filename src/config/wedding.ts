/**
 * ────────────────────────────────────────────────────────────────────────
 *  THE ONLY FILE YOU EDIT PER EVENT.
 *  Everything on the page — text, dates, schedule, venue, RSVP options —
 *  is driven from this object.
 * ────────────────────────────────────────────────────────────────────────
 */

export type ScheduleItem = {
  /** e.g. "15:00" */
  time: string;
  title: string;
  detail?: string;
};

export type StayOption = {
  tier: string;
  name: string;
  address: string;
  blurb: string;
  priceGuide?: string;
  mapsUrl: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type WeddingConfig = {
  meta: {
    title: string;
    description: string;
  };
  couple: {
    /** "Haniel & Zenzeleni" — used in the hero and footer. */
    names: string;
    monogram: string;
    partnerA: { firstName: string };
    partnerB: { firstName: string };
  };
  families: {
    invitationLine: string;
  };
  /** ISO 8601 date-time of the ceremony. Drives the live countdown. */
  dateISO: string;
  dateLabel: string;
  /** e.g. "Thursday" — shown small beneath the date. */
  dayOfWeek: string;
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
  schedule: {
    eyebrow: string;
    title: string;
    items: ScheduleItem[];
  };
  venue: {
    eyebrow: string;
    title: string;
    name: string;
    area: string;
    address: string;
    mapsUrl: string;
    /** Short romantic description of the venue. */
    description: string;
    directions: string[];
    image?: string;
  };
  countdown: {
    eyebrow: string;
    title: string;
    labels: string[];
    finishedMessage: string;
  };
  rsvp: {
    eyebrow: string;
    heading: string;
    intro: string;
    deadlineLabel: string;
    entryNote: string;
    acceptLabel: string;
    declineLabel: string;
    submitLabel: string;
    dietaryOptions: string[];
    successMessage: string;
  };
  dressCode: {
    eyebrow: string;
    title: string;
    body: string;
    /** Swatch hexes rendered as little dots under the dress-code text. */
    palette: string[];
  };
  stay: {
    eyebrow: string;
    title: string;
    intro: string;
    options: StayOption[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: FaqItem[];
  };
  footer: {
    families: string;
    thanks: string;
    closing: string;
  };
};

export const wedding: WeddingConfig = {
  meta: {
    title: "Haniel & Zenzeleni · 17 September 2026",
    description:
      "Join us as we say I do — Haniel & Zenzeleni, Thursday 17 September 2026 at Green Leaves Country Lodge, Hartbeespoort.",
  },
  couple: {
    names: "Haniel & Zenzeleni",
    monogram: "H·Z",
    partnerA: { firstName: "Haniel" },
    partnerB: { firstName: "Zenzeleni" },
  },
  families: {
    invitationLine:
      "Together with their families, joyfully invite you to celebrate their marriage",
  },
  dateISO: "2026-09-17T14:00:00+02:00",
  dateLabel: "17 September 2026",
  dayOfWeek: "Thursday",
  hero: {
    eyebrow: "The Wedding of",
    celebrationType: "Garden Ceremony & Reception",
    ctaLabel: "RSVP",
  },
  invitation: {
    eyebrow: "You are invited",
    heading: "Together with their families",
    body:
      "Haniel Nyasha Chidavose and Zenzeleni Luyanda joyfully invite you to witness the beginning of their forever — an afternoon of vows, garden air and golden light in the shadow of the Magalies Mountains.",
  },
  schedule: {
    eyebrow: "The Day",
    title: "Order of Celebration",
    items: [
      {
        time: "13:30",
        title: "Guests Arrive",
        detail: "Find your seat in the garden as the chapel bell rings.",
      },
      {
        time: "14:00",
        title: "The Ceremony",
        detail: "We say I do beneath the trees.",
      },
      {
        time: "15:00",
        title: "Canapés & Cocktails",
        detail: "Golden-hour drinks on the lawn while we steal away for photographs.",
      },
      {
        time: "17:00",
        title: "The Reception",
        detail: "Dinner, toasts and dancing into the evening.",
      },
    ],
  },
  venue: {
    eyebrow: "The Venue",
    title: "Green Leaves Country Lodge",
    name: "Green Leaves Country Lodge",
    area: "Skeerpoort · Hartbeespoort",
    address: "R560, Skeerpoort, Hartbeespoort, 0232",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Green+Leaves+Country+Lodge+%26+Venue,+R560,+Hartbeespoort",
    description:
      "Nestled in the Magalies Mountains on the banks of the Magalies River, Green Leaves rests among acres of pecan forest and sculptured gardens — historic French-country buildings, lawns beneath the mountains, and a chapel whose bell will ring as we say I do.",
    directions: [
      "Roughly 40 minutes from both Johannesburg and Pretoria, on the R560 near Skeerpoort.",
      "From Johannesburg: Malibongwe Drive towards the R512, then the R560.",
      "From Pretoria: N4 West (Magalies Freeway) towards Rustenburg, then the R560.",
      "Safe on-site parking with security for the evening.",
    ],
    image: "/images/venue.jpg",
  },
  countdown: {
    eyebrow: "Counting Down",
    title: "Until we say I do",
    labels: ["Days", "Hours", "Minutes", "Seconds"],
    finishedMessage: "Today is the day. See you at the garden.",
  },
  rsvp: {
    eyebrow: "Kindly Respond",
    heading: "Will you join us?",
    intro: "Your presence is the greatest gift.",
    deadlineLabel: "Please RSVP by 17 August 2026",
    entryNote:
      "So that we may welcome every guest by name, entry on the day is reserved for confirmed RSVPs only — please respond by the date above.",
    acceptLabel: "Joyfully Accept",
    declineLabel: "Regretfully Decline",
    submitLabel: "Send RSVP",
    dietaryOptions: [
      "Vegetarian",
      "Vegan",
      "Gluten-free",
      "Dairy-free",
      "Nut allergy",
      "Seafood allergy",
    ],
    successMessage: "Thank you — your RSVP has been received. We cannot wait to celebrate with you.",
  },
  dressCode: {
    eyebrow: "Attire",
    title: "Garden Formal",
    body:
      "Elegant and easy — suits and cocktail or floor-length dresses in soft, natural tones. The ceremony is on the lawn, so consider block heels. Kindly reserve white for the bride.",
    palette: ["#3F4A3C", "#7B8471", "#C9C2AE", "#EFEAE0", "#A98A64"],
  },
  stay: {
    eyebrow: "Where to Stay",
    title: "Rest Nearby",
    intro:
      "For guests making a night of it, Green Leaves itself offers country-lodge rooms, with more options in Hartbeespoort a short drive away — book early.",
    options: [
      {
        tier: "At the Venue",
        name: "Green Leaves Country Lodge",
        address: "R560, Skeerpoort, Hartbeespoort",
        blurb:
          "Stay where the celebration is — 33 four-star country rooms and safari-style tents among the gardens. Book directly with the lodge and mention the wedding.",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Green+Leaves+Country+Lodge+%26+Venue,+R560,+Hartbeespoort",
      },
      {
        tier: "Nearby · Hartbeespoort",
        name: "Hartbeespoort Guest Lodges",
        address: "Hartbeespoort Dam area",
        blurb:
          "A range of guesthouses and lodges around the dam village, 15–25 minutes from the venue — restaurants and the cableway close by.",
        mapsUrl: "https://maps.google.com/?q=guest+lodges+Hartbeespoort",
      },
    ],
  },
  faq: {
    eyebrow: "Good to Know",
    title: "Questions, Answered",
    items: [
      {
        q: "Can I bring a plus-one?",
        a: "Our guest list is reserved for the names on your invitation. If your invite includes a partner, we would love to host you both.",
      },
      {
        q: "Are children welcome?",
        a: "We adore your little ones, but this will be an adults-only celebration so everyone can relax into the evening.",
      },
      {
        q: "What about gifts?",
        a: "Your presence is truly enough. Should you wish to spoil us, a contribution towards our new life together would be warmly appreciated.",
      },
      {
        q: "Will the ceremony be outdoors?",
        a: "Yes — the ceremony is in the garden, with the reception indoors at the Stables Venue. September afternoons are golden; evenings can cool down, so bring a light layer.",
      },
    ],
  },
  footer: {
    families: "Chidavose · Zondo",
    thanks: "With love and gratitude",
    closing: "We cannot wait to celebrate with you.",
  },
};
