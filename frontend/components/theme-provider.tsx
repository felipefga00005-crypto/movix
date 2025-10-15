"use client"

/**
 * Theme Provider - Gerenciador de tema (dark/light mode)
 * Baseado em next-themes
 */

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

