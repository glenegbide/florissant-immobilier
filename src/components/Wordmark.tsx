import Link from "next/link";

export function Wordmark({
  locale,
  onDark = false,
}: {
  locale: string;
  onDark?: boolean;
}) {
  const suffix = onDark ? "-ivory" : "";
  return (
    <Link href={`/${locale}`} className="flex items-center gap-3.5">
      {/* Vector logo — crisp at every size and zoom */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/logo/icon${suffix}.svg`}
        alt=""
        className="h-14 w-auto shrink-0"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/logo/wordmark${suffix}.svg`}
        alt="Florissant Immobilier — International"
        className="h-[2.4rem] md:h-[2.6rem] w-auto"
      />
    </Link>
  );
}
