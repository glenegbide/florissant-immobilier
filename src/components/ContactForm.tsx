"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendMessage, type ContactState } from "@/app/[locale]/contact/actions";
import type { Dict } from "@/lib/i18n";

const inputCls =
  "w-full border border-line bg-white px-3.5 py-3 text-[0.95rem] text-ink outline-none transition-colors focus:border-bordeaux";
const labelCls = "block text-[0.7rem] uppercase tracking-[0.18em] text-mutedbrand mb-2";

function SubmitButton({ t }: { t: Dict }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="arrow-link bg-bordeaux px-8 py-3.5 text-[0.75rem] uppercase tracking-[0.2em] text-white transition-colors hover:bg-bordeaux-soft disabled:opacity-60"
    >
      {pending ? t.contact.sending : t.contact.send} <span className="arrow ml-1">→</span>
    </button>
  );
}

export function ContactForm({
  t,
  locale,
  reference,
  defaultSubject,
}: {
  t: Dict;
  locale: string;
  reference?: string;
  defaultSubject?: string;
}) {
  const [state, formAction] = useActionState<ContactState, FormData>(sendMessage, {
    ok: false,
  });

  if (state.ok) {
    return (
      <div className="border border-bordeaux/30 bg-white p-8">
        <p className="text-[1.05rem] font-light leading-relaxed text-ink">
          {t.contact.success}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      {reference && <input type="hidden" name="reference" value={reference} />}
      {/* honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0"
        aria-hidden="true"
      />

      {reference && (
        <p className="border-l-2 border-bordeaux bg-stone px-4 py-2.5 text-sm text-ink">
          {t.contact.aboutProperty} : <span className="font-mono">{reference}</span>
        </p>
      )}

      {state.error && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {t.contact.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{t.contact.name} *</label>
          <input name="name" required className={inputCls} autoComplete="name" />
        </div>
        <div>
          <label className={labelCls}>{t.contact.email} *</label>
          <input name="email" type="email" required className={inputCls} autoComplete="email" />
        </div>
        <div>
          <label className={labelCls}>{t.contact.phone}</label>
          <input name="phone" className={inputCls} autoComplete="tel" />
        </div>
        <div>
          <label className={labelCls}>{t.contact.subject}</label>
          <input name="subject" defaultValue={defaultSubject} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>{t.contact.message} *</label>
        <textarea name="body" rows={6} required className={inputCls} />
      </div>

      <SubmitButton t={t} />
    </form>
  );
}
