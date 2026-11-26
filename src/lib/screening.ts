// Who may register: Geneva régies ask for net income of at least 3× the rent,
// no debt enforcement (poursuites) and no social assistance (Hospice général).
// Shared by the form (live hint) and the server action (final decision).

export const INCOME_MULTIPLE = 3;

export type ScreeningInput = {
  maxRent?: number;
  income?: number;
  debts: boolean;
  welfare: boolean;
  second?: {
    role: "co" | "guarantor";
    income?: number;
    debts: boolean;
    welfare: boolean;
  } | null;
};

export type ScreeningResult = {
  ok: boolean;
  ratio: number | null; // tenants' income ÷ max rent
  reasons: ("debts" | "welfare" | "income")[];
};

export function screen(i: ScreeningInput): ScreeningResult {
  const reasons: ScreeningResult["reasons"] = [];
  const s = i.second ?? null;
  if (i.debts || s?.debts) reasons.push("debts");
  if (i.welfare || s?.welfare) reasons.push("welfare");

  const rent = i.maxRent ?? 0;
  const tenants = (i.income ?? 0) + (s?.role === "co" ? s.income ?? 0 : 0);
  const ratio = rent > 0 ? Math.round((tenants / rent) * 10) / 10 : null;
  const guarantorOk = s?.role === "guarantor" && rent > 0 && (s.income ?? 0) >= INCOME_MULTIPLE * rent;
  if (!(rent > 0 && tenants >= INCOME_MULTIPLE * rent) && !guarantorOk) reasons.push("income");

  return { ok: reasons.length === 0, ratio, reasons };
}
