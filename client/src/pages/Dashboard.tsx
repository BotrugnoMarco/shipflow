import { useTranslation } from '../hooks/useTranslation';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';

export default function Dashboard() {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-gray-500 font-bold text-sm uppercase">{t('dashboard.company')}</h3>
          <p className="text-2xl font-bold mt-2 text-brand-600">{user.company || t('common.na')}</p>
        </Card>
        <Card>
          <h3 className="text-gray-500 font-bold text-sm uppercase">{t('dashboard.active_shipments')}</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
