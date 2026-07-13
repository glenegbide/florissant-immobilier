"use client";

import { useEffect } from "react";

// The root layout renders <html lang="fr"> before the locale segment is
// known; this keeps the attribute honest on English pages.
export function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
