import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Confidentialité",
  description:
    "Politique de confidentialité et protection des données de Florissant Immobilier.",
};

export default async function PrivacyPage({
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
        {en ? "Privacy policy" : "Politique de confidentialité"}
      </h1>

      <div className="mt-10 space-y-8 text-sm font-light leading-relaxed text-ink/85">
        <p>
          {en
            ? "Florissant Immobilier respects your privacy and processes personal data in accordance with the Swiss Federal Act on Data Protection (nFADP)."
            : "Florissant Immobilier respecte votre vie privée et traite les données personnelles conformément à la Loi fédérale sur la protection des données (nLPD)."}
        </p>

        <div>
          <h2 className="font-display text-xl text-bordeaux">
            {en ? "Data we collect" : "Données collectées"}
          </h2>
          <p className="mt-3">
            {en
              ? "When you use our contact form, we collect the name, email, phone number and message you provide, solely to respond to your enquiry."
              : "Lorsque vous utilisez notre formulaire de contact, nous collectons le nom, l'e-mail, le numéro de téléphone et le message que vous fournissez, uniquement afin de répondre à votre demande."}
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl text-bordeaux">
            {en ? "Use and retention" : "Utilisation et conservation"}
          </h2>
          <p className="mt-3">
            {en
              ? "Your data is never sold or shared with third parties for marketing. It is kept only as long as necessary to handle your request and our commercial relationship."
              : "Vos données ne sont jamais vendues ni transmises à des tiers à des fins marketing. Elles sont conservées uniquement le temps nécessaire au traitement de votre demande et à notre relation commerciale."}
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl text-bordeaux">
            {en ? "Your rights" : "Vos droits"}
          </h2>
          <p className="mt-3">
            {en
              ? "You may request access, correction or deletion of your personal data at any time by writing to "
              : "Vous pouvez à tout moment demander l'accès, la rectification ou la suppression de vos données personnelles en écrivant à "}
            <a href={`mailto:${site.email}`} className="text-bordeaux hover:underline">
              {site.email}
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
