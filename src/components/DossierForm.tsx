"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitDossier, type DossierState } from "@/app/[locale]/dossier/actions";
import { getDossierDict, type DossierDict } from "@/lib/dossier-i18n";
import { dossierPayment, site } from "@/lib/site";
import { getInscriptionDict, type InscriptionDict } from "@/lib/inscription-i18n";
import { screen } from "@/lib/screening";
import { SignaturePad } from "@/components/SignaturePad";

const inputCls =
  "w-full border border-line bg-white px-3.5 py-3 text-[0.95rem] text-ink outline-none transition-colors focus:border-bordeaux";
const labelCls = "block text-[0.7rem] uppercase tracking-[0.18em] text-mutedbrand mb-2";

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  inputMode,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email";
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelCls} htmlFor={name}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

function Select({
  label,
  name,
  options,
  placeholder,
}: {
  label: string;
  name: string;
  options: string[];
  placeholder: string;
}) {
  return (
    <div>
      <label className={labelCls} htmlFor={name}>
        {label}
      </label>
      <select id={name} name={name} defaultValue="" className={inputCls}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function YesNo({
  label,
  name,
  d,
  ask,
}: {
  label: string;
  name: string;
  d: DossierDict;
  /** Inscription: no default answer, the client must choose. */
  ask?: boolean;
}) {
  return (
    <div>
      <p className={labelCls}>{label}</p>
      <div className="flex gap-6 py-3">
        {(
          [
            ["no", d.no],
            ["yes", d.yes],
          ] as const
        ).map(([v, l]) => (
          <label key={v} className="flex cursor-pointer items-center gap-2 text-[0.95rem] font-light">
            <input
              type="radio"
              name={name}
              value={v}
              defaultChecked={!ask && v === "no"}
              required={ask}
              className="h-4 w-4 accent-[#521f26]"
            />
            {l}
          </label>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-8">
      <legend className="float-left mb-6 w-full font-display text-2xl text-bordeaux">
        {title}
      </legend>
      <div className="clear-both grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function SubmitButton({ d, label }: { d: DossierDict; label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="arrow-link w-full bg-bordeaux px-8 py-4 text-[0.75rem] uppercase tracking-[0.2em] text-white transition-colors hover:bg-bordeaux-soft disabled:opacity-60 sm:w-auto"
    >
      {pending ? d.sending : label ?? d.send} <span className="arrow ml-1">→</span>
    </button>
  );
}

function CopyRow({ label, value, d }: { label: string; value: string; d: DossierDict }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
      <div>
        <span className="block text-[0.7rem] uppercase tracking-[0.18em] text-mutedbrand">
          {label}
        </span>
        <span className="font-mono text-[0.95rem] text-ink">{value}</span>
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* clipboard unavailable: the value stays visible to copy by hand */
          }
        }}
        className="border border-bordeaux px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.15em] text-bordeaux transition-colors hover:bg-bordeaux hover:text-white"
      >
        {copied ? d.copied : d.copy}
      </button>
    </div>
  );
}

function Done({ state, d, ins }: { state: DossierState; d: DossierDict; ins: InscriptionDict | null }) {
  const ref = state.reference ?? "";
  const wa = (text: string) =>
    `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
  // Bring the confirmation into view: the submit button sits at the bottom of a long form.
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    top.current?.scrollIntoView({ block: "start" });
  }, []);
  const btn =
    "inline-block bg-bordeaux px-6 py-3.5 text-center text-[0.75rem] uppercase tracking-[0.2em] text-white transition-colors hover:bg-bordeaux-soft";

  if (ins && state.blocked) {
    return (
      <div ref={top} className="scroll-mt-28 space-y-8">
        <div className="border border-line bg-white p-8">
          <h2 className="font-display text-2xl text-bordeaux">{ins.blockedTitle}</h2>
          <p className="mt-3 text-[1.05rem] font-light leading-relaxed text-ink">{ins.blockedText}</p>
          <p className="mt-4 text-sm font-light text-mutedbrand">{ins.blockedHint}</p>
        </div>
        <a href={wa(d.whatsappMsg(ref))} target="_blank" rel="noopener noreferrer" className={btn}>
          {d.whatsapp}
        </a>
      </div>
    );
  }

  return (
    <div ref={top} className="scroll-mt-28 space-y-8">
      <div className="border border-bordeaux/30 bg-white p-8">
        <h2 className="font-display text-2xl text-bordeaux">{ins ? ins.doneTitle : d.doneTitle}</h2>
        <p className="mt-3 text-[1.05rem] font-light leading-relaxed text-ink">{ins ? ins.doneText : d.doneText}</p>
        <p className="mt-5 text-sm text-mutedbrand">
          {d.doneRef} : <span className="font-mono text-ink">{ref}</span>
        </p>
      </div>

      {state.formula === "A" ? (
        <div className="border border-line bg-stone p-8">
          <h2 className="font-display text-2xl text-bordeaux">{ins ? ins.payTitle : d.payTitle}</h2>
          <p className="mt-3 font-light leading-relaxed text-ink">{ins ? ins.payIntro : d.payIntro}</p>
          {state.payLink && ins && (
            <>
              <a href={state.payLink} className={`${btn} mt-6 w-full sm:w-auto`}>
                {ins.payOnline}
              </a>
              <p className="mt-8 text-sm font-medium text-ink">{ins.payOr}</p>
            </>
          )}
          <div className="mt-6 bg-white px-5">
            <CopyRow
              d={d}
              label={d.payAmount}
              value={`${dossierPayment.currency} ${dossierPayment.amount}.–`}
            />
            <CopyRow d={d} label={d.payRecipient} value={dossierPayment.recipient} />
            <CopyRow d={d} label={d.payIban} value={dossierPayment.iban} />
            <CopyRow d={d} label={d.payBic} value={dossierPayment.bic} />
            <CopyRow d={d} label={d.payReference} value={dossierPayment.reference} />
          </div>
          <p className="mt-5 border-l-2 border-bordeaux pl-4 text-sm font-light leading-relaxed text-ink">
            {d.payNote}
          </p>
          <a
            href={wa(d.payConfirmMsg(ref))}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btn} mt-6`}
          >
            {d.payConfirm}
          </a>
        </div>
      ) : (
        <a
          href={wa(d.whatsappMsg(ref))}
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
        >
          {d.whatsapp}
        </a>
      )}
    </div>
  );
}

