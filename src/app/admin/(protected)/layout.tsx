import Link from "next/link";
import Image from "next/image";
import { logout } from "./actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const unread = await prisma.message.count({ where: { read: false } });
  return (
    <div className="min-h-screen bg-ivory">
      <header className="bg-white border-b border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/logo/icon.png"
                alt=""
                width={537}
                height={1122}
                className="h-10 w-auto"
              />
              <span className="font-display text-lg text-bordeaux">
                Administration
              </span>
            </Link>
            <nav className="hidden sm:flex items-center gap-6 text-[0.8rem] uppercase tracking-[0.15em] text-mutedbrand">
              <Link href="/admin" className="hover:text-bordeaux transition-colors">
                Biens
              </Link>
              <Link href="/admin/messages" className="hover:text-bordeaux transition-colors">
                Messages
                {unread > 0 && (
                  <span className="ml-1.5 inline-block rounded-full bg-bordeaux px-1.5 py-0.5 text-[0.6rem] text-white">
                    {unread}
                  </span>
                )}
              </Link>
              <Link href="/admin/integrations" className="hover:text-bordeaux transition-colors">
                Intégrations
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/fr"
              className="text-[0.8rem] uppercase tracking-[0.15em] text-mutedbrand hover:text-bordeaux transition-colors"
            >
              Voir le site →
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-[0.8rem] uppercase tracking-[0.15em] text-mutedbrand hover:text-bordeaux transition-colors"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">{children}</main>
    </div>
  );
}
