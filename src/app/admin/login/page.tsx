import Image from "next/image";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminToken, checkCredentials, ADMIN_COOKIE, isAdmin } from "@/lib/auth";

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  if (!checkCredentials(email, password)) {
    redirect("/admin/login?error=1");
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  redirect("/admin");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo/icon.png"
            alt=""
            width={537}
            height={1122}
            className="h-20 w-auto"
            priority
          />
          <h1 className="mt-5 font-display text-2xl text-bordeaux">
            Administration
          </h1>
          <p className="mt-1 text-[0.65rem] uppercase tracking-brand text-mutedbrand">
            Florissant Immobilier · International
          </p>
        </div>

        <form action={login} className="mt-9 space-y-4 bg-white border border-line p-7">
          {error && (
            <p className="border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
              E-mail ou mot de passe incorrect.
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">E-mail</label>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              className="w-full border border-line bg-white px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-bordeaux transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Mot de passe</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full border border-line bg-white px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-bordeaux transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-bordeaux px-6 py-3 text-[0.75rem] uppercase tracking-[0.22em] text-white hover:bg-bordeaux-soft transition-colors"
          >
            Se connecter
          </button>

          <details className="pt-1">
            <summary className="cursor-pointer text-xs text-mutedbrand hover:text-bordeaux transition-colors">
              Mot de passe oublié ?
            </summary>
            <div className="mt-3 border border-line bg-ivory-alt p-3.5 text-xs font-light leading-relaxed text-ink/80">
              <p>
                Votre mot de passe est conservé sur votre ordinateur, dans le
                fichier <code className="font-mono">.env</code> du site (ligne{" "}
                <code className="font-mono">ADMIN_PASSWORD</code>).
              </p>
              <p className="mt-2">
                Dans le Terminal :{" "}
                <code className="font-mono">npm run password</code> l&apos;affiche,{" "}
                <code className="font-mono">
                  npm run password -- NouveauMotDePasse
                </code>{" "}
                le remplace.
              </p>
            </div>
          </details>
        </form>
      </div>
    </div>
  );
}
