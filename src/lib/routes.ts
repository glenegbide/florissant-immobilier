// Localized public URLs. The file-system routes use the French slugs;
// next.config.ts rewrites the English slugs onto them, so links must
// always be generated through these helpers.
export const pageSlugs = {
  buy: { fr: "acheter", en: "buy" },
  rent: { fr: "louer", en: "rent" },
  sell: { fr: "vendre", en: "sell" },
  estimate: { fr: "estimer", en: "valuation" },
  relocation: { fr: "relocation", en: "relocation" },
  properties: { fr: "biens", en: "properties" },
  about: { fr: "a-propos", en: "about" },
  contact: { fr: "contact", en: "contact" },
  legal: { fr: "mentions-legales", en: "legal" },
  privacy: { fr: "confidentialite", en: "privacy" },
} as const;

export type PageKey = keyof typeof pageSlugs;
type Loc = "fr" | "en";

function loc(locale: string): Loc {
  return locale === "en" ? "en" : "fr";
}

export function localePath(locale: string, key: PageKey | "home"): string {
  const l = loc(locale);
  if (key === "home") return `/${l}`;
  return `/${l}/${pageSlugs[key][l]}`;
}

/** Translate a full pathname (e.g. "/fr/acheter") to the equivalent page in the target locale. */
export function switchLocalePath(pathname: string, target: string): string {
  const t = loc(target);
  const segments = pathname.split("/").filter(Boolean);
  // segments[0] is the current locale (or not — then just go home)
  if (segments.length === 0 || (segments[0] !== "fr" && segments[0] !== "en")) {
    return `/${t}`;
  }
  const rest = segments.slice(1);
  if (rest.length === 0) return `/${t}`;

  // Property pages share the same reference in both languages.
  if (rest[0] === "bien") return `/${t}/${rest.join("/")}`;

  // Match the slug in either language: behind a rewrite, usePathname()
  // can report the internal (French) path even on an English URL.
  for (const key of Object.keys(pageSlugs) as PageKey[]) {
    if (pageSlugs[key].fr === rest[0] || pageSlugs[key].en === rest[0]) {
      return `/${t}/${[pageSlugs[key][t], ...rest.slice(1)].join("/")}`;
    }
  }
  return `/${t}`;
}
