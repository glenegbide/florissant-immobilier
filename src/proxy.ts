import { NextRequest, NextResponse } from "next/server";

async function expectedToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET || "";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode("florissant-admin")
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // MAINXP (optimistic UX guard only — the real check is requireMxUser() server-side).
  if (pathname.startsWith("/mainxp")) {
    const isAuthPage =
      pathname.startsWith("/mainxp/login") || pathname.startsWith("/mainxp/signup");
    const hasSession = !!req.cookies.get("mxp_session")?.value;
    if (!isAuthPage && !hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/mainxp/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }
  const cookie = req.cookies.get("fl_admin")?.value;
  if (cookie && cookie === (await expectedToken())) {
    return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/mainxp/:path*"],
};
