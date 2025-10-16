'use client'

/**
 * Componente de Customização de Temas
 * Permite ao usuário selecionar diferentes paletas de cores
 */

import { useEffect, useState } from 'react'
import { IconPalette, IconCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { themes } from '@/lib/themes'

const THEME_STORAGE_KEY = 'movix-theme'

export function ThemeCustomizer() {
  const [currentTheme, setCurrentTheme] = useState('zinc')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Carregar tema salvo
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  const applyTheme = (themeName: string) => {
    const theme = themes.find((t) => t.name === themeName)
    if (!theme) return

    const root = document.documentElement
    const isDark = root.classList.contains('dark')
    const vars = isDark ? theme.cssVars.dark : theme.cssVars.light

    // Aplicar variáveis CSS
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    // Salvar preferência
    localStorage.setItem(THEME_STORAGE_KEY, themeName)
    setCurrentTheme(themeName)
  }

  // Observar mudanças no modo dark/light para reaplicar tema
  useEffect(() => {
    if (!mounted) return

    const observer = new MutationObserver(() => {
      applyTheme(currentTheme)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [currentTheme, mounted])

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <IconPalette className="h-4 w-4" />
          <span className="sr-only">Selecionar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Tema</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            onClick={() => applyTheme(theme.name)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full border"
                style={{
                  background: theme.cssVars.light.primary,
                }}
              />
              <span>{theme.label}</span>
            </div>
            {currentTheme === theme.name && (
              <IconCheck className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

