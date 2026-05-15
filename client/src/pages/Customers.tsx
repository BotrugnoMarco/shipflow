import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useTranslation } from '../hooks/useTranslation';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  province?: string;
  country?: string;
  vatId?: string;
}

export default function Customers() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    province: '',
    country: '',
    vatId: ''
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm
      });
      const res = await fetch(`${import.meta.env.VITE_API_URL}/customers?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        // Handle both paginated and non-paginated responses for backward compatibility if needed, 
        // strictly using paginated structure now.
        if (result.data) {
             setCustomers(result.data);
             setTotalPages(result.totalPages);
        } else {
             setCustomers(result); // Fallback
        }
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
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${import.meta.env.VITE_API_URL}/customers/${editingId}`
        : `${import.meta.env.VITE_API_URL}/customers`;

      const res = await fetch(url, {
        method,
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        resetForm();
        fetchCustomers();
      }
    } catch (error) {
       console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('customers.confirm_delete'))) return;
    
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/customers/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            fetchCustomers();
        }
    } catch (error) {
        console.error(error);
    }
  };

  const startEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        zipCode: customer.zipCode || '',
        province: customer.province || '',
        country: customer.country || '',
        vatId: customer.vatId || ''
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
      setFormData({ 
        name: '', email: '', phone: '', address: '', 
        city: '', zipCode: '', province: '', country: '', 
        vatId: '' 
      });
      setEditingId(null);
      setIsFormOpen(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, searchTerm]); // Refetch on page or search change

  // Server-side filtering is now active, so we use customers directly
  const displayCustomers = customers;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('dashboard.menu.customers')}</h1>
        <Button onClick={() => isFormOpen ? resetForm() : setIsFormOpen(true)} variant={isFormOpen ? 'secondary' : 'primary'}>
          {isFormOpen ? t('customers.cancel') : t('customers.new_customer')}
        </Button>
      </div>

      {!isFormOpen && (
        <div className="mb-6">
          <Input 
            placeholder={t('customers.search_placeholder')}
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to page 1 on search
            }}
          />
        </div>
      )}

      {isFormOpen && (
        <div className="mb-6">
            <Card>
                <h2 className="text-xl font-bold mb-4">{editingId ? t('customers.edit_customer') : t('customers.new_customer')}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Input 
                            label={t('customers.name_label')} 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <Input 
                        label={t('customers.email_label')} 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                     <Input 
                        label={t('customers.phone_label')} 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                    <Input 
                        label={t('customers.vat_label')} 
                        value={formData.vatId}
                        onChange={(e) => setFormData({...formData, vatId: e.target.value})}
                    />
                    <Input 
                        label={t('customers.address_label')} 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label={t('shipments.form.zip')}
                            value={formData.zipCode}
                            onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                        />
                        <Input 
                            label={t('shipments.form.city')}
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <Input 
                            label={t('shipments.form.province')}
                            value={formData.province}
                            onChange={(e) => setFormData({...formData, province: e.target.value})}
                        />
                        <Input 
                            label={t('shipments.form.country')}
                            value={formData.country}
                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                        <Button type="button" variant="outline" onClick={resetForm}>{t('customers.cancel')}</Button>
                        <Button type="submit">{editingId ? t('customers.update') : t('customers.save')}</Button>
                    </div>
                </form>
            </Card>
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
             <p>{t('customers.loading')}</p>
        ) : displayCustomers.length === 0 ? (
            <p className="text-gray-500">{t('customers.no_customers')}</p>
        ) : (
            <>
            {displayCustomers.map((customer) => (
                <Card key={customer.id}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg">{customer.name}</h3>
                            <div className="text-sm text-gray-500 mt-1 space-y-1">
                                {customer.email && <p>📧 {customer.email}</p>}
                                {customer.phone && <p>📞 {customer.phone}</p>}
                                {customer.vatId && <p>🏢 {customer.vatId}</p>}
                                {customer.address && <p>📍 {customer.address}</p>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={() => startEdit(customer)}>
                                {t('customers.edit')}
                            </Button>
                             <Button variant="danger" onClick={() => handleDelete(customer.id)}>
                                {t('customers.delete')}
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
            
            {/* Pagination Controls */}
            <div className="flex justify-center gap-2 mt-4 items-center">
                <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    &laquo; {t('common.prev')}
                </Button>
                <span className="text-sm text-gray-600">
                    {t('common.page')} {page} {t('common.of')} {totalPages}
                </span>
                <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                >
                    {t('common.next')} &raquo;
                </Button>
            </div>
            </>
        )}
      </div>
    </DashboardLayout>
  );
}
