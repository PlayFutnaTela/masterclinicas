// Middleware para proteção de rotas usando Supabase Auth
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { nextUrl } = request;
  const isLoggedIn = !!user;

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

  // Para rotas de admin, verificar se é super_admin
  if (isLoggedIn && isAdminRoute) {
    // Buscar role do usuário no banco
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'super_admin') {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  // Se não está logado e tenta acessar rota de admin, redireciona para login
  if (!isLoggedIn && isAdminRoute) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Adicionar user id e role ao header para acesso nas APIs
  if (isLoggedIn && (isProtectedRoute || isAdminRoute)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("X-User-Id", user.id);

    // Buscar role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData) {
      requestHeaders.set("X-User-Role", userData.role);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return response;}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};