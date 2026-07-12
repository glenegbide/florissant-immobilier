import type { Metadata } from "next";
import { getDict, isLocale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { ContactForm } from "@/components/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return {
    title: `${t.contact.title} — Florissant Immobilier`,
    description: t.contact.intro,
  };
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { locale } = await params;
  const { ref } = await searchParams;
  const t = getDict(locale);
  const l = isLocale(locale) ? locale : "fr";

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <div className="grid gap-14 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="eyebrow">{t.contact.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl text-ink lg:text-[3rem]">
            {t.contact.title}
          </h1>
          <p className="mt-5 max-w-xl text-[1.05rem] font-light leading-relaxed text-mutedbrand">
            {t.contact.intro}
          </p>
          <div className="mt-10">
            <ContactForm t={t} locale={l} reference={ref} />
          </div>
        </div>

        <aside className="h-fit border border-line bg-stone p-8">
          <h2 className="eyebrow">{t.contact.directTitle}</h2>
          <ul className="mt-6 space-y-4 text-sm">
            <li>
              <span className="block text-mutedbrand">{t.contact.email}</span>
              <a
                href={`mailto:${site.email}`}
                className="link-underline text-ink transition-colors hover:text-bordeaux"
              >
                {site.email}
              </a>
            </li>
            {site.phone && (
              <li>
                <span className="block text-mutedbrand">{t.contact.phone}</span>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="link-underline text-ink transition-colors hover:text-bordeaux"
                >
                  {site.phone}
                </a>
              </li>
            )}
            <li>
              <span className="block text-mutedbrand">Adresse</span>
              <span className="text-ink">{site.city}</span>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
