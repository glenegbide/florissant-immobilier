import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n";

const titles: Record<string, { fr: string; en: string; sub: { fr: string; en: string } }> = {
  vendre: {
    fr: "Vendre votre bien",
    en: "Sell your property",
    sub: {
      fr: "Confiez-nous la vente de votre bien : estimation rigoureuse, mise en marché discrète, négociation experte.",
      en: "Entrust us with the sale of your property: rigorous valuation, discreet marketing, expert negotiation.",
    },
  },
  estimer: {
    fr: "Estimation de votre bien",
    en: "Property valuation",
    sub: {
      fr: "Obtenez une estimation confidentielle et documentée de votre bien par nos experts du marché genevois.",
      en: "Receive a confidential, documented valuation of your property from our Geneva market experts.",
    },
  },
  prestige: {
    fr: "Collection Prestige",
    en: "Prestige Collection",
    sub: {
      fr: "Une sélection confidentielle de biens d'exception, présentés uniquement à nos clients privilégiés.",
      en: "A confidential selection of exceptional properties, presented only to our distinguished clients.",
    },
  },
  contact: {
    fr: "Contact",
    en: "Contact",
    sub: {
      fr: "Notre équipe se tient à votre disposition. Écrivez-nous à info@florissant-immobilier.ch.",
      en: "Our team is at your disposal. Write to us at info@florissant-immobilier.ch.",
    },
  },
};

export default async function GenericPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  const t = getDict(locale);
  const key = slug[0];
  const entry = titles[key];
  if (!entry) notFound();
  const lang = locale === "en" ? "en" : "fr";

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24 text-center">
      <p className="eyebrow">
        Florissant Immobilier · International
      </p>
      <h1 className="mt-4 font-display text-4xl text-bordeaux">
        {entry ? entry[lang] : key}
      </h1>
      <p className="mt-6 text-[1.02rem] font-light leading-relaxed text-ink/80">
        {entry ? entry.sub[lang] : ""}
      </p>
      <Link
        href={`/${locale}/contact`}
        className="mt-10 inline-block bg-bordeaux px-7 py-3.5 text-[0.8rem] uppercase tracking-[0.18em] text-white hover:bg-bordeaux-soft transition-colors"
      >
        {t.nav.contact}
      </Link>
    </section>
  );
}
