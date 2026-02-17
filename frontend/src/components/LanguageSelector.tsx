import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

import { SUPPORTED_LANGUAGES } from '@/lib/constants'
import { usersApi } from '@/lib/api'

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const currentLang =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0]

  const changeLanguage = async (langCode: string) => {
    if (langCode === i18n.language) return

    i18n.changeLanguage(langCode)

    // If user is logged in, save preference
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await usersApi.updateProfile({ language: langCode })
      } catch (error) {
        console.error('Failed to save language preference:', error)
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORTED_LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={currentLang.code === language.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
