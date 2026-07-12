import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { MobileMenu } from "./MobileMenu";
import type { Dict } from "@/lib/i18n";

export function Header({ locale, t }: { locale: string; t: Dict }) {
  const nav = [
    { href: `/${locale}/acheter`, label: t.nav.buy },
    { href: `/${locale}/louer`, label: t.nav.rent },
    { href: `/${locale}/vendre`, label: t.nav.sell },
    { href: `/${locale}/estimer`, label: t.nav.estimate },
    { href: `/${locale}/prestige`, label: t.nav.prestige },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-6">
          <Wordmark locale={locale} />

          <nav className="hidden lg:flex items-center gap-8 text-[0.9rem] text-ink">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="link-underline py-1 transition-colors hover:text-bordeaux"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href={`/${locale}/contact`}
              className="hidden sm:inline-block border border-line px-5 py-2.5 text-[0.75rem] uppercase tracking-[0.2em] text-ink transition-colors hover:border-bordeaux hover:text-bordeaux"
            >
              {t.nav.contact}
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-[0.82rem]">
              <Link
                href="/fr"
                className={
                  locale === "fr"
                    ? "text-bordeaux"
                    : "text-mutedbrand transition-colors hover:text-bordeaux"
                }
              >
                FR
              </Link>
              <span className="text-line">|</span>
              <Link
                href="/en"
                className={
                  locale === "en"
                    ? "text-bordeaux"
                    : "text-mutedbrand transition-colors hover:text-bordeaux"
                }
              >
                EN
              </Link>
            </div>
            <MobileMenu
              items={nav}
              contactHref={`/${locale}/contact`}
              contactLabel={t.nav.contact}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
