"use client"

import * as React from "react"

import { cn } from "@/lib/utilidades"

interface PropsAvatar extends React.HTMLAttributes<HTMLDivElement> {
  tamanho?: "sm" | "md" | "lg" | "xl"
}

const tamanhosAvatar: Record<string, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
}

const Avatar = React.forwardRef<HTMLDivElement, PropsAvatar>(
  ({ className, tamanho = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted",
        tamanhosAvatar[tamanho],
        className
      )}
      {...props}
    />
  )
)

Avatar.displayName = "Avatar"

type PropsAvatarImagem = React.ImgHTMLAttributes<HTMLImageElement>

const AvatarImagem = React.forwardRef<HTMLImageElement, PropsAvatarImagem>(
  ({ className, alt, ...props }, ref) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      alt={alt}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  )
)

AvatarImagem.displayName = "AvatarImagem"

type PropsAvatarFallback = React.HTMLAttributes<HTMLSpanElement>

const AvatarFallback = React.forwardRef<HTMLSpanElement, PropsAvatarFallback>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-secondary font-medium text-secondary-foreground",
        className
      )}
      {...props}
    />
  )
)

AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImagem, AvatarFallback }
export type { PropsAvatar, PropsAvatarImagem, PropsAvatarFallback }
