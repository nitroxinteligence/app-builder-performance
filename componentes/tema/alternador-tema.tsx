"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Botao } from "@/componentes/ui/botao";
import {
  MenuSuspenso,
  MenuSuspensoConteudo,
  MenuSuspensoGatilho,
  MenuSuspensoItem,
} from "@/componentes/ui/menu-suspenso";

export function AlternadorTema() {
  const { setTheme } = useTheme();

  return (
    <MenuSuspenso>
      <MenuSuspensoGatilho asChild>
        <Botao variant="outline" size="icon" aria-label="Alternar tema">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Botao>
      </MenuSuspensoGatilho>
      <MenuSuspensoConteudo align="end">
        <MenuSuspensoItem onClick={() => setTheme("light")}>
          Claro
        </MenuSuspensoItem>
        <MenuSuspensoItem onClick={() => setTheme("dark")}>
          Escuro
        </MenuSuspensoItem>
      </MenuSuspensoConteudo>
    </MenuSuspenso>
  );
}
