// Middleware para proteção de rotas do dashboard - Multi-Tenant
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

  // Validar organização para rotas protegidas
  if (isLoggedIn && isProtectedRoute && req.auth?.user?.organizationId) {
    // Adicionar organizationId ao header para acesso nas APIs
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("X-Organization-Id", req.auth.user.organizationId);
    requestHeaders.set("X-User-Role", req.auth.user.userRole || "");

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
    "/login",
  ],
};
