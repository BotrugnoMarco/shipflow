import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTranslation } from '../../hooks/useTranslation';

export interface Customer {
    id: number;
    name: string;
    address?: string;
    city?: string;
    zipCode?: string;
    province?: string;
    country?: string;
    email?: string;
    phone?: string;
}

export interface Carrier {
    id: number;
    name: string;
    code?: string;
    basePrice?: number;
    pricePerKg?: number;
}

export interface ShipmentFormData {
    customerId: string;
    carrierId: string;
    senderName: string;
    senderAddress: string;
    senderCity: string;
    senderZip: string;
    senderProvince: string;
    senderCountry: string;
    senderEmail: string;
    senderPhone: string;
    recipientName: string;
    recipientAddress: string;
    recipientCity: string;
    recipientZip: string;
    recipientProvince: string;
    recipientCountry: string;
    recipientEmail: string;
    recipientPhone: string;
    shippingAddress: string;
    weight: string;
    packages: string;
    notes: string;
    price: string;
}

interface ShipmentFormProps {
    isEditing: boolean;
    customers: Customer[];
    carriers: Carrier[];
    formData: ShipmentFormData;
    setFormData: (data: ShipmentFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    onSenderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onRecipientChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const ShipmentForm: React.FC<ShipmentFormProps> = ({
    isEditing,
    customers,
    carriers,
    formData,
    setFormData,
    onSubmit,
    onCancel,
    onSenderChange,
    onRecipientChange
}) => {
    const { t } = useTranslation();

    // Calculate estimated price
    const selectedCarrier = carriers.find(c => c.id.toString() === formData.carrierId);
    let estimatedPrice = 0;
    if (selectedCarrier && formData.weight) {
        const weight = parseFloat(formData.weight);
        if (!isNaN(weight)) {
            estimatedPrice = (selectedCarrier.basePrice || 0) + ((selectedCarrier.pricePerKg || 0) * weight);
        }
    }

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{isEditing ? t('shipments.edit_shipment') : t('shipments.new_shipment')}</h2>
                {estimatedPrice > 0 && (
                     <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold border border-green-200 shadow-sm animate-pulse">
                        💰 Totale Stimato: €{estimatedPrice.toFixed(2)}
                    </div>
                )}
            </div>
            
            <form onSubmit={onSubmit} className="space-y-6">
                
                {/* --- SENDER SECTION --- */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b flex items-center gap-2">
                            📤 {t('shipments.section_sender')}
                    </h3>
                    
                    <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-1">{t('shipments.select_customer')}</label>
                            <select 
                            className="w-full px-3 py-2 border rounded-md text-sm bg-gray-50 focus:ring-2 focus:ring-brand-500 outline-none"
                            onChange={onSenderChange}
                            defaultValue=""
                        >
                            <option value="">-- {t('shipments.select_customer')} --</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <Input 
                            label={t('shipments.sender_name')} 
                            value={formData.senderName}
                            onChange={(e) => setFormData({...formData, senderName: e.target.value})}
                            required
                        />
                        <Input 
                            label={t('shipments.sender_phone')} 
                            value={formData.senderPhone}
                            onChange={(e) => setFormData({...formData, senderPhone: e.target.value})}
                        />
                    </div>
                    
                    <div className="mb-3">
                        <Input 
                            label={t('shipments.sender_address')} 
                            value={formData.senderAddress}
                            onChange={(e) => setFormData({...formData, senderAddress: e.target.value})}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <Input 
                            label={t('shipments.city') || "Città"}
                            value={formData.senderCity || ''}
                            onChange={(e) => setFormData({...formData, senderCity: e.target.value})}
                        />
                         <Input 
                            label={t('shipments.zip') || "CAP"}
                            value={formData.senderZip || ''}
                            onChange={(e) => setFormData({...formData, senderZip: e.target.value})}
                        />
                         <Input 
                            label={t('shipments.province') || "Provincia"}
                            value={formData.senderProvince || ''}
                            onChange={(e) => setFormData({...formData, senderProvince: e.target.value})}
                        />
                         <Input 
                            label={t('shipments.country') || "Paese"}
                            value={formData.senderCountry || ''}
                            onChange={(e) => setFormData({...formData, senderCountry: e.target.value})}
                        />
                    </div>

                    <div>
                        <Input 
                            label={t('shipments.sender_email')} 
                            type="email"
                            value={formData.senderEmail}
                            onChange={(e) => setFormData({...formData, senderEmail: e.target.value})}
                        />
                    </div>
                </div>

                {/* --- RECIPIENT SECTION --- */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b flex items-center gap-2">
                            📥 {t('shipments.section_recipient')}
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-1">{t('shipments.select_customer')}</label>
                            <select 
                            className="w-full px-3 py-2 border rounded-md text-sm bg-gray-50 focus:ring-2 focus:ring-brand-500 outline-none"
                            onChange={onRecipientChange}
                            defaultValue=""
                        >
                            <option value="">-- {t('shipments.select_customer')} --</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <Input 
                                label={t('shipments.recipient_name')}  
                                value={formData.recipientName}
                                onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                                required
                            />
                            <Input 
                                label={t('shipments.recipient_phone')} 
                                value={formData.recipientPhone}
                                onChange={(e) => setFormData({...formData, recipientPhone: e.target.value})}
                            />
                    </div>

                    <div className="mb-3">
                        <Input 
                            label={t('shipments.recipient_address')}
                            value={formData.recipientAddress}
                            onChange={(e) => setFormData({...formData, recipientAddress: e.target.value})}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <Input 
                            label={t('shipments.city') || "Città"}
                            value={formData.recipientCity || ''}
                            onChange={(e) => setFormData({...formData, recipientCity: e.target.value})}
                        />
                         <Input 
                            label={t('shipments.zip') || "CAP"}
                            value={formData.recipientZip || ''}
                            onChange={(e) => setFormData({...formData, recipientZip: e.target.value})}
                        />
                         <Input 
                            label={t('shipments.province') || "Provincia"}
                            value={formData.recipientProvince || ''}
                            onChange={(e) => setFormData({...formData, recipientProvince: e.target.value})}
                        />
                         <Input 
                            label={t('shipments.country') || "Paese"}
                            value={formData.recipientCountry || ''}
                            onChange={(e) => setFormData({...formData, recipientCountry: e.target.value})}
                        />
                    </div>

                    <div>
                            <Input 
                                label={t('shipments.recipient_email')} 
                                type="email"
                                value={formData.recipientEmail}
                                onChange={(e) => setFormData({...formData, recipientEmail: e.target.value})}
                            />
                    </div>

                    <div className="mt-4">
                        <Input 
                            label={t('shipments.shipping_address') || "Indirizzo Spedizione (se diverso)"}
                            value={formData.shippingAddress}
                            onChange={(e) => setFormData({...formData, shippingAddress: e.target.value})}
                            placeholder={t('shipments.shipping_address_placeholder')}
                        />
                    </div>
                </div>

                {/* --- PACKAGE SECTION --- */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b flex items-center gap-2">
                            📦 {t('shipments.section_package')}
                    </h3>
                    
                    <div className="mb-4">
                             <label className="block text-gray-700 text-sm font-bold mb-1">{t('shipments.select_carrier')}</label>
                             <select 
                                className="w-full px-3 py-2 border rounded-md text-sm bg-gray-50 focus:ring-2 focus:ring-brand-500 outline-none"
                                value={formData.carrierId}
                                onChange={(e) => setFormData({...formData, carrierId: e.target.value})}
                            >
                                <option value="">-- {t('shipments.select_carrier')} --</option>
                                {carriers.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.basePrice ? `(Base €${c.basePrice})` : ''}
                                    </option>
                                ))}
                            </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Input 
                            label={t('shipments.weight')} 
                            type="number"
                            step="0.1"
                            value={formData.weight}
                            onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        />
                        <Input 
                            label={t('shipments.packages')} 
                            type="number"
                            min="1"
                            value={formData.packages}
                            onChange={(e) => setFormData({...formData, packages: e.target.value})}
                            required
                        />
                        <Input 
                            label={t('shipments.price') || "Prezzo (€)"} 
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={estimatedPrice > 0 ? estimatedPrice.toFixed(2) : "0.00"}
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                        />
                    </div>
                    
                    <div className="mb-4">
                        <Input 
                            label={t('shipments.notes')} 
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>{t('customers.cancel')}</Button>
                    <Button type="submit">{isEditing ? t('customers.update') : t('customers.save')}</Button>
                </div>
            </form>
        </Card>
    );
};
