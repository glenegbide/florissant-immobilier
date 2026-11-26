import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n";
import { getInscriptionDict } from "@/lib/inscription-i18n";
import { pageAlternates } from "@/lib/routes";
import { DossierForm } from "@/components/DossierForm";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getInscriptionDict(locale);
  return {
    title: t.metaTitle,
    description: t.intro,
    alternates: pageAlternates(locale, "inscription"),
  };
}

export default async function InscriptionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ paiement?: string; ref?: string }>;
}) {
  const { locale } = await params;
  const { paiement, ref } = await searchParams;
  const l = isLocale(locale) ? locale : "fr";
  const t = getInscriptionDict(l);
  const safeRef = ref && /^FL-[A-Z0-9]{5}$/.test(ref) ? ref : "";

  // Back from the Payrexx payment page. The CRM is updated by the webhook,
  // not by this redirect (anyone could open this URL).
  if (paiement === "ok" || paiement === "annule") {
    const ok = paiement === "ok";
    return (
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl text-ink lg:text-[3rem]">
          {ok ? t.paidTitle : t.payTitle}
        </h1>
        <p className="mt-5 max-w-xl text-[1.05rem] font-light leading-relaxed text-ink">
          {ok ? t.paidText : t.cancelledText}
        </p>
        {safeRef && <p className="mt-4 text-sm text-mutedbrand">Réf. <span className="font-mono text-ink">{safeRef}</span></p>}
        <a
          href={`https://wa.me/${site.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block bg-bordeaux px-6 py-3.5 text-[0.75rem] uppercase tracking-[0.2em] text-white"
        >
          WhatsApp
        </a>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl text-ink lg:text-[3rem]">{t.title}</h1>
      <p className="mt-5 max-w-xl text-[1.05rem] font-light leading-relaxed text-mutedbrand">{t.intro}</p>
      <div className="mt-10">
        <DossierForm locale={l} mode="inscription" />
      </div>
    </section>
  );
}
