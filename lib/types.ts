/** One of the 8 core loadout entries rendered in s01. */
export type LoadoutItem = {
  readonly name: string;
  readonly detail: string;
  /**
   * The equipment slot this item is mounted in — PRIMARY, TRANSPORT, and so on.
   *
   * The gear panel labels the SLOT, not the item, exactly as a character screen
   * labels HEAD and CHEST rather than the helmet in them. It is what lets eight
   * unrelated technologies read as one loadout: the roles are fixed, and these
   * are what happens to be equipped in them.
   */
  readonly slot: string;
  /**
   * The brand mark's slug under `public/img/logos`, without the extension.
   *
   * Used as a CSS mask rather than as an image, so the slot can hold the
   * silhouette at rest and cross to `logoColor` on hover. That is only possible
   * because the files are single-path marks with no inline fill — see the
   * README beside them.
   */
  readonly logo: string;

  /**
   * What the mark resolves to when a pointer is on the slot.
   *
   * The brand hex where it survives this page's near-black ground, and an
   * adjustment where it does not — the threshold is 4:1 against #070809.
   * Next.js and WebRTC are achromatic marks whose own dark-background form is
   * white; MQTT's #660066 and Flutter's #02569B are lightened along their own
   * hue rather than replaced, so the brand is still recognisable. Stated per
   * item rather than computed at runtime: this is a design decision about
   * eight specific marks, not a rule worth a colour library.
   */
  readonly logoColor: string;
  /** Two entries are accent-coloured in the design; this is not decorative. */
  readonly accent?: boolean;
};

/** One lettered category of the s02 full manifest. */
export type ManifestCategory = {
  readonly letter: string;
  readonly category: string;
  readonly items: readonly string[];
};

/** A labelled fact shown beside a spotlight project (CLIENT, MY ROLE, …). */
export type SpotlightMeta = {
  readonly label: string;
  readonly value: string;
};

/** One of the 4 detailed s03 projects. */
export type Spotlight = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly tagline: string;
  readonly years: string;
  readonly tags: readonly string[];
  readonly blurb: string;
  readonly meta: readonly SpotlightMeta[];
  readonly stack: string;
  readonly image: string;
};

/** One row of the 16-row s04 lookup table. */
export type IndexRow = {
  readonly n: string;
  readonly name: string;
  readonly sector: string;
  readonly keyTech: string;
  readonly access: 'PRIVATE' | 'PUBLIC';
};

/** One of the 5 reverse-chronological s05 career posts. */
export type TrajectoryPost = {
  readonly post: string;
  readonly year: string;
  readonly tag: string;
  readonly status: 'ACTIVE' | 'ARCHIVED';
  readonly role: string;
  readonly org: string;
  readonly body: string;
};

export type Stat = {
  readonly label: string;
  readonly value: string;
};

export type ContactChannel = {
  readonly label: string;
  readonly value: string;
  readonly href?: string;
};

/** An organisation shown in the s03 client grid. */
export type Client = {
  /** Matches the filename in public/img/clients-mono. */
  readonly slug: string;
  readonly name: string;
  /**
   * Terse form for the reticle's lock readout. The full name trails the cursor
   * across neighbouring cells — "Kementerian Pertanian dan Keterjaminan
   * Makanan" is 45 characters — and a HUD readout should be a callsign.
   */
  readonly short: string;
};
