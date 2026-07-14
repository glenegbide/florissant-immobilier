// ─────────────────────────────────────────────────────────────
//  Florissant Immobilier International — central site settings
//  Paste your real links between the quotes. Leave "" to hide.
// ─────────────────────────────────────────────────────────────
export const site = {
  name: "Florissant Immobilier International",
  domain: "florissantimmobilier.ch",
  url: "https://florissantimmobilier.ch",
  email: "glen@florissantimmobilier.ch",
  phone: "+41 76 452 10 91",
  // wa.me link — digits only, no "+", no spaces
  whatsapp: "41764521091",
  city: "Genève, Suisse",
  regions: ["Genève", "Nyon", "Gland", "Rolle", "Lausanne", "Canton de Vaud", "Suisse romande"],

  socials: {
    instagram: "https://www.instagram.com/florissantimmobilier",
    facebook: "https://www.facebook.com/florissantimmobilier",
    linkedin: "https://www.linkedin.com/company/florissant-immobilier/",
  },
};

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || site.url;