export function DossierForm({
  locale,
  mode = "dossier",
}: {
  locale: string;
  /** "inscription": fixed CHF 360 formula, 3× income check, documents, signature. */
  mode?: "dossier" | "inscription";
}) {
  const d = getDossierDict(locale);
  const ins = mode === "inscription" ? getInscriptionDict(locale) : null;
  const [check, setCheck] = useState<ReturnType<typeof screen> | null>(null);
  const [state, formAction] = useActionState<DossierState, FormData>(submitDossier, {
    ok: false,
  });
  const [second, setSecond] = useState(false);

  if (state.ok) return <Done state={state} d={d} ins={ins} />;

  // Live eligibility hint (the server makes the final decision).
  const onFormInput = (e: React.FormEvent<HTMLFormElement>) => {
    if (!ins) return;
    const f = new FormData(e.currentTarget);
    const n = (k: string) => {
      const v = Number(String(f.get(k) || "").replace(/['’\s]/g, "").replace(",", "."));
      return Number.isFinite(v) && v > 0 ? v : undefined;
    };
    const maxRent = n("maxRent");
    const income = n("income");
    if (!maxRent || !income) return setCheck(null);
    setCheck(
      screen({
        maxRent,
        income,
        debts: f.get("debts") === "yes",
        welfare: f.get("welfare") === "yes",
        second:
          f.get("hasSecond") === "on"
            ? {
                role: f.get("c2Role") === "guarantor" ? "guarantor" : "co",
                income: n("c2Income"),
                debts: f.get("c2Debts") === "yes",
                welfare: f.get("c2Welfare") === "yes",
              }
            : null,
      })
    );
  };
  const checkBanner =
    ins && check ? (
      <p
        className={`sm:col-span-2 border-l-2 px-4 py-3 text-sm leading-relaxed ${
          check.ok ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-red-700 bg-red-50 text-red-900"
        }`}
        role="status"
      >
        {check.reasons.includes("debts") || check.reasons.includes("welfare")
          ? ins.checkBlock
          : check.ok
            ? ins.checkOk(check.ratio ?? 0)
            : ins.checkLow(check.ratio ?? 0)}
      </p>
    ) : null;

  const searchSection = (
      <Section title={d.sSearch}>
        <Select label={d.rooms} name="rooms" options={d.roomsOptions} placeholder={d.select} />
        <Field label={d.maxRent} name="maxRent" inputMode="numeric" required={!!ins} />
        <Field label={d.areas} name="areas" placeholder={d.areasHint} />
        <Field label={d.excludedAreas} name="excludedAreas" />
        <Field label={d.moveIn} name="moveIn" type="date" />
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="criteria">
            {d.criteria}
          </label>
          <textarea
            id="criteria"
            name="criteria"
            rows={3}
            placeholder={d.criteriaHint}
            className={inputCls}
          />
        </div>
      </Section>
  );

  const formulaCard =
    "flex cursor-pointer gap-4 border border-line bg-white p-5 transition-colors has-[:checked]:border-bordeaux has-[:checked]:bg-stone";

  return (
    <form action={formAction} onInput={onFormInput} onChange={onFormInput} className="space-y-10">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="mode" value={mode} />
      {/* honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0"
        aria-hidden="true"
      />

      <p className="text-sm font-light text-mutedbrand">{d.required}</p>

      {ins && (
        <div className="border-l-2 border-bordeaux bg-stone px-5 py-4">
          <p className="font-medium text-ink">{ins.conditionTitle}</p>
          <p className="mt-1 text-sm font-light leading-relaxed text-ink">{ins.condition}</p>
        </div>
      )}

      {ins && searchSection}

      <Section title={d.sIdentity}>
        <Field label={d.firstName} name="firstName" required autoComplete="given-name" />
        <Field label={d.lastName} name="lastName" required autoComplete="family-name" />
        <Field label={d.phone} name="phone" type="tel" required autoComplete="tel" inputMode="tel" />
        <Field label={d.email} name="email" type="email" required autoComplete="email" inputMode="email" />
        <Field label={d.birthDate} name="birthDate" type="date" autoComplete="bday" />
        <Field label={d.nationality} name="nationality" />
        <Select label={d.civilStatus} name="civilStatus" options={d.civilOptions} placeholder={d.select} />
        <Select label={d.permit} name="permit" options={d.permitOptions} placeholder={d.select} />
        <Field label={d.permitExpiry} name="permitExpiry" type="date" />
      </Section>

      <Section title={d.sHousing}>
        <Field label={d.address} name="address" autoComplete="street-address" />
        <Field label={d.city} name="city" />
        <Field label={d.landlord} name="landlord" />
        <Field label={d.currentRent} name="currentRent" inputMode="numeric" />
        <Field label={d.since} name="since" />
        <Field label={d.reason} name="reason" />
      </Section>

      <Section title={d.sWork}>
        <Select label={d.workStatus} name="workStatus" options={d.workOptions} placeholder={d.select} />
        <Field label={d.profession} name="profession" />
        <Field label={d.employer} name="employer" />
        <Field label={d.employerAddress} name="employerAddress" />
        <Field label={d.employedSince} name="employedSince" />
        <Field label={d.income} name="income" inputMode="numeric" required={!!ins} />
        <Field label={d.otherIncome} name="otherIncome" inputMode="numeric" />
        <YesNo label={ins ? `${d.debts} *` : d.debts} name="debts" d={d} ask={!!ins} />
        {ins && <YesNo label={ins.welfare} name="welfare" d={d} ask />}
        {checkBanner}
      </Section>

      {!ins && searchSection}

      <Section title={d.sHousehold}>
        <Field label={d.adults} name="adults" inputMode="numeric" />
        <Field label={d.children} name="children" inputMode="numeric" />
        <Field label={d.pets} name="pets" />
        <Field label={d.vehicles} name="vehicles" inputMode="numeric" />
      </Section>

      <div className="border-t border-line pt-8">
        <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] font-light text-ink">
          <input
            type="checkbox"
            name="hasSecond"
            checked={second}
            onChange={(e) => setSecond(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#521f26]"
          />
          <span>{d.addSecond}</span>
        </label>
        {second && (
          <div className="mt-8">
            <h2 className="mb-6 font-display text-2xl text-bordeaux">{d.sSecond}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="c2Role">
                  {d.c2Role}
                </label>
                <select id="c2Role" name="c2Role" defaultValue="co" className={inputCls}>
                  <option value="co">{d.c2RoleCo}</option>
                  <option value="guarantor">{d.c2RoleGuarantor}</option>
                </select>
              </div>
              <span className="hidden sm:block" />
              <Field label={d.firstName} name="c2FirstName" required />
              <Field label={d.lastName} name="c2LastName" required />
              <Field label={d.phone} name="c2Phone" type="tel" inputMode="tel" />
              <Field label={d.email} name="c2Email" type="email" inputMode="email" />
              <Field label={d.birthDate} name="c2BirthDate" type="date" />
              <Field label={d.nationality} name="c2Nationality" />
              <Select label={d.permit} name="c2Permit" options={d.permitOptions} placeholder={d.select} />
              <Field label={d.profession} name="c2Profession" />
              <Field label={d.employer} name="c2Employer" />
              <Field label={d.income} name="c2Income" inputMode="numeric" />
              <YesNo label={ins ? `${d.debts} *` : d.debts} name="c2Debts" d={d} ask={!!ins} />
              {ins && <YesNo label={ins.welfareC2} name="c2Welfare" d={d} ask />}
            </div>
          </div>
        )}
      </div>

      {ins ? (
        <>
          <fieldset className="border-t border-line pt-8">
            <legend className="float-left mb-2 w-full font-display text-2xl text-bordeaux">{ins.sDocs}</legend>
            <p className="clear-both mb-6 text-sm font-light leading-relaxed text-mutedbrand">{ins.docsHint}</p>
            <div className="grid gap-5">
              {(
                [
                  ["docId", ins.docId, ""],
                  ["docDebts", ins.docDebts, ins.docDebtsHint],
                  ["docIncome", ins.docIncome, ""],
                ] as const
              ).map(([name, label, hint]) => (
                <div key={name} className="border border-dashed border-line bg-white p-4">
                  <label className={labelCls} htmlFor={name}>
                    {label} *
                  </label>
                  <input
                    id={name}
                    name={name}
                    type="file"
                    multiple
                    required
                    accept="application/pdf,image/jpeg,image/png,image/heic,image/heif,image/webp"
                    className="block w-full text-sm file:mr-4 file:border-0 file:bg-bordeaux file:px-4 file:py-2.5 file:text-[0.7rem] file:uppercase file:tracking-[0.15em] file:text-white"
                  />
                  {hint && <p className="mt-2 text-xs font-light text-mutedbrand">{hint}</p>}
                </div>
              ))}
            </div>
          </fieldset>

          <div className="border-t border-line pt-8">
            <h2 className="font-display text-2xl text-bordeaux">{ins.sMandate}</h2>
            <ul className="mt-4 space-y-2 bg-stone px-5 py-4 text-sm font-light leading-relaxed text-ink">
              {ins.mandateTerms.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-bordeaux">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-line pt-8">
            <h2 className="mb-6 font-display text-2xl text-bordeaux">{ins.sSign}</h2>
            <div className="grid gap-6">
              <Field label={ins.place} name="place" />
              <SignaturePad name="signature1" label={ins.sign1} hint={ins.signHint} clearLabel={ins.clear} />
              {second && (
                <SignaturePad name="signature2" label={ins.sign2} hint={ins.signHint} clearLabel={ins.clear} />
              )}
            </div>
          </div>
        </>
      ) : (
      <div className="border-t border-line pt-8">
          <h2 className="font-display text-2xl text-bordeaux">{d.sFormula} *</h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-mutedbrand">{d.formulaIntro}</p>
          <div className="mt-6 space-y-4">
            {(
              [
                ["A", d.formulaATitle, d.formulaAText, d.formulaAExample],
                ["B", d.formulaBTitle, d.formulaBText, d.formulaBExample],
              ] as const
            ).map(([v, title, text, example]) => (
              <label key={v} className={formulaCard}>
                <input
                  type="radio"
                  name="formula"
                  value={v}
                  required
                  className="mt-1 h-4 w-4 shrink-0 accent-[#521f26]"
                />
                <span>
                  <span className="block font-medium text-ink">{title}</span>
                  <span className="mt-1.5 block text-sm font-light leading-relaxed text-ink">
                    {text}
                  </span>
                  <span className="mt-1.5 block text-sm font-light italic text-mutedbrand">
                    {example}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm font-light leading-relaxed text-ink">
          <input
            type="checkbox"
            name="mandate"
            required
            className="mt-1 h-4 w-4 shrink-0 accent-[#521f26]"
          />
          <span>
            {ins ? ins.mandateA : d.mandateA}
            <a
              href="/documents/mandat-de-recherche.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bordeaux underline underline-offset-2"
            >
              {ins ? ins.mandateLink : d.mandateLink}
            </a>
            {ins ? ins.mandateB : d.mandateB}
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm font-light leading-relaxed text-mutedbrand">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-1 h-4 w-4 shrink-0 accent-[#521f26]"
          />
          <span>{d.consent}</span>
        </label>
      </div>

      {state.error && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {state.error === "consent"
            ? d.errConsent
            : state.error === "rate"
              ? d.errRate
              : state.error === "formula"
                ? d.errFormula
                : state.error === "signature" && ins
                  ? ins.errSignature
                  : state.error === "documents" && ins
                    ? ins.errDocuments
                    : state.error === "missing" && ins
                      ? ins.errMissing
                      : d.errGeneric}
        </p>
      )}

      <SubmitButton d={d} label={ins?.send} />
    </form>
  );
}
