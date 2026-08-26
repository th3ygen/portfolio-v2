/** One of the 8 core loadout entries rendered in s01. */
export type LoadoutItem = {
  readonly name: string;
  readonly detail: string;
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
