import type { Metadata } from "next";
import Link from "next/link";
import { getDict, isLocale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { localePath } from "@/lib/routes";
import { Reveal } from "@/components/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === "en";
  return {
    title: en ? "About us" : "À propos",
    description: en
      ? "Florissant Immobilier International — a Swiss real estate agency serving Geneva, Vaud and French-speaking Switzerland, with an international outlook."
      : "Florissant Immobilier International — une agence immobilière suisse au service de Genève, du canton de Vaud et de la Suisse romande, avec une ouverture internationale.",
    alternates: {
      canonical: en ? "/en/about" : "/fr/a-propos",
      languages: { fr: "/fr/a-propos", en: "/en/about" },
    },
  };
}

const values = {
  fr: [
    {
      title: "Discrétion",
      text: "Peu de mandats, beaucoup d'attention. Chaque projet est traité avec la confidentialité qu'il mérite — off market sur demande.",
    },
    {
      title: "Précision",
      text: "Des estimations documentées, des dossiers rigoureux, une négociation préparée. Le détail fait la différence.",
    },
    {
      title: "Ouverture internationale",
      text: "Une clientèle locale et internationale, un accompagnement en français et en anglais, une lecture globale du marché suisse.",
    },
  ],
  en: [
    {
      title: "Discretion",
      text: "Few mandates, full attention. Every project is handled with the confidentiality it deserves — off market on request.",
    },
    {
      title: "Precision",
      text: "Documented valuations, rigorous files, well-prepared negotiation. The detail makes the difference.",
    },
    {
      title: "International outlook",
      text: "A local and international clientele, guidance in French and English, a global reading of the Swiss market.",
    },
  ],
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);
  const l = isLocale(locale) ? locale : "fr";
  const en = l === "en";
  const list = en ? values.en : values.fr;

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">{t.nav.about}</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] text-ink lg:text-[3rem]">
              {en ? "Your project, " : "Votre projet, "}
              <em className="text-bordeaux">
                {en ? "our mission." : "notre mission."}
              </em>
            </h1>
            <p className="mt-6 max-w-lg text-[1.05rem] font-light leading-relaxed text-mutedbrand">
              {en
                ? "Florissant Immobilier International is a Swiss real estate agency: sales, rentals, valuations, relocation and owner services across Geneva, the canton of Vaud and French-speaking Switzerland — with an international perspective."
                : "Florissant Immobilier International est une agence immobilière suisse : vente, location, estimation, relocation et services aux propriétaires à Genève, dans le canton de Vaud et en Suisse romande — avec une vision internationale."}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-stone">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
          <div className="grid gap-px bg-line sm:grid-cols-3">
            {list.map((v, i) => (
              <Reveal key={v.title} delay={i * 110} className="h-full">
                <div className="flex h-full flex-col bg-stone p-7 transition-colors duration-500 hover:bg-white lg:p-8">
                  <span className="font-mono text-[0.7rem] tracking-[0.2em] text-bordeaux">
                    0{i + 1}
                  </span>
                  <h2 className="mt-5 font-display text-2xl text-ink">{v.title}</h2>
                  <p className="mt-2.5 text-sm font-light leading-relaxed text-mutedbrand">
                    {v.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <Reveal>
            <p className="eyebrow">{t.home.regionsEyebrow}</p>
            <h2 className="mt-5 font-display text-3xl leading-[1.12] text-ink lg:text-[2.4rem]">
              {t.home.regionsTitleA}
              <em className="text-bordeaux">{t.home.regionsTitleEm}</em>
            </h2>
            <p className="mt-6 max-w-lg text-[1.02rem] font-light leading-relaxed text-mutedbrand">
              {t.home.regionsText}
            </p>
            <Link
              href={localePath(l, "contact")}
              className="arrow-link mt-10 inline-block border border-bordeaux px-7 py-3.5 text-[0.75rem] uppercase tracking-[0.2em] text-bordeaux transition-colors hover:bg-bordeaux hover:text-white"
            >
              {t.hero.ctaContact} <span className="arrow ml-1">→</span>
            </Link>
          </Reveal>

          <Reveal delay={150}>
            <ul className="border-t border-line">
              {site.regions.map((r) => (
                <li
                  key={r}
                  className="flex items-center gap-4 border-b border-line py-4 text-[0.95rem] font-light text-ink/85"
                >
                  <span className="h-px w-6 shrink-0 bg-bordeaux" />
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
