import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MasterClínicas | Plataforma SaaS para Clínicas de Estética",
  description: "Sistema completo para gestão de clínicas de estética. Gerencie leads, agendamentos e métricas em um só lugar.",
  keywords: ["clínica estética", "gestão", "leads", "agendamentos", "SaaS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
