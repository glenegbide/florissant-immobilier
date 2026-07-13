import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getDict } from "@/lib/i18n";
import { Reveal } from "@/components/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === "en";
  return {
    title: en ? "Sell your property" : "Vendre votre bien",
    description: en
      ? "Entrust the sale of your property in Geneva or Vaud to a discreet agency: precise valuation, tailored marketing, rigorous negotiation."
      : "Confiez la vente de votre bien à Genève ou dans le canton de Vaud à une maison discrète : estimation précise, mise en marché sur mesure, négociation rigoureuse.",
  };
}

const steps = {
  fr: [
    {
      title: "Estimation & stratégie",
      text: "Analyse du bien, du quartier et des transactions comparables. Nous convenons ensemble d'un prix et d'une stratégie — publique ou off market.",
    },
    {
      title: "Préparation & mise en valeur",
      text: "Photographies soignées, dossier de vente complet, présentation à la hauteur du bien. La première impression n'arrive qu'une fois.",
    },
    {
      title: "Diffusion ciblée",
      text: "Présentation à notre clientèle qualifiée et, si souhaité, diffusion publique. Chaque visite est préparée et accompagnée.",
    },
    {
      title: "Négociation & signature",
      text: "Nous menons la négociation, coordonnons notaire et financement, et vous accompagnons jusqu'à la remise des clés.",
    },
  ],
  en: [
    {
      title: "Valuation & strategy",
      text: "Analysis of the property, its neighbourhood and comparable transactions. Together we agree a price and a strategy — public or off market.",
    },
    {
      title: "Preparation & presentation",
      text: "Considered photography, a complete sales file, a presentation worthy of the property. First impressions only happen once.",
    },
    {
      title: "Targeted exposure",
      text: "Presented to our qualified clientele and, if desired, publicly listed. Every viewing is prepared and personally accompanied.",
    },
    {
      title: "Negotiation & signature",
      text: "We lead the negotiation, coordinate notary and financing, and stay at your side until the keys change hands.",
    },
  ],
};

export default async function SellPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);
  const en = locale === "en";
  const list = en ? steps.en : steps.fr;

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal>
            <p className="eyebrow">{t.nav.sell}</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] text-ink lg:text-[3rem]">
              {en ? "Sell with " : "Vendre avec "}
              <em className="text-bordeaux">
                {en ? "discretion and precision" : "discrétion et précision"}
              </em>
            </h1>
            <p className="mt-6 max-w-lg text-[1.05rem] font-light leading-relaxed text-mutedbrand">
              {en
                ? "Your property deserves more than a listing: it deserves a strategy. We sell few properties, and we sell them well."
                : "Votre bien mérite mieux qu'une annonce : il mérite une stratégie. Nous vendons peu de biens, et nous les vendons bien."}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href={`/${locale}/estimer`}
                className="arrow-link bg-bordeaux px-7 py-3.5 text-[0.75rem] uppercase tracking-[0.2em] text-white transition-colors hover:bg-bordeaux-soft"
              >
                {en ? "Request a valuation" : "Demander une estimation"}{" "}
                <span className="arrow ml-1">→</span>
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="border border-line px-7 py-3.5 text-[0.75rem] uppercase tracking-[0.2em] text-ink transition-colors hover:border-bordeaux hover:text-bordeaux"
              >
                {t.nav.contact}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={150} className="relative">
            <div className="pointer-events-none absolute -bottom-3 -left-3 hidden h-full w-full border border-bordeaux/25 lg:block" />
            <div className="relative aspect-[4/3] overflow-hidden bg-stone">
              <Image
                src="/photos/parquet_room.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-stone">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
          <Reveal>
            <p className="eyebrow">
              {en ? "How we work" : "Notre méthode"}
            </p>
          </Reveal>
          <div className="mt-10 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {list.map((s, i) => (
              <Reveal key={s.title} delay={i * 90} className="h-full">
                <div className="flex h-full flex-col bg-stone p-7 transition-colors duration-500 hover:bg-white">
                  <span className="font-mono text-[0.7rem] tracking-[0.2em] text-bordeaux">
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-xl text-ink">{s.title}</h3>
                  <p className="mt-2.5 text-sm font-light leading-relaxed text-mutedbrand">
                    {s.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
