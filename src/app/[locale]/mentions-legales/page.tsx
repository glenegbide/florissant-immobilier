import type { Metadata } from "next";
import { site } from "@/lib/site";
import { pageAlternates } from "@/lib/routes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === "en";
  return {
    title: en ? "Legal notice" : "Mentions légales",
    description: en
      ? "Legal notice of Florissant Immobilier International."
      : "Mentions légales de Florissant Immobilier International.",
    alternates: pageAlternates(locale, "legal"),
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const en = locale === "en";

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <p className="eyebrow">Florissant Immobilier · International</p>
      <h1 className="mt-4 font-display text-4xl text-ink">
        {en ? "Legal notice" : "Mentions légales"}
      </h1>

      <div className="mt-10 space-y-8 text-sm font-light leading-relaxed text-ink/85">
        <div>
          <h2 className="font-display text-xl text-bordeaux">
            {en ? "Publisher" : "Éditeur"}
          </h2>
          <p className="mt-3">
            Florissant Immobilier · International
            <br />
            {site.city}
            <br />
            {en ? "Email" : "E-mail"} :{" "}
            <a href={`mailto:${site.email}`} className="text-bordeaux hover:underline">
              {site.email}
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl text-bordeaux">
            {en ? "Hosting" : "Hébergement"}
          </h2>
          <p className="mt-3">
            {en
              ? "This website is hosted by its infrastructure provider. Details available on request."
              : "Ce site est hébergé par son prestataire d'infrastructure. Coordonnées disponibles sur demande."}
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl text-bordeaux">
            {en ? "Intellectual property" : "Propriété intellectuelle"}
          </h2>
          <p className="mt-3">
            {en
              ? "All content on this site (texts, images, logo, graphic identity) is the property of Florissant Immobilier and may not be reproduced without prior written consent."
              : "L'ensemble des contenus de ce site (textes, images, logo, identité graphique) est la propriété de Florissant Immobilier et ne peut être reproduit sans autorisation écrite préalable."}
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl text-bordeaux">
            {en ? "Liability" : "Responsabilité"}
          </h2>
          <p className="mt-3">
            {en
              ? "Property information is provided for guidance only and is not contractually binding. Florissant Immobilier strives to keep listings accurate and up to date."
              : "Les informations relatives aux biens sont fournies à titre indicatif et sans valeur contractuelle. Florissant Immobilier s'efforce de tenir ses annonces exactes et à jour."}
          </p>
        </div>
      </div>
    </section>
  );
}
