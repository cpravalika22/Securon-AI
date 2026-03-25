/**
 * @fileOverview UI component to switch between supported languages.
 */

'use client';

import { useLanguage } from '@/components/language-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { Language } from '@/lib/translations';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'es', name: 'Español' },
  ];

  const currentLangName = languages.find(l => l.code === language)?.name || 'English';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 rounded-full border h-10 px-4">
          <Languages className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold hidden sm:inline">{currentLangName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl p-2 w-32">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="rounded-xl cursor-pointer font-medium"
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
