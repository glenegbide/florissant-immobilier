import { PropertyForm } from "@/components/admin/PropertyForm";
import { upsertProperty } from "../actions";

export default function NewPropertyPage() {
  return (
    <>
      <h1 className="font-display text-3xl text-bordeaux mb-10">Nouveau bien</h1>
      <PropertyForm action={upsertProperty} />
    </>
  );
}
