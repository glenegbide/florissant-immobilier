import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n";
import { getDossierDict } from "@/lib/dossier-i18n";
import { DossierForm } from "@/components/DossierForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const d = getDossierDict(locale);
  return {
    title: d.metaTitle,
    description: d.intro,
    // Private link sent to clients: keep it out of search engines.
    robots: { index: false, follow: false },
  };
}

export default async function DossierPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : "fr";
  const d = getDossierDict(l);

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
      <p className="eyebrow">{d.eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl text-ink lg:text-[3rem]">{d.title}</h1>
      <p className="mt-5 max-w-xl text-[1.05rem] font-light leading-relaxed text-mutedbrand">
        {d.intro}
      </p>
      <div className="mt-10">
        <DossierForm locale={l} />
      </div>
    </section>
  );
}
