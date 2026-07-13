"use client";

import { useState } from "react";
import Image from "next/image";
import {
  objectTypeGroups,
  subtypesByType,
  allFeatures,
  roomOptions,
  cantons,
} from "@/lib/admin-options";

export type PropertyFormData = {
  id?: string;
  reference?: string;
  offerType: "RENT" | "SALE";
  objectType: string;
  objectSubtype: string | null;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  street: string | null;
  hideStreet: boolean;
  postalCode: string | null;
  city: string;
  district: string | null;
  canton: string;
  country: string;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  buildingFloors: number | null;
  livingArea: number | null;
  usableArea: number | null;
  landArea: number | null;
  volume: number | null;
  ceilingHeight: number | null;
  yearBuilt: number | null;
  lastRenovation: number | null;
  availability: string;
  availableFrom: string | null; // yyyy-mm-dd
  price: number | null;
  charges: number | null;
  grossRent: number | null;
  priceOnRequest: boolean;
  priceUnit: string;
  chargesIncluded: boolean;
  features: string[];
  photos: string[];
  floorPlans: string[];
  brochureUrl: string | null;
  videoUrl: string | null;
  virtualTourUrl: string | null;
  offMarket: boolean;
  featured: boolean;
  status: string;
  transactionStatus: string;
  expiresAt: string | null; // yyyy-mm-dd
  seoTitleFr: string | null;
  seoTitleEn: string | null;
  seoDescFr: string | null;
  seoDescEn: string | null;
  internalNotes: string;
  ownerName: string | null;
  ownerContact: string | null;
  commission: string | null;
  listingSource: string | null;
  syncStatus: string | null;
  lastSyncAt: string | null; // display only
  externalIdsDisplay: string; // display only
};

const inputCls =
  "w-full border border-line bg-white px-3.5 py-2.5 text-[0.95rem] text-ink outline-none focus:border-bordeaux transition-colors";
const labelCls = "block text-sm font-medium text-ink mb-1.5";

const STEPS = [
  "Informations de base",
  "Localisation",
  "Prix et charges",
  "Pièces, surfaces et équipements",
  "Descriptions FR / EN",
  "Images, plans et documents",
  "Publication, statut et SEO",
  "Interne et portails externes",
];

