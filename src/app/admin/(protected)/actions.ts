"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import fs from "node:fs/promises";
import path from "node:path";
import { requireAdmin, ADMIN_COOKIE } from "@/lib/auth";

function num(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function int(v: FormDataEntryValue | null): number | null {
  const n = num(v);
  return n == null ? null : Math.round(n);
}

async function savePhotos(files: File[]): Promise<string[]> {
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const saved: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    if (!["jpg", "jpeg", "png", "webp", "avif"].includes(ext)) continue;
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    saved.push(`/uploads/${name}`);
  }
  return saved;
}

async function nextReference(offerType: "RENT" | "SALE"): Promise<string> {
  const prefix = offerType === "SALE" ? "FL-V-" : "FL-L-";
  const last = await prisma.property.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const n = last ? parseInt(last.reference.slice(prefix.length), 10) + 1 : offerType === "SALE" ? 1001 : 2001;
  return `${prefix}${n}`;
}

export async function upsertProperty(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const offerType = formData.get("offerType") === "SALE" ? "SALE" : "RENT";

  const newPhotos = await savePhotos(formData.getAll("photoFiles") as File[]);
  const keptPhotos = (formData.getAll("existingPhotos") as string[]).filter(Boolean);

  const availability = String(formData.get("availability") || "immediately");
  const availableFromRaw = String(formData.get("availableFrom") || "");

  const data = {
    offerType: offerType as "RENT" | "SALE",
    objectType: String(formData.get("objectType") || "appartement"),
    objectSubtype: String(formData.get("objectSubtype") || "") || null,
    titleFr: String(formData.get("titleFr") || "").trim(),
    titleEn: String(formData.get("titleEn") || "").trim() || String(formData.get("titleFr") || "").trim(),
    descriptionFr: String(formData.get("descriptionFr") || ""),
    descriptionEn: String(formData.get("descriptionEn") || ""),
    street: String(formData.get("street") || "") || null,
    hideStreet: formData.get("hideStreet") === "on",
    postalCode: String(formData.get("postalCode") || "") || null,
    city: String(formData.get("city") || "").trim(),
    district: String(formData.get("district") || "") || null,
    canton: String(formData.get("canton") || "GE"),
    country: String(formData.get("country") || "Suisse"),
    rooms: num(formData.get("rooms")),
    bedrooms: int(formData.get("bedrooms")),
    bathrooms: int(formData.get("bathrooms")),
    floor: int(formData.get("floor")),
    livingArea: int(formData.get("livingArea")),
    usableArea: int(formData.get("usableArea")),
    volume: int(formData.get("volume")),
    ceilingHeight: num(formData.get("ceilingHeight")),
    yearBuilt: int(formData.get("yearBuilt")),
    lastRenovation: int(formData.get("lastRenovation")),
    availability,
    availableFrom:
      availability === "date" && availableFromRaw ? new Date(availableFromRaw) : null,
    price: int(formData.get("price")),
    priceOnRequest: formData.get("priceOnRequest") === "on",
    priceUnit:
      offerType === "SALE" ? "total" : String(formData.get("priceUnit") || "month"),
    chargesIncluded: formData.get("chargesIncluded") === "on",
    features: (formData.getAll("features") as string[]).filter(Boolean),
    photos: [...keptPhotos, ...newPhotos],
    offMarket: formData.get("offMarket") === "on",
    featured: formData.get("featured") === "on",
    status: String(formData.get("status") || "active"),
  };

  if (!data.titleFr || !data.city) {
    throw new Error("Titre (FR) et lieu sont obligatoires");
  }

  if (id) {
    await prisma.property.update({ where: { id }, data });
  } else {
    await prisma.property.create({
      data: { ...data, reference: await nextReference(data.offerType) },
    });
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function deleteProperty(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) {
    await prisma.property.delete({ where: { id } });
    revalidatePath("/", "layout");
  }
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
