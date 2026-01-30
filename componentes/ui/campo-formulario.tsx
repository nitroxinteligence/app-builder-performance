"use client";

import * as React from "react";
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import {
  Controller,
} from "react-hook-form";

import { cn } from "@/lib/utilidades";

// ---------------------------------------------------------------------------
// CampoFormulario — Reusable form field with label, input slot, and error
// ---------------------------------------------------------------------------

type CampoFormularioProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  form: UseFormReturn<TFieldValues>;
  name: TName;
  label: string;
  description?: string;
  className?: string;
  children: (field: ControllerRenderProps<TFieldValues, TName>) => React.ReactNode;
};

export function CampoFormulario<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  form,
  name,
  label,
  description,
  className,
  children,
}: CampoFormularioProps<TFieldValues, TName>) {
  const errorMessage = form.formState.errors[name]?.message as string | undefined;
  const fieldId = `campo-${String(name)}`;

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <div>
            {children({ ...field, ref: field.ref })}
          </div>
        )}
      />
      {errorMessage ? (
        <p className="text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
