import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', label: t('dashboard.menu.dashboard') },
    { path: '/shipments', label: t('dashboard.menu.shipments') },
    { path: '/customers', label: t('dashboard.menu.customers') },
    { path: '/carriers', label: t('dashboard.menu.carriers') },
  ];

  return (
    <aside className="w-64 bg-dark-900 text-white p-6 hidden md:block flex-shrink-0">
      <div className="flex items-center mb-8">
        <img src="/logo.png" alt="ShipFlow" className="h-8 mr-2" />
        <span className="font-bold text-xl">ShipFlow</span>
      </div>
      <nav className="space-y-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block py-2 px-4 rounded transition-colors ${
              isActive(item.path) 
                ? 'bg-brand-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
