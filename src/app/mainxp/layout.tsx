import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "MAINXP", template: "%s · MAINXP" },
  description: "Your life is the Main Quest.",
  // Personal product area on the agency's domain — keep it out of search engines.
  robots: { index: false, follow: false },
};

export default function MainxpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-mxp-bg text-mxp-ink">
      <div className="mx-auto min-h-screen w-full max-w-md border-x border-mxp-line bg-mxp-bg">
        {children}
      </div>
    </div>
  );
}
