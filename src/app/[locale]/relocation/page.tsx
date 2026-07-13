import type { Metadata } from "next";
import { getDict, isLocale } from "@/lib/i18n";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === "en";
  return {
    title: en ? "Relocation to Switzerland" : "Relocation en Suisse",
    description: en
      ? "Relocation support in French-speaking Switzerland: home search, viewings, applications and settling in — Geneva, Vaud, Lausanne."
      : "Accompagnement relocation en Suisse romande : recherche de logement, visites, dossiers et installation — Genève, Vaud, Lausanne.",
    alternates: {
      canonical: `/${en ? "en" : "fr"}/relocation`,
      languages: { fr: "/fr/relocation", en: "/en/relocation" },
    },
  };
}

const steps = {
  fr: [
    {
      title: "Cahier des charges",
      text: "Nous définissons ensemble vos besoins : budget, quartiers, écoles, transports, calendrier d'arrivée.",
    },
    {
      title: "Recherche & visites",
      text: "Sélection ciblée de biens à louer ou à acheter, visites organisées — sur place ou à distance en vidéo.",
    },
    {
      title: "Dossier & bail",
      text: "Constitution d'un dossier solide, présentation aux régies et propriétaires, relecture du bail avant signature.",
    },
    {
      title: "Installation",
      text: "État des lieux, assurances, services — nous restons à vos côtés jusqu'à ce que vous soyez installés.",
    },
  ],
  en: [
    {
      title: "Your brief",
      text: "Together we define your needs: budget, neighbourhoods, schools, transport, arrival timeline.",
    },
    {
      title: "Search & viewings",
      text: "A targeted selection of properties to rent or buy, with viewings organised in person or remotely by video.",
    },
    {
      title: "Application & lease",
      text: "A strong application file, presented to agencies and owners, with the lease reviewed before you sign.",
    },
    {
      title: "Settling in",
      text: "Inventory, insurance, utilities — we stay at your side until you are fully settled.",
    },
  ],
};

export default async function RelocationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);
  const l = isLocale(locale) ? locale : "fr";
  const en = l === "en";
  const list = en ? steps.en : steps.fr;

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">{t.nav.relocation}</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] text-ink lg:text-[3rem]">
              {en ? "Arrive in Switzerland, " : "Arriver en Suisse, "}
              <em className="text-bordeaux">
                {en ? "already at home." : "déjà chez soi."}
              </em>
            </h1>
            <p className="mt-6 max-w-lg text-[1.05rem] font-light leading-relaxed text-mutedbrand">
              {en
                ? "For individuals and companies moving to Geneva, Vaud or anywhere in French-speaking Switzerland: we find your home and handle everything around it."
                : "Pour les particuliers et les entreprises qui s'installent à Genève, dans le canton de Vaud ou ailleurs en Suisse romande : nous trouvons votre logement et gérons tout ce qui l'entoure."}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-stone">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
          <Reveal>
            <p className="eyebrow">{en ? "How we work" : "Notre méthode"}</p>
          </Reveal>
          <div className="mt-10 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {list.map((s, i) => (
              <Reveal key={s.title} delay={i * 90} className="h-full">
                <div className="flex h-full flex-col bg-stone p-7 transition-colors duration-500 hover:bg-white">
                  <span className="font-mono text-[0.7rem] tracking-[0.2em] text-bordeaux">
                    0{i + 1}
                  </span>
                  <h2 className="mt-4 font-display text-xl text-ink">{s.title}</h2>
                  <p className="mt-2.5 text-sm font-light leading-relaxed text-mutedbrand">
                    {s.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <Reveal>
          <p className="eyebrow">{t.contact.eyebrow}</p>
          <h2 className="mt-4 font-display text-3xl text-ink lg:text-[2.4rem]">
            {en ? "Tell us about your move" : "Parlez-nous de votre installation"}
          </h2>
          <div className="mt-10">
            <ContactForm
              t={t}
              locale={l}
              defaultSubject={en ? "Relocation enquiry" : "Demande de relocation"}
            />
          </div>
        </Reveal>
      </section>
    </>
  );
}
