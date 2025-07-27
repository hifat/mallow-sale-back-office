'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Locale = 'en' | 'th'

interface Translation {
  [key: string]: any
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const STORAGE_KEY = 'mallow-sale-locale'
const DEFAULT_LOCALE: Locale = 'en'

// Helper function to get nested object value by dot notation
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}

// Helper function to replace placeholders in translation strings
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  
  return Object.keys(params).reduce((result, key) => {
    return result.replace(new RegExp(`{{${key}}}`, 'g'), String(params[key]))
  }, text)
}

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [translations, setTranslations] = useState<Translation>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load translations for a specific locale
  const loadTranslations = async (targetLocale: Locale) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/locales/${targetLocale}.json`)
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${targetLocale}`)
      }
      const data = await response.json()
      setTranslations(data)
    } catch (error) {
      console.error('Error loading translations:', error)
      // Fallback to empty translations
      setTranslations({})
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize locale from localStorage or default
  useEffect(() => {
    const savedLocale = localStorage.getItem(STORAGE_KEY) as Locale
    const initialLocale = savedLocale && ['en', 'th'].includes(savedLocale) 
      ? savedLocale 
      : DEFAULT_LOCALE
    
    setLocaleState(initialLocale)
    loadTranslations(initialLocale)
  }, [])

  // Update locale and persist to localStorage
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(STORAGE_KEY, newLocale)
    loadTranslations(newLocale)
  }

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations, key)
    return interpolate(translation, params)
  }

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    isLoading
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
