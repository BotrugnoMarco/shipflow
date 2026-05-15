import { createContext, useContext, useState, ReactNode } from 'react';
import { it } from '../locales/it';
import { en } from '../locales/en';

type Language = 'it' | 'en';

// Helper to access nested keys (e.g. "auth.login_title")
const getNestedValue = (obj: any, key: string) => {
  return key.split('.').reduce((o, i) => (o ? o[i] : null), obj) as string;
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('it');

  const t = (key: string) => {
    const translations = language === 'it' ? it : en;
    const value = getNestedValue(translations, key);
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
