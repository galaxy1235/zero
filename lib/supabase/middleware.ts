import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function updateSession(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await sb.auth.getUser();
  const path = req.nextUrl.pathname;
  const go = (to: string, search = "") => { const u = req.nextUrl.clone(); u.pathname = to; u.search = search; return NextResponse.redirect(u); };
  if (!user && path.startsWith("/dashboard")) return go("/login", `?next=${encodeURIComponent(path)}`);
  if (user && (path === "/login" || path === "/register")) return go("/dashboard");
  return res;
}
