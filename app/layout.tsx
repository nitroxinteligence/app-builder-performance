import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";

import "./globals.css";

import { ProvedorTema } from "@/componentes/tema/provedor-tema";
import { ProvedorToast } from "@/componentes/ui/toaster";
import { AuthProvider } from "@/lib/providers/auth-provider";
import { QueryProvider } from "@/lib/providers/query-provider";
import { cn } from "@/lib/utilidades";

const fonteCorpo = Manrope({
  subsets: ["latin"],
  variable: "--fonte-corpo",
  display: "swap",
});

const fonteTitulo = Sora({
  subsets: ["latin"],
  variable: "--fonte-titulo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Builders Performance",
  description:
    "App central de rotina diária para alunos da comunidade Builders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          fonteCorpo.variable,
          fonteTitulo.variable
        )}
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            <ProvedorTema>{children}</ProvedorTema>
            <ProvedorToast />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
