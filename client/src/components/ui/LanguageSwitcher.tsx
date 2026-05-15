import { useTranslation } from '../../hooks/useTranslation';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useTranslation();

  return (
    <div className={`flex items-center ${className}`}>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:border-brand-500 shadow-sm cursor-pointer hover:border-brand-400 transition-colors"
        >
          <option value="it">Italiano</option>
          <option value="en">English</option>
        </select>
    </div>
  );
}
