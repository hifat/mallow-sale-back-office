import { useI18n } from '@/contexts/i18n-context'

/**
 * Convenience hook that returns just the translation function
 * This is useful when you only need the `t` function and not the full i18n context
 */
export function useTranslation() {
  const { t } = useI18n()
  return { t }
}
