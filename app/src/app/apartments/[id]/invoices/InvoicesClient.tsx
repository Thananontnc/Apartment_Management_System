'use client'

import React from 'react';
import BackButton from '@/components/BackButton';
import { useRouter } from 'next/navigation';

interface InvoiceProps {
    apartment: any;
    sortedRooms: any[];
    months: { value: string, label: string }[];
    currentMonth?: string;
}

export default function InvoicesClient({ apartment, sortedRooms, months, currentMonth }: InvoiceProps) {
    const today = new Date().toLocaleDateString('th-TH');
    const router = useRouter();

    const handlePrint = () => {
        window.print();
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val) {
            router.push(`?month=${val}`);
        } else {
            router.push('?');
        }
    };

    return (
        <main className="container animate-fade-in" style={{ paddingBottom: '6rem' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '24px' }}>
                <BackButton label="Back to Apartment" />
            </div>

            <header className="no-print" style={{ padding: '32px 0 60px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex-between">
                    <div>
                        <h1 className="text-gradient">Generated Invoices</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '8px' }}>Printing layout for {apartment.name}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        {months.length > 0 && (
                            <select
                                value={currentMonth || ''}
                                onChange={handleMonthChange}
                                style={{
                                    width: 'auto',
                                    padding: '12px 24px',
                                    background: 'var(--bg-app)',
                                    color: 'var(--text-dark)',
                                    border: '1px solid var(--primary)',
                                    fontWeight: '600',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            >
                                <option value="">Latest Records</option>
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        )}
                        <button
                            onClick={handlePrint}
                            className="btn btn-primary"
                            style={{ padding: '14px 32px' }}
                        >
                            <span>🖨️ Print All Invoices</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="invoice-grid" style={{
                marginTop: '48px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '32px'
            }}>
                {sortedRooms.map(room => {
                    const bill = room.readings[0];
                    if (!bill) return null;

                    const dateStr = new Date(bill.recordDate).toLocaleDateString('th-TH');

                    return (
                        <div key={room.id} className="invoice-card" style={{
                            background: '#fff',
                            border: '1px solid #ddd',
                            padding: '32px',
                            minHeight: '500px',
                            display: 'flex',
                            flexDirection: 'column',
                            fontSize: '14px',
                            color: '#000',
                            borderRadius: '4px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}>
                            {/* Receipt Header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '16px' }}>
                                <div><b style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase' }}>Room No.</b><br /><span style={{ fontSize: '20px', fontWeight: '800' }}>{room.roomNumber}</span></div>
                                <div style={{ textAlign: 'center' }}><b style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase' }}>Date</b><br />{dateStr}</div>
                                <div style={{ textAlign: 'right', fontSize: '11px', color: '#444' }}>{apartment.address || apartment.name}</div>
                            </div>

                            {/* Main Charges Table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #000' }}>
                                        <th style={{ textAlign: 'left', width: '50px', padding: '8px 0', fontSize: '11px', color: '#666' }}>QTY</th>
                                        <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '11px', color: '#666' }}>DESCRIPTION</th>
                                        <th style={{ textAlign: 'right', width: '80px', padding: '8px 0', fontSize: '11px', color: '#666' }}>UNIT price</th>
                                        <th style={{ textAlign: 'right', width: '80px', padding: '8px 0', fontSize: '11px', color: '#666' }}>AMOUNT (฿)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ height: '32px' }}>
                                        <td style={{ fontWeight: '600' }}>{bill.waterUsage.toFixed(0)}</td>
                                        <td>Water (น้ำประปา)</td>
                                        <td style={{ textAlign: 'right' }}>{apartment.defaultWaterPrice}</td>
                                        <td style={{ textAlign: 'right', fontWeight: '700' }}>{bill.waterCost.toLocaleString()}</td>
                                    </tr>
                                    <tr style={{ height: '32px' }}>
                                        <td style={{ fontWeight: '600' }}>{bill.elecUsage.toFixed(1)}</td>
                                        <td>Electricity (ไฟฟ้า)</td>
                                        <td style={{ textAlign: 'right' }}>{apartment.defaultElecPrice}</td>
                                        <td style={{ textAlign: 'right', fontWeight: '700' }}>{bill.elecCost.toLocaleString()}</td>
                                    </tr>
                                    <tr style={{ height: '32px' }}>
                                        <td style={{ fontWeight: '600' }}>1</td>
                                        <td>Rent (ค่าเช่าห้อง)</td>
                                        <td style={{ textAlign: 'right' }}>{bill.rentAmount.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', fontWeight: '700' }}>{bill.rentAmount.toLocaleString()}</td>
                                    </tr>
                                    <tr style={{ height: '32px' }}><td></td><td></td><td></td><td></td></tr>
                                    <tr style={{ height: '32px' }}><td></td><td></td><td></td><td></td></tr>
                                </tbody>
                            </table>

                            {/* Meter Details Section */}
                            <div style={{ marginTop: 'auto', borderTop: '1px dashed #ccc', paddingTop: '16px', background: '#f9f9f9', padding: '12px', borderRadius: '4px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', textAlign: 'center', marginBottom: '4px', fontSize: '10px', color: '#666', fontWeight: '600' }}>
                                    <div>METER READING</div>
                                    <div>NEW</div>
                                    <div>OLD</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', textAlign: 'center', height: '20px' }}>
                                    <div style={{ textAlign: 'left', fontWeight: '600' }}>Water</div>
                                    <div>{bill.waterMeter}</div>
                                    <div style={{ color: '#666' }}>{bill.waterMeterPrev}</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', textAlign: 'center', height: '20px' }}>
                                    <div style={{ textAlign: 'left', fontWeight: '600' }}>Electricity</div>
                                    <div>{bill.elecMeter}</div>
                                    <div style={{ color: '#666' }}>{bill.elecMeterPrev}</div>
                                </div>
                            </div>

                            {/* Total Area */}
                            <div style={{
                                marginTop: '24px',
                                borderTop: '3px double #000',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px 0'
                            }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Total Amount Due</span>
                                <span style={{ fontWeight: '900', fontSize: '24px' }}>
                                    ฿{bill.totalAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .invoice-grid { 
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important; 
                        gap: 0 !important; 
                        margin: 0 !important;
                    }
                    .invoice-card { 
                        border: 1px solid #ccc !important;
                        page-break-inside: avoid;
                        height: 148mm !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        border-radius: 0 !important;
                    }
                }
            `}</style>
        </main>
    );
}
