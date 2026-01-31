"use client";

import { Toaster as SonnerToaster } from "sonner";

export function ProvedorToast() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group border-border bg-card text-card-foreground rounded-xl",
          title: "text-sm font-semibold",
          description: "text-sm text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground hover:bg-primary/90",
          cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
          closeButton:
            "bg-background text-foreground border-border hover:bg-muted",
          success:
            "border-l-4 border-l-primary bg-card text-card-foreground",
          error:
            "border-l-4 border-l-destructive bg-card text-card-foreground",
          info: "border-l-4 border-l-primary/60 bg-card text-card-foreground",
          loading:
            "border-l-4 border-l-primary/40 bg-card text-card-foreground",
        },
      }}
    />
  );
}
