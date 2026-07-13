"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { switchLocalePath } from "@/lib/routes";

export function LanguageSwitcher({
  locale,
  className = "",
  onNavigate,
}: {
  locale: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "/";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Link
        href={switchLocalePath(pathname, "fr")}
        onClick={onNavigate}
        aria-current={locale === "fr" ? "true" : undefined}
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
        href={switchLocalePath(pathname, "en")}
        onClick={onNavigate}
        aria-current={locale === "en" ? "true" : undefined}
        className={
          locale === "en"
            ? "text-bordeaux"
            : "text-mutedbrand transition-colors hover:text-bordeaux"
        }
      >
        EN
      </Link>
    </div>
  );
}
