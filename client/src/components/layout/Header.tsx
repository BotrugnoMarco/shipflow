import { useTranslation } from '../../hooks/useTranslation';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

interface HeaderProps {
  userEmail: string;
  onLogout: () => void;
}

export function Header({ userEmail, onLogout }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">
        {t('dashboard.welcome')}, <span className="text-brand-600">{userEmail}</span>
      </h1>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <button 
          onClick={onLogout} 
          className="text-red-500 hover:text-red-700 font-bold text-sm"
        >
          {t('dashboard.logout')}
        </button>
      </div>
    </header>
  );
}
