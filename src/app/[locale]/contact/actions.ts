"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ContactState = { ok: boolean; error?: boolean };

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function sendMessage(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const body = String(formData.get("body") || "").trim();

  // Honeypot: bots fill this hidden field; humans never see it.
  if (String(formData.get("company") || "").trim() !== "") {
    return { ok: true };
  }

  if (!name || !isEmail(email) || body.length < 2) {
    return { ok: false, error: true };
  }

  try {
    await prisma.message.create({
      data: {
        name,
        email,
        phone: String(formData.get("phone") || "").trim() || null,
        subject: String(formData.get("subject") || "").trim() || null,
        body,
        reference: String(formData.get("reference") || "").trim() || null,
        locale: String(formData.get("locale") || "fr"),
      },
    });
    revalidatePath("/admin/messages");
    return { ok: true };
  } catch {
    return { ok: false, error: true };
  }
}
