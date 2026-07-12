import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function markRead(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const read = formData.get("read") === "true";
  if (id) {
    await prisma.message.update({ where: { id }, data: { read } });
    revalidatePath("/admin/messages");
    revalidatePath("/admin", "layout");
  }
}

async function deleteMessage(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (id) {
    await prisma.message.delete({ where: { id } });
    revalidatePath("/admin/messages");
    revalidatePath("/admin", "layout");
  }
}

export default async function MessagesPage() {
  const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <h1 className="font-display text-3xl text-bordeaux">Messages</h1>
      <p className="mt-1 text-sm font-light text-mutedbrand">
        {messages.length} message{messages.length > 1 ? "s" : ""}
      </p>

      {messages.length === 0 ? (
        <p className="mt-10 font-light text-mutedbrand">
          Aucun message pour le moment. Les demandes envoyées depuis le site apparaîtront ici.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`border border-line bg-white p-6 ${m.read ? "opacity-70" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 font-medium text-ink">
                    {!m.read && <span className="inline-block h-2 w-2 rounded-full bg-bordeaux" />}
                    {m.name}
                    {m.reference && (
                      <span className="font-mono text-xs text-mutedbrand">· {m.reference}</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-mutedbrand">
                    <a href={`mailto:${m.email}`} className="hover:text-bordeaux">
                      {m.email}
                    </a>
                    {m.phone && <span> · {m.phone}</span>}
                  </p>
                </div>
                <time className="text-xs text-mutedbrand tabular-nums">
                  {m.createdAt.toLocaleString("fr-CH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </div>

              {m.subject && (
                <p className="mt-4 text-sm font-medium text-ink">{m.subject}</p>
              )}
              <p className="mt-2 whitespace-pre-line text-sm font-light leading-relaxed text-ink/85">
                {m.body}
              </p>

              <div className="mt-5 flex items-center gap-5 text-xs">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent(
                    "Re: Florissant Immobilier"
                  )}`}
                  className="uppercase tracking-[0.15em] text-bordeaux hover:underline"
                >
                  Répondre
                </a>
                <form action={markRead}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="read" value={(!m.read).toString()} />
                  <button className="uppercase tracking-[0.15em] text-mutedbrand hover:text-bordeaux">
                    {m.read ? "Marquer non lu" : "Marquer lu"}
                  </button>
                </form>
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="uppercase tracking-[0.15em] text-mutedbrand hover:text-red-700">
                    Supprimer
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
