// Middleware para proteção de rotas do dashboard - Simplified Roles
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Rotas protegidas (dashboard)
  const isProtectedRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/leads") ||
    nextUrl.pathname.startsWith("/agendamentos") ||
    nextUrl.pathname.startsWith("/metricas") ||
    nextUrl.pathname.startsWith("/configuracoes");

  // Rota de admin (super admin only)
  const isAdminRoute = nextUrl.pathname.startsWith("/organizacoes");

  // Rota de login
  const isAuthRoute = nextUrl.pathname.startsWith("/login");

  // Se está logado e tenta acessar login, redireciona para dashboard
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Se não está logado e tenta acessar rota protegida, redireciona para login
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar acesso à rota de admin (super admin only)
  if (isLoggedIn && isAdminRoute && req.auth?.user?.role !== "super_admin") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Se não está logado e tenta acessar rota de admin, redireciona para login
  if (!isLoggedIn && isAdminRoute) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Adicionar role ao header para acesso nas APIs
  if (isLoggedIn && (isProtectedRoute || isAdminRoute) && req.auth?.user?.role) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("X-User-Role", req.auth.user.role);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return response;
  }

  return NextResponse.next();
});

// Configuração de quais rotas passam pelo middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/leads/:path*",
    "/agendamentos/:path*",
    "/metricas/:path*",
    "/configuracoes/:path*",
    "/organizacoes/:path*",
    "/login",
  ],
};
