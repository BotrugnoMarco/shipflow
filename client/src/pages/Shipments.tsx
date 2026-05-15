import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useTranslation } from '../hooks/useTranslation';
import { ShipmentForm, Customer, ShipmentFormData, Carrier } from '../components/shipments/ShipmentForm';
import { ShipmentCard, Shipment } from '../components/shipments/ShipmentCard';

export default function Shipments() {
  const { t } = useTranslation();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Pickup Logic
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().slice(0, 16)); // datetime-local format
  
  const [formData, setFormData] = useState<ShipmentFormData>({
    customerId: '',
    carrierId: '',
    senderName: '',
    senderAddress: '',
    senderCity: '',
    senderZip: '',
    senderProvince: '',
    senderCountry: '',
    senderEmail: '',
    senderPhone: '',
    recipientName: '',
    recipientAddress: '',
    recipientCity: '',
    recipientZip: '',
    recipientProvince: '',
    recipientCountry: '',
    recipientEmail: '',
    recipientPhone: '',
    shippingAddress: '',
    weight: '',
    packages: '1',
    notes: '',
    price: ''
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
      }
  };

  const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch many customers for the dropdown (pagination handling)
        const res = await fetch(`${import.meta.env.VITE_API_URL}/customers?limit=1000`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const result = await res.json();
          if (result.data && Array.isArray(result.data)) {
             setCustomers(result.data);
          } else if (Array.isArray(result)) {
             setCustomers(result);
          }
        }
      } catch (error) {
        console.error(error);
      }
  };

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter,
        carrierId: carrierFilter
      });
      const res = await fetch(`${import.meta.env.VITE_API_URL}/shipments?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
             setShipments(result.data);
             setTotalPages(result.totalPages);
        } else {
             setShipments(result);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const custId = e.target.value;
      if (!custId) return;
      
      const selectedCustomer = customers.find(c => c.id === Number(custId));
      if (selectedCustomer) {
        setFormData(prev => ({
            ...prev,
            customerId: custId, // Link shipment to this customer (Sender pays usually)
            senderName: selectedCustomer.name,
            senderAddress: selectedCustomer.address || prev.senderAddress,
            senderCity: selectedCustomer.city || prev.senderCity || '',
            senderZip: selectedCustomer.zipCode || prev.senderZip || '',
            senderProvince: selectedCustomer.province || prev.senderProvince || '',
            senderCountry: selectedCustomer.country || prev.senderCountry || '',
            senderEmail: selectedCustomer.email || prev.senderEmail,
            senderPhone: selectedCustomer.phone || prev.senderPhone
        }));
      }
  };

  const onRecipientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const custId = e.target.value;
      if (!custId) return;

      const selectedCustomer = customers.find(c => c.id === Number(custId));
      if (selectedCustomer) {
          setFormData(prev => ({
              ...prev,
              recipientName: selectedCustomer.name,
              recipientAddress: selectedCustomer.address || prev.recipientAddress,
              recipientCity: selectedCustomer.city || prev.recipientCity || '',
              recipientZip: selectedCustomer.zipCode || prev.recipientZip || '',
              recipientProvince: selectedCustomer.province || prev.recipientProvince || '',
              recipientCountry: selectedCustomer.country || prev.recipientCountry || '',
              recipientEmail: selectedCustomer.email || prev.recipientEmail,
              recipientPhone: selectedCustomer.phone || prev.recipientPhone
          }));
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${import.meta.env.VITE_API_URL}/shipments/${editingId}`
        : `${import.meta.env.VITE_API_URL}/shipments`;

      const payload = {
          ...formData,
          customerId: formData.customerId ? Number(formData.customerId) : null,
          carrierId: formData.carrierId ? Number(formData.carrierId) : null,
          price: formData.price ? parseFloat(formData.price) : 0
      };

      const res = await fetch(url, {
        method,
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        resetForm();
        fetchShipments();
      }
    } catch (error) {
       console.error(error);
    }
  };


  const handleDelete = async (id: number) => {
    if (!confirm(t('shipments.confirm_delete') || 'Are you sure?')) return;
    
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/shipments/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            fetchShipments();
        }
    } catch (error) {
        console.error(error);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/shipments/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            fetchShipments();
        }
    } catch (error) {
        console.error(error);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleRegisterPickup = async () => {
    if (selectedIds.length === 0) return;
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/shipments/pickup`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ ids: selectedIds, date: pickupDate })
        });
        
        if (res.ok) {
            alert(t('shipments.pickup_success'));
            setIsPickupModalOpen(false);
            setSelectedIds([]);
            fetchShipments(); // Refresh list
        } else {
             const data = await res.json();
             alert(data.message || 'Error');
        }
    } catch (error) {
        console.error(error);
    }
  };

  const startEdit = (shipment: Shipment) => {
    setEditingId(shipment.id);
    setFormData({
        customerId: shipment.customerId?.toString() || '',
        carrierId: (shipment as any).carrierId?.toString() || '',
        senderName: shipment.senderName || '',
        senderAddress: shipment.senderAddress || '',
        senderCity: (shipment as any).senderCity || '',
        senderZip: (shipment as any).senderZip || '',
        senderProvince: (shipment as any).senderProvince || '',
        senderCountry: (shipment as any).senderCountry || '',
        senderEmail: shipment.senderEmail || '',
        senderPhone: shipment.senderPhone || '',
        recipientName: shipment.recipientName,
        recipientAddress: shipment.recipientAddress,
        recipientCity: (shipment as any).recipientCity || '',
        recipientZip: (shipment as any).recipientZip || '',
        recipientProvince: (shipment as any).recipientProvince || '',
        recipientCountry: (shipment as any).recipientCountry || '',
        recipientEmail: shipment.recipientEmail || '',
        recipientPhone: shipment.recipientPhone || '',
        shippingAddress: (shipment as any).shippingAddress || '',
        weight: shipment.weight?.toString() || '',
        packages: shipment.packages.toString(),
        notes: shipment.notes || '',
        price: shipment.price?.toString() || ''
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
      setFormData({ 
        customerId: '',
        carrierId: '',
        senderName: '',
        senderAddress: '',
        senderCity: '',
        senderZip: '',
        senderProvince: '',
        senderCountry: '',
        senderEmail: '',
        senderPhone: '',
        recipientName: '', 
        recipientAddress: '', 
        recipientCity: '',
        recipientZip: '',
        recipientProvince: '',
        recipientCountry: '',
        recipientEmail: '', 
        recipientPhone: '', 
        shippingAddress: '',
        weight: '', 
        packages: '1', 
        notes: '',
        price: ''
      });
      setEditingId(null);
      setIsFormOpen(false);
  };

  useEffect(() => {
    fetchShipments();
    fetchCustomers();
    fetchCarriers();
  }, [page, searchTerm, statusFilter, carrierFilter]);

  // Server-side filtering is active
  const displayShipments = shipments;
  
  const pendingShipmentsOnPage = displayShipments.filter(s => s.status === 'PENDING');
  
  const toggleSelectAll = () => {
      const allSelected = pendingShipmentsOnPage.length > 0 && pendingShipmentsOnPage.every(s => selectedIds.includes(s.id));
      
      if (allSelected) {
          // Deselect all on this page
          const idsToDeselect = pendingShipmentsOnPage.map(s => s.id);
          setSelectedIds(prev => prev.filter(id => !idsToDeselect.includes(id)));
      } else {
          // Select all on this page
          const idsToSelect = pendingShipmentsOnPage.map(s => s.id);
          setSelectedIds(prev => {
              const newIds = [...prev];
              idsToSelect.forEach(id => {
                  if (!newIds.includes(id)) newIds.push(id);
              });
              return newIds;
          });
      }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800';
        case 'DELIVERED': return 'bg-green-100 text-green-800';
        case 'EXCEPTION': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
     return t(`shipments.status_${status.toLowerCase()}`) || status;
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('dashboard.menu.shipments')}</h1>
        <div className="flex gap-2">
            {selectedIds.length > 0 && (
                <Button onClick={() => setIsPickupModalOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
                    {t('shipments.register_pickup')} ({selectedIds.length})
                </Button>
            )}
            <Button onClick={() => isFormOpen ? resetForm() : setIsFormOpen(true)} variant={isFormOpen ? 'secondary' : 'primary'}>
              {isFormOpen ? t('customers.cancel') : t('shipments.new_shipment')}
            </Button>
        </div>
      </div>

      {!isFormOpen && (
        <div className="mb-6 bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('shipments.search_placeholder')}</label>
            <Input 
                placeholder={t('shipments.search_placeholder')}
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('shipments.status')}</label>
            <select 
                className="w-full border p-2 rounded"
                value={statusFilter}
                onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                }}
            >
                <option value="">{t('common.all')}</option>
                <option value="PENDING">PENDING</option>
                <option value="IN_TRANSIT">IN TRANSIT</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="EXCEPTION">EXCEPTION</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('shipments.select_carrier')}</label>
             <select 
                className="w-full border p-2 rounded"
                value={carrierFilter}
                onChange={(e) => {
                    setCarrierFilter(e.target.value);
                    setPage(1);
                }}
            >
                <option value="">{t('common.all')}</option>
                {carriers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="mb-6">
            <ShipmentForm 
                isEditing={!!editingId}
                customers={customers}
                carriers={carriers}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                onCancel={resetForm}
                onSenderChange={onSenderChange}
                onRecipientChange={onRecipientChange}
            />
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
             <p>{t('customers.loading')}</p>
        ) : displayShipments.length === 0 ? (
            <p className="text-gray-500">{t('shipments.no_shipments')}</p>
        ) : (
            <>
            {pendingShipmentsOnPage.length > 0 && (
                <div className="flex justify-between items-center px-1 mb-2">
                     <span className="text-xs text-gray-500 italic">
                        {t('shipments.status_pending')}: {pendingShipmentsOnPage.length}
                     </span>
                     <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors select-none">
                        <input 
                            type="checkbox"
                            checked={pendingShipmentsOnPage.every(s => selectedIds.includes(s.id))}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 accent-brand-600 cursor-pointer rounded border-gray-300"
                        />
                        <span className="text-sm font-semibold text-brand-700">
                            {t('shipments.select_all')}
                        </span>
                    </label>
                </div>
            )}

            {displayShipments.map((shipment) => (
                <ShipmentCard
                    key={shipment.id}
                    shipment={shipment}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
                    isSelected={selectedIds.includes(shipment.id)}
                    onToggleSelect={toggleSelection}
                />
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

      {isPickupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{t('shipments.confirm_pickup')}</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('shipments.pickup_date')}
                    </label>
                    <Input 
                        type="datetime-local" 
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsPickupModalOpen(false)}>
                        {t('customers.cancel')}
                    </Button>
                    <Button onClick={handleRegisterPickup}>
                        {t('shipments.confirm_pickup')}
                    </Button>
                </div>
            </div>
        </div>
      )}
    </DashboardLayout>
  );
}
