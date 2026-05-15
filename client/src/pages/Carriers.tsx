import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CarriersAdmin } from '../components/carriers/CarriersAdmin';
import { CarriersOperator } from '../components/carriers/CarriersOperator';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from '../components/ui/Button';

export default function Carriers() {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'ADMIN';
  const [viewMode, setViewMode] = useState<'admin' | 'operator'>('admin');

  return (
    <DashboardLayout>
      {isAdmin && (
           <div className="flex justify-end mb-2">
               <Button 
                   variant="outline"
                   onClick={() => setViewMode(v => v === 'admin' ? 'operator' : 'admin')}
                   className="text-xs"
               >
                   {viewMode === 'admin' ? '👁️ ' + t('dashboard.menu.carriers') + ' (Operator View)' : '⚙️ ' + t('dashboard.menu.carriers') + ' (Admin View)'}
               </Button>
           </div>
       )}
      {isAdmin && viewMode === 'admin' ? <CarriersAdmin /> : <CarriersOperator />}
    </DashboardLayout>
  );
}
