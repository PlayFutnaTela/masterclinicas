Build Error

Module not found: Can't resolve 'next-themes'
./src/components/dashboard/theme-toggle-button.tsx (3:1)

Module not found: Can't resolve 'next-themes'
  1 | "use client";
  2 |
> 3 | import { useTheme } from 'next-themes';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  4 | import { Moon, Sun } from 'lucide-react';
  5 |
  6 | export function ThemeToggleButton() {

Import traces:
  Client Component Browser:
    ./src/components/dashboard/theme-toggle-button.tsx [Client Component Browser]
    ./src/components/dashboard/sidebar.tsx [Client Component Browser]
    ./src/components/dashboard/sidebar.tsx [Server Component]
    ./src/app/(dashboard)/layout.tsx [Server Component]
    ./src/app/agendamentos/layout.tsx [Server Component]

  Client Component SSR:
    ./src/components/dashboard/theme-toggle-button.tsx [Client Component SSR]
    ./src/components/dashboard/sidebar.tsx [Client Component SSR]
    ./src/components/dashboard/sidebar.tsx [Server Component]
    ./src/app/(dashboard)/layout.tsx [Server Component]
    ./src/app/agendamentos/layout.tsx [Server Component]

https://nextjs.org/docs/messages/module-not-found
