import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTranslation } from '../../hooks/useTranslation';

interface Carrier {
  id: number;
  name: string;
  code?: string;
  apiEndpoint?: string;
  apiKey?: string;
  apiSecret?: string;
  trackingUrl?: string;
  basePrice?: number;
  pricePerKg?: number;
}

export const CarriersOperator: React.FC = () => {
  const { t } = useTranslation();
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    basePrice: '',
    pricePerKg: ''
  });

  const fetchCarriers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/carriers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCarriers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      // Operator can only update (PUT), not create
      if (!editingId) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/carriers/${editingId}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        resetForm();
        fetchCarriers();
      }
    } catch (error) {
       console.error(error);
    }
  };

  const startEdit = (carrier: Carrier) => {
    setEditingId(carrier.id);
    setFormData({
        basePrice: carrier.basePrice?.toString() || '',
        pricePerKg: carrier.pricePerKg?.toString() || ''
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
      setFormData({ 
        basePrice: '',
        pricePerKg: ''
      });
      setEditingId(null);
      setIsFormOpen(false);
  };

  useEffect(() => {
    fetchCarriers();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('dashboard.menu.carriers')}</h1>
      </div>

      {isFormOpen && (
        <div className="mb-6">
            <Card>
                <h2 className="text-xl font-bold mb-4">{t('carriers.edit_carrier')} (Pricing Only)</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <h3 className="font-bold text-gray-700 mt-2 mb-2 border-b pb-1">Prezzi Spedizione</h3>
                    </div>

                    <div className="md:col-span-1">
                        <Input 
                            label={t('carriers.base_price')} 
                            type="number"
                            step="0.01"
                            value={formData.basePrice}
                            onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <Input 
                            label={t('carriers.price_per_kg')} 
                            type="number"
                            step="0.01"
                            value={formData.pricePerKg}
                            onChange={(e) => setFormData({...formData, pricePerKg: e.target.value})}
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                        <Button type="button" variant="outline" onClick={resetForm}>{t('customers.cancel')}</Button>
                        <Button type="submit">{t('customers.update')}</Button>
                    </div>
                </form>
            </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
             <p>{t('customers.loading')}</p>
        ) : carriers.length === 0 ? (
            <p className="text-gray-500">{t('carriers.no_carriers')}</p>
        ) : (
            carriers.map((carrier) => (
                <Card key={carrier.id}>
                    <div className="flex justify-between items-start">
                        <div>
                             <h3 className="font-bold text-xl">{carrier.name}</h3>
                             {carrier.code && <span className="text-xs bg-gray-100 px-2 py-1 rounded border font-mono">{carrier.code}</span>}
                             <p className="text-sm text-gray-500 mt-2">
                                Base: €{carrier.basePrice} | Per Kg: €{carrier.pricePerKg}
                             </p>
                        </div>
                        <div className="flex flex-col gap-2">
                              <Button variant="outline" onClick={() => startEdit(carrier)}>
                                  {t('customers.edit')}
                              </Button>
                        </div>
                    </div>
                </Card>
            ))
        )}
      </div>
    </div>
  );
};
