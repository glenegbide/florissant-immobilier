import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PropertyForm, type PropertyFormData } from "@/components/admin/PropertyForm";
import { upsertProperty, deleteProperty } from "../actions";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await prisma.property.findUnique({ where: { id } });
  if (!p) notFound();

  const data: PropertyFormData = {
    ...p,
    availableFrom: p.availableFrom
      ? p.availableFrom.toISOString().slice(0, 10)
      : null,
  };

  return (
    <>
      <div className="mb-10 flex items-baseline justify-between">
        <h1 className="font-display text-3xl text-bordeaux">Modifier le bien</h1>
        <span className="font-mono text-xs text-mutedbrand">{p.reference}</span>
      </div>
      <PropertyForm property={data} action={upsertProperty} deleteAction={deleteProperty} />
    </>
  );
}
