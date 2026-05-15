import React from 'react';
import { Card } from '../ui/Card';
import { useTranslation } from '../../hooks/useTranslation';

export interface Shipment {
    id: number;
    trackingNumber: string;
    status: string;
    senderName?: string;
    senderAddress?: string;
    senderCity?: string;
    senderZip?: string;
    senderProvince?: string;
    senderCountry?: string;
    senderEmail?: string;
    senderPhone?: string;
    customerId?: number;
    recipientName: string;
    recipientAddress: string;
    recipientCity?: string;
    recipientZip?: string;
    recipientProvince?: string;
    recipientCountry?: string;
    recipientEmail?: string;
    recipientPhone?: string;
    shippingAddress?: string;
    weight?: number;
    packages: number;
    notes?: string;
    createdAt: string;
    price?: number;
    carrierId?: number;
    carrier?: {
        name: string;
    };
}

interface ShipmentCardProps {
    shipment: Shipment;
    onEdit: (shipment: Shipment) => void;
    onDelete: (id: number) => void;
    onStatusChange?: (id: number, newStatus: string) => void;
    getStatusColor: (status: string) => string;
    getStatusLabel: (status: string) => string;
    isSelected?: boolean;
    onToggleSelect?: (id: number) => void;
}

export const ShipmentCard: React.FC<ShipmentCardProps> = ({
    shipment,
    onEdit,
    onDelete,
    onStatusChange,
    getStatusColor,
    getStatusLabel,
    isSelected,
    onToggleSelect
}) => {
    const { t } = useTranslation();

    const showCheckbox = shipment.status === 'PENDING' && onToggleSelect;

    return (
        <Card className={`${isSelected ? 'border-2 border-brand-500 bg-brand-50' : ''} transition-all !p-3`}>
            <div className="flex gap-3 items-center">
                {/* Selection Checkbox - Always visible on left if active */}
                {showCheckbox && (
                    <div className="shrink-0 pl-1">
                        <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => onToggleSelect(shipment.id)}
                            className="w-5 h-5 cursor-pointer accent-brand-600 border-gray-300 rounded focus:ring-brand-500"
                        />
                    </div>
                )}
                
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                    
                    {/* Header Row: Tracking | Status | Date | Carrier | Price */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b pb-2 border-gray-200">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm font-bold border border-gray-300 text-gray-700">
                            #{shipment.trackingNumber}
                        </span>
                        
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${getStatusColor(shipment.status)}`}>
                            {getStatusLabel(shipment.status)}
                        </span>

                        <span className="text-xs text-gray-500">
                            {new Date(shipment.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-3 ml-auto">
                            {shipment.carrier && (
                                <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold flex items-center gap-1">
                                    🚚 {shipment.carrier.name}
                                </span>
                            )}
                            
                            {shipment.price !== undefined && shipment.price > 0 && (
                                <span className="text-sm font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                    €{shipment.price.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        
                        {/* Route: From -> To (Span 6) */}
                        <div className="md:col-span-6 flex flex-col gap-3">
                             {/* Sender */}
                             <div className="flex items-start gap-2 min-w-0">
                                 <span className="text-[10px] uppercase font-bold text-gray-400 w-8 shrink-0 text-right mt-0.5">From</span>
                                 <div className="min-w-0 flex-1">
                                     <div className="text-sm font-semibold text-gray-700 truncate leading-tight" title={shipment.senderName}>
                                        {shipment.senderName || t('common.na')}
                                     </div>
                                     <div className="text-xs text-gray-500">
                                        <div className="truncate" title={shipment.senderAddress}>{shipment.senderAddress}</div>
                                        {(shipment.senderCity || shipment.senderZip) && (
                                            <div className="truncate text-[10px] text-gray-400">
                                                {[shipment.senderZip, shipment.senderCity, shipment.senderProvince ? `(${shipment.senderProvince})` : '', shipment.senderCountry].filter(Boolean).join(' ')}
                                            </div>
                                        )}
                                     </div>
                                 </div>
                             </div>

                             {/* Recipient */}
                             <div className="flex items-start gap-2 min-w-0">
                                 <span className="text-[10px] uppercase font-bold text-gray-400 w-8 shrink-0 text-right mt-0.5">To</span>
                                 <div className="min-w-0 flex-1">
                                     <div className="text-base font-bold text-gray-900 truncate leading-tight" title={shipment.recipientName}>
                                        {shipment.recipientName}
                                     </div>
                                     <div className="text-xs text-gray-600 font-medium">
                                        <div className="truncate" title={shipment.shippingAddress || shipment.recipientAddress}>
                                            📍 {shipment.shippingAddress || shipment.recipientAddress}
                                        </div>
                                        {/* Show structured address info only if we are using recipient address (no custom shipping override) */}
                                        {!shipment.shippingAddress && (shipment.recipientCity || shipment.recipientZip) && (
                                            <div className="truncate text-[10px] text-gray-500 ml-4">
                                                {[shipment.recipientZip, shipment.recipientCity, shipment.recipientProvince ? `(${shipment.recipientProvince})` : '', shipment.recipientCountry].filter(Boolean).join(' ')}
                                            </div>
                                        )}
                                     </div>
                                     {/* Show billing address if different from shipping */}
                                     {shipment.shippingAddress && shipment.shippingAddress !== shipment.recipientAddress && (
                                         <div className="text-[10px] text-gray-400 truncate mt-0.5">
                                             📝 Billing: {shipment.recipientAddress}
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>

                        {/* Logistics info (Span 3) */}
                        <div className="md:col-span-3 flex md:flex-col flex-row gap-3 md:gap-1 text-sm text-gray-600 md:border-l md:pl-4 border-gray-100">
                            <span className="flex items-center gap-2" title="Packages">
                                📦 <span className="font-medium">{shipment.packages}</span> <span className="text-xs text-gray-400">pkg</span>
                            </span>
                            {shipment.weight && (
                                <span className="flex items-center gap-2" title="Weight">
                                    ⚖️ <span className="font-medium">{shipment.weight}</span> <span className="text-xs text-gray-400">kg</span>
                                </span>
                            )}
                        </div>

                        {/* Action Buttons (Span 3) */}
                        <div className="md:col-span-3 flex justify-end items-center gap-2">
                            
                            {/* Revert Actions */}
                            {onStatusChange && shipment.status === 'IN_TRANSIT' && (
                                <button 
                                    onClick={() => onStatusChange(shipment.id, 'PENDING')} 
                                    className="p-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 rounded-md transition-all shadow-sm"
                                    title={t('shipments.status_pending')}
                                >
                                    ↩️
                                </button>
                            )}

                            {onStatusChange && shipment.status === 'DELIVERED' && (
                                <button 
                                    onClick={() => onStatusChange(shipment.id, 'IN_TRANSIT')} 
                                    className="p-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 rounded-md transition-all shadow-sm"
                                    title={t('shipments.status_in_transit')}
                                >
                                    ↩️
                                </button>
                            )}

                            {/* Advance Actions */}
                            {onStatusChange && shipment.status === 'IN_TRANSIT' && (
                                <button 
                                    onClick={() => onStatusChange(shipment.id, 'DELIVERED')} 
                                    className="p-2 bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 rounded-md transition-all shadow-sm"
                                    title={t('shipments.mark_delivered')}
                                >
                                    ✅
                                </button>
                            )}
                            
                            <div className="flex bg-gray-50 rounded-md border border-gray-200 p-0.5">
                                <button 
                                    onClick={() => onEdit(shipment)} 
                                    className="p-1.5 text-blue-600 hover:bg-white hover:shadow-sm rounded transition-all" 
                                    title={t('customers.edit')}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                </button>
                                <div className="w-px bg-gray-200 my-1"></div>
                                <button 
                                    onClick={() => onDelete(shipment.id)} 
                                    className="p-1.5 text-red-600 hover:bg-white hover:shadow-sm rounded transition-all" 
                                    title={t('customers.delete')}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
