import { ReactNode } from 'react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
