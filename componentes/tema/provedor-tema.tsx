"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";

type PropsProvedorTema = {
  children: React.ReactNode;
};

export function ProvedorTema({ children }: PropsProvedorTema) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
