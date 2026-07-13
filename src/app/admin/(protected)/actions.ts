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

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s || null;
}

function date(v: FormDataEntryValue | null): Date | null {
  const s = str(v);
  return s ? new Date(s) : null;
}

const IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "avif"];
const DOC_EXT = [...IMAGE_EXT, "pdf"];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

async function saveFiles(
  files: File[],
  allowedExt: string[],
  subdir = "uploads"
): Promise<string[]> {
  const dir = path.join(process.cwd(), "public", subdir);
  await fs.mkdir(dir, { recursive: true });
  const saved: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0 || file.size > MAX_FILE_SIZE) continue;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    if (!allowedExt.includes(ext)) continue;
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    saved.push(`/${subdir}/${name}`);
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

  const newPhotos = await saveFiles(formData.getAll("photoFiles") as File[], IMAGE_EXT);
  const keptPhotos = (formData.getAll("existingPhotos") as string[]).filter(Boolean);

  const newPlans = await saveFiles(formData.getAll("planFiles") as File[], DOC_EXT, "uploads/plans");
  const keptPlans = (formData.getAll("existingPlans") as string[]).filter(Boolean);

  const newBrochure = await saveFiles(formData.getAll("brochureFile") as File[], ["pdf"], "uploads/docs");
  const keptBrochure = str(formData.get("existingBrochure"));

  const availability = String(formData.get("availability") || "immediately");
  const status = String(formData.get("status") || "active");

  const data = {
    offerType: offerType as "RENT" | "SALE",
    objectType: String(formData.get("objectType") || "appartement"),
    objectSubtype: str(formData.get("objectSubtype")),
    titleFr: String(formData.get("titleFr") || "").trim(),
    titleEn: String(formData.get("titleEn") || "").trim() || String(formData.get("titleFr") || "").trim(),
    descriptionFr: String(formData.get("descriptionFr") || ""),
    descriptionEn: String(formData.get("descriptionEn") || ""),
    street: str(formData.get("street")),
    hideStreet: formData.get("hideStreet") === "on",
    postalCode: str(formData.get("postalCode")),
    city: String(formData.get("city") || "").trim(),
    district: str(formData.get("district")),
    canton: String(formData.get("canton") || "GE"),
    country: String(formData.get("country") || "Suisse"),
    rooms: num(formData.get("rooms")),
    bedrooms: int(formData.get("bedrooms")),
    bathrooms: int(formData.get("bathrooms")),
    floor: int(formData.get("floor")),
    buildingFloors: int(formData.get("buildingFloors")),
    livingArea: int(formData.get("livingArea")),
    usableArea: int(formData.get("usableArea")),
    landArea: int(formData.get("landArea")),
    volume: int(formData.get("volume")),
    ceilingHeight: num(formData.get("ceilingHeight")),
    yearBuilt: int(formData.get("yearBuilt")),
    lastRenovation: int(formData.get("lastRenovation")),
    availability,
    availableFrom:
      availability === "date" ? date(formData.get("availableFrom")) : null,
    price: int(formData.get("price")),
    charges: int(formData.get("charges")),
    grossRent: int(formData.get("grossRent")),
    priceOnRequest: formData.get("priceOnRequest") === "on",
    priceUnit:
      offerType === "SALE" ? "total" : String(formData.get("priceUnit") || "month"),
    chargesIncluded: formData.get("chargesIncluded") === "on",
    features: (formData.getAll("features") as string[]).filter(Boolean),
    photos: [...keptPhotos, ...newPhotos],
    floorPlans: [...keptPlans, ...newPlans],
    brochureUrl: newBrochure[0] ?? keptBrochure,
    videoUrl: str(formData.get("videoUrl")),
    virtualTourUrl: str(formData.get("virtualTourUrl")),
    offMarket: formData.get("offMarket") === "on",
    featured: formData.get("featured") === "on",
    status,
    transactionStatus: String(formData.get("transactionStatus") || "available"),
    expiresAt: date(formData.get("expiresAt")),
    seoTitleFr: str(formData.get("seoTitleFr")),
    seoTitleEn: str(formData.get("seoTitleEn")),
    seoDescFr: str(formData.get("seoDescFr")),
    seoDescEn: str(formData.get("seoDescEn")),
    internalNotes: String(formData.get("internalNotes") || ""),
    ownerName: str(formData.get("ownerName")),
    ownerContact: str(formData.get("ownerContact")),
    commission: str(formData.get("commission")),
    listingSource: str(formData.get("listingSource")),
  };

  if (!data.titleFr || !data.city) {
    throw new Error("Titre (FR) et lieu sont obligatoires");
  }

  if (id) {
    const existing = await prisma.property.findUnique({
      where: { id },
      select: { publishedAt: true },
    });
    await prisma.property.update({
      where: { id },
      data: {
        ...data,
        publishedAt:
          status === "active" && !existing?.publishedAt ? new Date() : undefined,
      },
    });
  } else {
    await prisma.property.create({
      data: {
        ...data,
        reference: await nextReference(data.offerType),
        publishedAt: status === "active" ? new Date() : null,
      },
    });
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function duplicateProperty(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin");

  const p = await prisma.property.findUnique({ where: { id } });
  if (!p) redirect("/admin");

  const {
    id: _id,
    reference: _reference,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    publishedAt: _publishedAt,
    externalIds: _externalIds,
    syncStatus: _syncStatus,
    lastSyncAt: _lastSyncAt,
    ...rest
  } = p;

  const copy = await prisma.property.create({
    data: {
      ...rest,
      externalIds: {},
      titleFr: `${p.titleFr} (copie)`,
      titleEn: `${p.titleEn} (copy)`,
      status: "draft",
      featured: false,
      reference: await nextReference(p.offerType),
    },
  });

  revalidatePath("/", "layout");
  redirect(`/admin/${copy.id}`);
}

export async function archiveProperty(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) {
    await prisma.property.update({
      where: { id },
      data: { status: "archived", featured: false },
    });
    revalidatePath("/", "layout");
  }
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
