import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { SocialIcons } from "./SocialIcons";
import { site } from "@/lib/site";
import { localePath } from "@/lib/routes";
import type { Dict } from "@/lib/i18n";

export function Footer({ locale, t }: { locale: string; t: Dict }) {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark locale={locale} />
            <p className="mt-5 max-w-xs text-sm font-light leading-relaxed text-mutedbrand">
              {t.footer.tagline}
            </p>
            <p className="mt-4 text-[0.68rem] uppercase tracking-[0.2em] text-mutedbrand">
              {t.footer.regions}
            </p>
            <SocialIcons className="mt-6" />
          </div>

          <div>
            <h3 className="eyebrow mb-6">{t.footer.quickLinks}</h3>
            <ul className="space-y-3.5 text-sm text-ink">
              {[
                { href: localePath(locale, "buy"), label: t.nav.buy },
                { href: localePath(locale, "rent"), label: t.nav.rent },
                { href: localePath(locale, "sell"), label: t.nav.sell },
                { href: localePath(locale, "estimate"), label: t.nav.estimate },
                { href: localePath(locale, "relocation"), label: t.nav.relocation },
                { href: localePath(locale, "about"), label: t.nav.about },
                { href: localePath(locale, "contact"), label: t.nav.contact },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="link-underline transition-colors hover:text-bordeaux"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow mb-6">{t.footer.contact}</h3>
            <ul className="space-y-3.5 text-sm text-ink">
              <li className="text-mutedbrand">{site.city}</li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="link-underline transition-colors hover:text-bordeaux"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="link-underline transition-colors hover:text-bordeaux"
                >
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${site.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline transition-colors hover:text-bordeaux"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-line pt-6 text-xs font-light text-mutedbrand">
          <p>
            © {new Date().getFullYear()} {site.name}. {t.footer.rights}
          </p>
          <div className="flex gap-7">
            <Link
              href={localePath(locale, "legal")}
              className="transition-colors hover:text-bordeaux"
            >
              {t.footer.legal}
            </Link>
            <Link
              href={localePath(locale, "privacy")}
              className="transition-colors hover:text-bordeaux"
            >
              {t.footer.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
