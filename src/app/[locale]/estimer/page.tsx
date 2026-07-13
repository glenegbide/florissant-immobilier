import type { Metadata } from "next";
import { getDict, isLocale } from "@/lib/i18n";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { pageAlternates } from "@/lib/routes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === "en";
  return {
    title: en ? "Property valuation" : "Estimation de votre bien",
    description: en
      ? "Request a confidential, documented valuation of your property in Geneva, Vaud or French-speaking Switzerland."
      : "Demandez une estimation confidentielle et documentée de votre bien à Genève, dans le canton de Vaud ou en Suisse romande.",
    alternates: pageAlternates(locale, "estimate"),
  };
}

export default async function EstimatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);
  const l = isLocale(locale) ? locale : "fr";
  const en = l === "en";

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <div className="grid gap-14 lg:grid-cols-[1fr_360px]">
        <div>
          <Reveal>
            <p className="eyebrow">{t.nav.estimate}</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] text-ink lg:text-[3rem]">
              {en ? "What is your property " : "Que vaut votre bien, "}
              <em className="text-bordeaux">
                {en ? "really worth?" : "réellement ?"}
              </em>
            </h1>
            <p className="mt-5 max-w-xl text-[1.05rem] font-light leading-relaxed text-mutedbrand">
              {en
                ? "Tell us about your property — address, type, surface, condition. You will receive a confidential, documented opinion of value, without obligation."
                : "Parlez-nous de votre bien — adresse, type, surface, état. Vous recevrez un avis de valeur confidentiel et documenté, sans engagement."}
            </p>
          </Reveal>
          <div className="mt-10">
            <ContactForm
              t={t}
              locale={l}
              type="valuation"
              defaultSubject={en ? "Valuation request" : "Demande d'estimation"}
            />
          </div>
        </div>

        <aside className="h-fit space-y-6 border border-line bg-stone p-8">
          <h2 className="eyebrow">
            {en ? "What you receive" : "Ce que vous recevez"}
          </h2>
          <ul className="space-y-4 text-sm font-light leading-relaxed text-ink/85">
            {(en
              ? [
                  "A documented opinion of value based on comparable transactions",
                  "A reading of your micro-market: demand, timing, positioning",
                  "A recommended sale strategy — public or off market",
                  "Strict confidentiality, no obligation",
                ]
              : [
                  "Un avis de valeur documenté, fondé sur les transactions comparables",
                  "Une lecture de votre micro-marché : demande, tempo, positionnement",
                  "Une stratégie de vente recommandée — publique ou off market",
                  "Confidentialité stricte, sans engagement",
                ]
            ).map((x) => (
              <li key={x} className="flex items-start gap-3.5">
                <span className="mt-2.5 h-px w-5 shrink-0 bg-bordeaux" />
                {x}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
