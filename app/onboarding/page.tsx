"use client";

import { useRouter } from "next/navigation";

import FluxoOnboarding from "./fluxo-onboarding";

export default function PaginaOnboarding() {
  const router = useRouter();
  return (
    <FluxoOnboarding aoFinalizar={() => router.push("/inicio")} />
  );
}
