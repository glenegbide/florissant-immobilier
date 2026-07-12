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
  livingArea: number | null;
  usableArea: number | null;
  volume: number | null;
  ceilingHeight: number | null;
  yearBuilt: number | null;
  lastRenovation: number | null;
  availability: string;
  availableFrom: string | null; // yyyy-mm-dd
  price: number | null;
  priceOnRequest: boolean;
  priceUnit: string;
  chargesIncluded: boolean;
  features: string[];
  photos: string[];
  offMarket: boolean;
  featured: boolean;
  status: string;
};

const inputCls =
  "w-full border border-line bg-white px-3.5 py-2.5 text-[0.95rem] text-ink outline-none focus:border-bordeaux transition-colors";
const labelCls = "block text-sm font-medium text-ink mb-1.5";
const sectionCls = "font-display text-2xl text-bordeaux";

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
  const [offerType, setOfferType] = useState<"RENT" | "SALE">(p?.offerType ?? "RENT");
  const [objectType, setObjectType] = useState(p?.objectType ?? "appartement");
  const [availability, setAvailability] = useState(p?.availability ?? "immediately");
  const [priceOnRequest, setPriceOnRequest] = useState(p?.priceOnRequest ?? false);
  const [photos, setPhotos] = useState<string[]>(p?.photos ?? []);

  const subtypes = subtypesByType[objectType] ?? [];

  return (
    <form action={action} className="max-w-3xl space-y-12">
      {p?.id && <input type="hidden" name="id" value={p.id} />}

      {/* ── Type d'offre ── */}
      <section className="space-y-5">
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
              required
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
          <Field label="Type d'offre">
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
      </section>

      {/* ── Adresse ── */}
      <section className="space-y-5">
        <h2 className={sectionCls}>Adresse</h2>
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
          <span className="text-[0.95rem]">Ne pas afficher la rue et le numéro</span>
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
                defaultValue={p?.city ?? ""}
                placeholder="Lieu"
                className={inputCls}
                required
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

      {/* ── Détails ── */}
      <section className="space-y-5">
        <h2 className={sectionCls}>Détails</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Pièces *">
            <select name="rooms" defaultValue={p?.rooms ?? ""} className={inputCls} required>
              <option value="">Sélectionnez</option>
              {roomOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
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
          <Field label="Etage">
            <select name="floor" defaultValue={p?.floor ?? ""} className={inputCls}>
              <option value="">Sélectionnez</option>
              {["-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((n) => (
                <option key={n} value={n}>
                  {n === "0" ? "Rez-de-chaussée" : n}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Surface habitable" suffix="m²">
            <input name="livingArea" type="number" defaultValue={p?.livingArea ?? ""} className={inputCls} />
          </Field>
          <Field label="Surface utile" suffix="m²">
            <input name="usableArea" type="number" defaultValue={p?.usableArea ?? ""} className={inputCls} />
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
      </section>

      {/* ── Prix ── */}
      <section className="space-y-5">
        <h2 className={sectionCls}>{offerType === "SALE" ? "Prix de vente" : "Loyer"}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={offerType === "SALE" ? "Prix" : "Loyer"}>
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

        {offerType === "RENT" && (
          <>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="chargesIncluded"
                defaultChecked={p?.chargesIncluded ?? true}
                className="h-4 w-4 accent-[#521f26]"
              />
              <span className="text-[0.95rem]">Les charges sont incluses</span>
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

      {/* ── Caractéristiques ── */}
      <section className="space-y-5">
        <h2 className={sectionCls}>Caractéristiques et équipements</h2>
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
      </section>

      {/* ── Textes ── */}
      <section className="space-y-5">
        <h2 className={sectionCls}>Titre et description</h2>
        <Field label="Titre (français) *">
          <input name="titleFr" defaultValue={p?.titleFr ?? ""} className={inputCls} required />
        </Field>
        <Field label="Description (français)">
          <textarea name="descriptionFr" rows={5} defaultValue={p?.descriptionFr ?? ""} className={inputCls} />
        </Field>
        <Field label="Titre (anglais)">
          <input name="titleEn" defaultValue={p?.titleEn ?? ""} className={inputCls} />
        </Field>
        <Field label="Description (anglais)">
          <textarea name="descriptionEn" rows={5} defaultValue={p?.descriptionEn ?? ""} className={inputCls} />
        </Field>
      </section>

      {/* ── Média ── */}
      <section className="space-y-5">
        <h2 className={sectionCls}>Média</h2>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {photos.map((src) => (
              <div key={src} className="relative group aspect-[4/3] overflow-hidden bg-ivory-alt border border-line">
                <Image src={src} alt="" fill sizes="150px" className="object-cover" />
                <input type="hidden" name="existingPhotos" value={src} />
                <button
                  type="button"
                  onClick={() => setPhotos((ph) => ph.filter((x) => x !== src))}
                  className="absolute top-1 right-1 hidden group-hover:flex h-6 w-6 items-center justify-center bg-black/60 text-white text-xs"
                  aria-label="Supprimer la photo"
                >
                  ✕
                </button>
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
            Nous vous conseillons de télécharger au moins 13 images, afin de montrer l&apos;objet en détail.
          </p>
        </div>
      </section>

      {/* ── Publication ── */}
      <section className="space-y-5">
        <h2 className={sectionCls}>Publication</h2>
        <div className="flex flex-wrap gap-8">
          <Field label="Statut">
            <select name="status" defaultValue={p?.status ?? "active"} className={inputCls}>
              <option value="active">En ligne</option>
              <option value="draft">Brouillon</option>
              <option value="archived">Archivé</option>
            </select>
          </Field>
          <label className="flex items-center gap-2.5 cursor-pointer self-end pb-2.5">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={p?.featured ?? false}
              className="h-4 w-4 accent-[#521f26]"
            />
            <span className="text-[0.95rem]">Mettre dans la sélection (page d&apos;accueil)</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer self-end pb-2.5">
            <input
              type="checkbox"
              name="offMarket"
              defaultChecked={p?.offMarket ?? false}
              className="h-4 w-4 accent-[#521f26]"
            />
            <span className="text-[0.95rem]">Off market</span>
          </label>
        </div>
      </section>

      <div className="flex items-center justify-between border-t border-line pt-8">
        <button
          type="submit"
          className="bg-bordeaux px-8 py-3.5 text-[0.8rem] uppercase tracking-[0.18em] text-white hover:bg-bordeaux-soft transition-colors"
        >
          Enregistrer
        </button>
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
  );
}
