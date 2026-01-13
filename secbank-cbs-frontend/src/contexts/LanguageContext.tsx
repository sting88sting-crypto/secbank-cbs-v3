import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, t as translate, getBilingual } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getBilingual: (en: string, zh: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => translate(key, language);
  const getBilingualText = (en: string, zh: string | null | undefined) => getBilingual(en, zh, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getBilingual: getBilingualText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
