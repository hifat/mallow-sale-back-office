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

// Flag icon components
const USFlag = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 16" fill="none">
    <rect width="24" height="16" fill="#B22234" rx="2"/>
    <rect width="24" height="1.23" fill="white" y="1.23"/>
    <rect width="24" height="1.23" fill="white" y="3.69"/>
    <rect width="24" height="1.23" fill="white" y="6.15"/>
    <rect width="24" height="1.23" fill="white" y="8.62"/>
    <rect width="24" height="1.23" fill="white" y="11.08"/>
    <rect width="24" height="1.23" fill="white" y="13.54"/>
    <rect width="9.6" height="8.62" fill="#3C3B6E"/>
  </svg>
)

const ThaiFlag = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 16" fill="none">
    <rect width="24" height="16" fill="#ED1C24" rx="2"/>
    <rect width="24" height="2.67" fill="white" y="2.67"/>
    <rect width="24" height="2.67" fill="#241D4F" y="5.33"/>
    <rect width="24" height="2.67" fill="#241D4F" y="8"/>
    <rect width="24" height="2.67" fill="white" y="10.67"/>
  </svg>
)

const languages = [
  { code: 'en' as Locale, name: 'English', flag: <USFlag /> },
  { code: 'th' as Locale, name: 'ไทย', flag: <ThaiFlag /> },
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
          <span className="hidden sm:inline-flex items-center gap-2">
            {currentLanguage?.flag}
            <span>{currentLanguage?.name}</span>
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
              {language.flag}
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
