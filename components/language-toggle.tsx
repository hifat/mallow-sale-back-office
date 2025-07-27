'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages, Check } from 'lucide-react'
import { useI18n, type Locale } from '@/contexts/i18n-context'

const languages = [
  { code: 'en' as Locale, name: 'English', flag: '🇺🇸' },
  { code: 'th' as Locale, name: 'ไทย', flag: '🇹🇭' },
]

export function LanguageToggle() {
  const { locale, setLocale, t, isLoading } = useI18n()

  const currentLanguage = languages.find(lang => lang.code === locale)

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Languages className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline-block">
            {currentLanguage?.flag} {currentLanguage?.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLocale(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
            {locale === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