function Field({
  label,
  suffix,
  children,
}: {
  label: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        {children}
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-mutedbrand pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function PropertyForm({
  property,
  action,
  deleteAction,
}: {
  property?: PropertyFormData;
  action: (fd: FormData) => Promise<void>;
  deleteAction?: (fd: FormData) => Promise<void>;
}) {
  const p = property;
  const [step, setStep] = useState(0);
  const [offerType, setOfferType] = useState<"RENT" | "SALE">(p?.offerType ?? "RENT");
  const [objectType, setObjectType] = useState(p?.objectType ?? "appartement");
  const [availability, setAvailability] = useState(p?.availability ?? "immediately");
  const [priceOnRequest, setPriceOnRequest] = useState(p?.priceOnRequest ?? false);
  const [photos, setPhotos] = useState<string[]>(p?.photos ?? []);
  const [plans, setPlans] = useState<string[]>(p?.floorPlans ?? []);
  const [brochure, setBrochure] = useState<string | null>(p?.brochureUrl ?? null);
  const [titleFr, setTitleFr] = useState(p?.titleFr ?? "");
  const [city, setCity] = useState(p?.city ?? "");
  const [error, setError] = useState("");

  const subtypes = subtypesByType[objectType] ?? [];
  const rent = offerType === "RENT";

  function movePhoto(from: number, to: number) {
    if (to < 0 || to >= photos.length) return;
    setPhotos((arr) => {
      const next = [...arr];
      const [x] = next.splice(from, 1);
      next.splice(to, 0, x);
      return next;
    });
  }

  function goTo(next: number) {
    // Light validation when moving forward past the step that owns the field.
    if (next > 1 && !city.trim()) {
      setStep(1);
      setError("Le lieu (ville) est obligatoire — étape 2.");
      return;
    }
    if (next > 4 && !titleFr.trim()) {
      setStep(4);
      setError("Le titre en français est obligatoire — étape 5.");
      return;
    }
    setError("");
    setStep(next);
    window.scrollTo({ top: 0 });
  }

  const hidden = (i: number) => (step === i ? "" : "hidden");

  return (
    <div className="grid gap-10 lg:grid-cols-[230px_1fr]">
      {/* ── Step navigation ── */}
      <aside className="h-fit lg:sticky lg:top-8">
        <ol className="border-t border-line">
          {STEPS.map((s, i) => (
            <li key={s} className="border-b border-line">
              <button
                type="button"
                onClick={() => goTo(i)}
                className={`flex w-full items-baseline gap-3 py-3 text-left text-[0.82rem] transition-colors ${
                  step === i ? "text-bordeaux" : "text-mutedbrand hover:text-ink"
                }`}
              >
                <span className="font-mono text-[0.65rem]">{i + 1}</span>
                {s}
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <form action={action} className="max-w-3xl">
        {p?.id && <input type="hidden" name="id" value={p.id} />}

        <p className="eyebrow">
          Étape {step + 1} / {STEPS.length}
        </p>
        <h2 className="mt-2 mb-8 font-display text-2xl text-bordeaux">{STEPS[step]}</h2>
        {error && (
          <p className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* ── Step 1 · Informations de base ── */}
        <section className={`space-y-5 ${hidden(0)}`}>
          <div>
            <p className={labelCls}>Immobilier à</p>
            <div className="flex gap-6">
              {(
                [
                  ["RENT", "Location"],
                  ["SALE", "Vente"],
                ] as const
              ).map(([v, label]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="offerType"
                    value={v}
                    checked={offerType === v}
                    onChange={() => setOfferType(v)}
                    className="h-4 w-4 accent-[#521f26]"
                  />
                  <span className="text-[0.95rem]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Type d'objet *">
              <select
                name="objectType"
                value={objectType}
                onChange={(e) => setObjectType(e.target.value)}
                className={inputCls}
              >
                {objectTypeGroups.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="Sous-type">
              <select
                name="objectSubtype"
                defaultValue={p?.objectSubtype ?? ""}
                className={inputCls}
              >
                <option value="">Sélectionnez</option>
                {subtypes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {p?.reference && (
            <p className="text-sm text-mutedbrand">
              Référence interne : <span className="font-mono">{p.reference}</span>
            </p>
          )}
        </section>

        {/* ── Step 2 · Localisation ── */}
        <section className={`space-y-5 ${hidden(1)}`}>
          <Field label="Rue & No.">
            <input name="street" defaultValue={p?.street ?? ""} className={inputCls} />
          </Field>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="hideStreet"
              defaultChecked={p?.hideStreet ?? false}
              className="h-4 w-4 accent-[#521f26]"
            />
            <span className="text-[0.95rem]">
              Ne pas afficher la rue et le numéro publiquement
            </span>
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="NPA & lieu *">
              <div className="flex gap-3">
                <input
                  name="postalCode"
                  defaultValue={p?.postalCode ?? ""}
                  placeholder="NPA"
                  className={inputCls + " max-w-[110px]"}
                />
                <input
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Lieu"
                  className={inputCls}
                />
              </div>
            </Field>
            <div className="grid gap-5 grid-cols-2">
              <Field label="Canton">
                <select name="canton" defaultValue={p?.canton ?? "GE"} className={inputCls}>
                  {cantons.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Pays">
                <select name="country" defaultValue={p?.country ?? "Suisse"} className={inputCls}>
                  <option>Suisse</option>
                  <option>France</option>
                </select>
              </Field>
            </div>
          </div>
          <Field label="Quartier (affiché sur la carte du bien)">
            <input
              name="district"
              defaultValue={p?.district ?? ""}
              placeholder="Champel, Eaux-Vives…"
              className={inputCls}
            />
          </Field>
        </section>

        {/* ── Step 3 · Prix et charges ── */}
        <section className={`space-y-5 ${hidden(2)}`}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={rent ? "Loyer net" : "Prix de vente"}>
              <div className="flex">
                <span className="flex items-center border border-r-0 border-line bg-ivory-alt px-3.5 text-sm text-mutedbrand">
                  CHF
                </span>
                <input
                  name="price"
                  type="number"
                  defaultValue={p?.price ?? ""}
                  placeholder={priceOnRequest ? "sur demande" : ""}
                  disabled={priceOnRequest}
                  className={inputCls + " disabled:bg-ivory-alt disabled:text-mutedbrand"}
                />
              </div>
            </Field>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="priceOnRequest"
                  checked={priceOnRequest}
                  onChange={(e) => setPriceOnRequest(e.target.checked)}
                  className="h-4 w-4 accent-[#521f26]"
                />
                <span className="text-[0.95rem]">Prix sur demande</span>
              </label>
            </div>
          </div>

          {rent && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Charges mensuelles" suffix="CHF">
                  <input name="charges" type="number" defaultValue={p?.charges ?? ""} className={inputCls} />
                </Field>
                <Field label="Loyer brut (net + charges)" suffix="CHF">
                  <input name="grossRent" type="number" defaultValue={p?.grossRent ?? ""} className={inputCls} />
                </Field>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="chargesIncluded"
                  defaultChecked={p?.chargesIncluded ?? true}
                  className="h-4 w-4 accent-[#521f26]"
                />
                <span className="text-[0.95rem]">Les charges sont incluses dans le loyer affiché</span>
              </label>
              <div>
                <p className={labelCls}>Unité</p>
                <div className="flex gap-6">
                  {(
                    [
                      ["month", "/ Mois"],
                      ["week", "/ Semaine"],
                      ["day", "/ Jour"],
                    ] as const
                  ).map(([v, label]) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceUnit"
                        value={v}
                        defaultChecked={(p?.priceUnit ?? "month") === v}
                        className="h-4 w-4 accent-[#521f26]"
                      />
                      <span className="text-[0.95rem]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {/* ── Step 4 · Pièces, surfaces et équipements ── */}
        <section className={`space-y-8 ${hidden(3)}`}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Pièces *">
              <select name="rooms" defaultValue={p?.rooms ?? ""} className={inputCls}>
                <option value="">Sélectionnez</option>
                {roomOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Chambres">
              <select name="bedrooms" defaultValue={p?.bedrooms ?? ""} className={inputCls}>
                <option value="">Sélectionnez</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Qté salles de bain">
              <select name="bathrooms" defaultValue={p?.bathrooms ?? ""} className={inputCls}>
                <option value="">Sélectionnez</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Étage">
              <select name="floor" defaultValue={p?.floor ?? ""} className={inputCls}>
                <option value="">Sélectionnez</option>
                {["-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((n) => (
                  <option key={n} value={n}>
                    {n === "0" ? "Rez-de-chaussée" : n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Étages dans l'immeuble">
              <input name="buildingFloors" type="number" defaultValue={p?.buildingFloors ?? ""} className={inputCls} />
            </Field>
            <Field label="Surface habitable" suffix="m²">
              <input name="livingArea" type="number" defaultValue={p?.livingArea ?? ""} className={inputCls} />
            </Field>
            <Field label="Surface utile" suffix="m²">
              <input name="usableArea" type="number" defaultValue={p?.usableArea ?? ""} className={inputCls} />
            </Field>
            <Field label="Surface du terrain" suffix="m²">
              <input name="landArea" type="number" defaultValue={p?.landArea ?? ""} className={inputCls} />
            </Field>
            <Field label="Hauteur de la pièce" suffix="m">
              <input name="ceilingHeight" type="number" step="0.1" defaultValue={p?.ceilingHeight ?? ""} className={inputCls} />
            </Field>
            <Field label="Volume" suffix="m³">
              <input name="volume" type="number" defaultValue={p?.volume ?? ""} className={inputCls} />
            </Field>
            <Field label="Année de construction">
              <input name="yearBuilt" type="number" placeholder="AAAA" defaultValue={p?.yearBuilt ?? ""} className={inputCls} />
            </Field>
            <Field label="Dernière rénovation">
              <input name="lastRenovation" type="number" placeholder="AAAA" defaultValue={p?.lastRenovation ?? ""} className={inputCls} />
            </Field>
          </div>

          <div>
            <p className={labelCls}>Disponible</p>
            <div className="flex flex-wrap items-center gap-6">
              {(
                [
                  ["immediately", "immédiatement"],
                  ["by_agreement", "par consentement"],
                  ["date", "date"],
                ] as const
              ).map(([v, label]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value={v}
                    checked={availability === v}
                    onChange={() => setAvailability(v)}
                    className="h-4 w-4 accent-[#521f26]"
                  />
                  <span className="text-[0.95rem]">{label}</span>
                </label>
              ))}
              {availability === "date" && (
                <input
                  type="date"
                  name="availableFrom"
                  defaultValue={p?.availableFrom ?? ""}
                  className={inputCls + " max-w-[200px]"}
                />
              )}
            </div>
          </div>

          <div>
            <p className={labelCls}>Caractéristiques et équipements</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {allFeatures.map((f) => (
                <label key={f} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="features"
                    value={f}
                    defaultChecked={p?.features?.includes(f) ?? false}
                    className="h-4 w-4 accent-[#521f26]"
                  />
                  <span className="text-[0.95rem] font-light">{f}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* ── Step 5 · Descriptions ── */}
        <section className={`space-y-5 ${hidden(4)}`}>
          <Field label="Titre (français) *">
            <input
              name="titleFr"
              value={titleFr}
              onChange={(e) => setTitleFr(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Description (français)">
            <textarea name="descriptionFr" rows={6} defaultValue={p?.descriptionFr ?? ""} className={inputCls} />
          </Field>
          <Field label="Titre (anglais)">
            <input name="titleEn" defaultValue={p?.titleEn ?? ""} className={inputCls} />
          </Field>
          <Field label="Description (anglais)">
            <textarea name="descriptionEn" rows={6} defaultValue={p?.descriptionEn ?? ""} className={inputCls} />
          </Field>
          <p className="text-xs font-light text-mutedbrand">
            Si le titre anglais est vide, le titre français sera utilisé.
          </p>
        </section>

        {/* ── Step 6 · Images, plans et documents ── */}
        <section className={`space-y-8 ${hidden(5)}`}>
          <div className="space-y-4">
            <p className={labelCls}>Photos — la première est l&apos;image de couverture</p>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {photos.map((src, i) => (
                  <div
                    key={src}
                    className="relative group aspect-[4/3] overflow-hidden bg-ivory-alt border border-line"
                  >
                    <Image src={src} alt="" fill sizes="150px" className="object-cover" />
                    <input type="hidden" name="existingPhotos" value={src} />
                    {i === 0 && (
                      <span className="absolute left-1 top-1 bg-bordeaux px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-white">
                        Couverture
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 hidden group-hover:flex justify-between bg-black/55 px-1 py-0.5 text-white">
                      <button
                        type="button"
                        onClick={() => movePhoto(i, i - 1)}
                        disabled={i === 0}
                        className="px-1 text-sm disabled:opacity-30"
                        aria-label="Déplacer vers la gauche"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotos((ph) => ph.filter((x) => x !== src))}
                        className="px-1 text-xs"
                        aria-label="Supprimer la photo"
                      >
                        ✕
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(i, i + 1)}
                        disabled={i === photos.length - 1}
                        className="px-1 text-sm disabled:opacity-30"
                        aria-label="Déplacer vers la droite"
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="border border-dashed border-line bg-white p-6">
              <label className={labelCls}>Ajouter des photos</label>
              <input
                type="file"
                name="photoFiles"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="text-sm"
              />
              <p className="mt-2 text-xs font-light text-mutedbrand">
                Nous vous conseillons au moins 13 images pour montrer l&apos;objet en détail.
                Utilisez ← → pour changer l&apos;ordre d&apos;affichage.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className={labelCls}>Plans (images ou PDF)</p>
            {plans.length > 0 && (
              <ul className="space-y-2 text-sm">
                {plans.map((src) => (
                  <li key={src} className="flex items-center justify-between border border-line bg-white px-3 py-2">
                    <input type="hidden" name="existingPlans" value={src} />
                    <span className="truncate font-mono text-xs text-mutedbrand">{src.split("/").pop()}</span>
                    <button
                      type="button"
                      onClick={() => setPlans((x) => x.filter((y) => y !== src))}
                      className="text-mutedbrand hover:text-red-700"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <input
              type="file"
              name="planFiles"
              multiple
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="text-sm"
            />
          </div>

          <div className="space-y-4">
            <p className={labelCls}>Plaquette PDF (téléchargeable sur la page du bien)</p>
            {brochure ? (
              <div className="flex items-center justify-between border border-line bg-white px-3 py-2 text-sm">
                <input type="hidden" name="existingBrochure" value={brochure} />
                <span className="truncate font-mono text-xs text-mutedbrand">{brochure.split("/").pop()}</span>
                <button
                  type="button"
                  onClick={() => setBrochure(null)}
                  className="text-mutedbrand hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ) : (
              <input type="file" name="brochureFile" accept="application/pdf" className="text-sm" />
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="URL vidéo (YouTube, Vimeo…)">
              <input name="videoUrl" type="url" defaultValue={p?.videoUrl ?? ""} placeholder="https://" className={inputCls} />
            </Field>
            <Field label="URL visite virtuelle">
              <input name="virtualTourUrl" type="url" defaultValue={p?.virtualTourUrl ?? ""} placeholder="https://" className={inputCls} />
            </Field>
          </div>
        </section>

        {/* ── Step 7 · Publication, statut et SEO ── */}
        <section className={`space-y-8 ${hidden(6)}`}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Publication">
              <select name="status" defaultValue={p?.status ?? "active"} className={inputCls}>
                <option value="active">En ligne</option>
                <option value="draft">Brouillon</option>
                <option value="hidden">Masqué</option>
                <option value="archived">Archivé</option>
              </select>
            </Field>
            <Field label="État de la transaction">
              <select
                name="transactionStatus"
                defaultValue={p?.transactionStatus ?? "available"}
                className={inputCls}
              >
                <option value="available">Disponible</option>
                <option value="reserved">Réservé</option>
                <option value="rented">Loué</option>
                <option value="sold">Vendu</option>
              </select>
            </Field>
            <Field label="Retirer automatiquement le">
              <input type="date" name="expiresAt" defaultValue={p?.expiresAt ?? ""} className={inputCls} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-8">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={p?.featured ?? false}
                className="h-4 w-4 accent-[#521f26]"
              />
              <span className="text-[0.95rem]">Mettre dans la sélection (page d&apos;accueil)</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="offMarket"
                defaultChecked={p?.offMarket ?? false}
                className="h-4 w-4 accent-[#521f26]"
              />
              <span className="text-[0.95rem]">Off market</span>
            </label>
          </div>

          <div className="space-y-5 border-t border-line pt-6">
            <p className="text-sm font-medium text-ink">
              SEO <span className="font-light text-mutedbrand">— facultatif, sinon générés automatiquement</span>
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Titre SEO (français)">
                <input name="seoTitleFr" defaultValue={p?.seoTitleFr ?? ""} className={inputCls} />
              </Field>
              <Field label="Titre SEO (anglais)">
                <input name="seoTitleEn" defaultValue={p?.seoTitleEn ?? ""} className={inputCls} />
              </Field>
            </div>
            <Field label="Description SEO (français)">
              <textarea name="seoDescFr" rows={2} defaultValue={p?.seoDescFr ?? ""} className={inputCls} />
            </Field>
            <Field label="Description SEO (anglais)">
              <textarea name="seoDescEn" rows={2} defaultValue={p?.seoDescEn ?? ""} className={inputCls} />
            </Field>
          </div>
        </section>

        {/* ── Step 8 · Interne & portails externes ── */}
        <section className={`space-y-8 ${hidden(7)}`}>
          <div className="border border-line bg-ivory-alt/60 px-4 py-3 text-sm font-light text-mutedbrand">
            Ces informations sont strictement internes — elles ne sont jamais affichées sur le site public.
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Propriétaire">
              <input name="ownerName" defaultValue={p?.ownerName ?? ""} className={inputCls} />
            </Field>
            <Field label="Contact du propriétaire">
              <input name="ownerContact" defaultValue={p?.ownerContact ?? ""} placeholder="Téléphone, e-mail…" className={inputCls} />
            </Field>
            <Field label="Commission">
              <input name="commission" defaultValue={p?.commission ?? ""} placeholder="3 %, forfait…" className={inputCls} />
            </Field>
            <Field label="Source du mandat">
              <input name="listingSource" defaultValue={p?.listingSource ?? ""} placeholder="Recommandation, portail…" className={inputCls} />
            </Field>
          </div>
          <Field label="Notes internes">
            <textarea name="internalNotes" rows={5} defaultValue={p?.internalNotes ?? ""} className={inputCls} />
          </Field>

          <div className="space-y-3 border-t border-line pt-6">
            <p className="text-sm font-medium text-ink">Synchronisation externe</p>
            <p className="text-sm font-light text-mutedbrand">
              Statut : {p?.syncStatus ?? "aucune synchronisation"}
              {p?.lastSyncAt ? ` · dernière sync : ${p.lastSyncAt}` : ""}
            </p>
            {p?.externalIdsDisplay && p.externalIdsDisplay !== "{}" && (
              <p className="font-mono text-xs text-mutedbrand">IDs externes : {p.externalIdsDisplay}</p>
            )}
            <p className="text-sm font-light text-mutedbrand">
              Les connexions aux portails se configurent dans{" "}
              <a href="/admin/integrations" className="text-bordeaux underline">
                Intégrations
              </a>
              .
            </p>
          </div>
        </section>

        {/* ── Navigation & submit ── */}
        <div className="mt-12 flex items-center justify-between border-t border-line pt-8">
          <div className="flex items-center gap-4">
            {step > 0 && (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="border border-line px-6 py-3 text-[0.78rem] uppercase tracking-[0.15em] text-ink hover:border-bordeaux hover:text-bordeaux transition-colors"
              >
                ← Précédent
              </button>
            )}
            {step < STEPS.length - 1 && (
              <button
                type="button"
                onClick={() => goTo(step + 1)}
                className="border border-bordeaux px-6 py-3 text-[0.78rem] uppercase tracking-[0.15em] text-bordeaux hover:bg-bordeaux hover:text-white transition-colors"
              >
                Suivant →
              </button>
            )}
            <button
              type="submit"
              onClick={(e) => {
                if (!titleFr.trim() || !city.trim()) {
                  e.preventDefault();
                  goTo(!city.trim() ? 2 : 5); // triggers the validation message
                }
              }}
              className="bg-bordeaux px-8 py-3 text-[0.78rem] uppercase tracking-[0.18em] text-white hover:bg-bordeaux-soft transition-colors"
            >
              Enregistrer
            </button>
          </div>
          {p?.id && deleteAction && (
            <button
              type="submit"
              formAction={deleteAction}
              formNoValidate
              className="text-sm text-mutedbrand hover:text-red-700 transition-colors"
              onClick={(e) => {
                if (!confirm("Supprimer définitivement ce bien ?")) e.preventDefault();
              }}
            >
              Supprimer ce bien
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
