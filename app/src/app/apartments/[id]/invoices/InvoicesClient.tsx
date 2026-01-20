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
        <main className="container animate-fade-in" style={{ paddingBottom: '8rem' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '24px' }}>
                <BackButton label="Property Assets" href={`/apartments/${apartment.id}`} />
            </div>

            <header className="no-print" style={{ padding: '40px 0 60px 0' }}>
                <div className="flex-between flex-wrap gap-24">
                    <div>
                        <h1 className="text-gradient">Generated Invoices</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '500', marginTop: '8px' }}>Asset Portfolio: {apartment.name}</p>
                    </div>
                    <div className="no-print" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {months.length > 0 && (
                            <select
                                value={currentMonth || ''}
                                onChange={handleMonthChange}
                                className="btn btn-secondary"
                                style={{
                                    width: '240px',
                                    borderRadius: '16px',
                                    background: 'var(--bg-panel)',
                                    textAlign: 'left'
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
                            className="btn btn-primary hover-effect"
                            style={{ borderRadius: '16px', height: '56px', padding: '0 32px' }}
                        >
                            <span style={{ marginRight: '8px' }}>🖨️</span> Print Ledger
                        </button>
                    </div>
                </div>
            </header>

            <div className="invoice-grid" style={{
                marginTop: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                gap: '40px'
            }}>
                {sortedRooms.map(room => {
                    const bill = room.readings[0];
                    if (!bill) return null;

                    const dateStr = new Date(bill.recordDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    });

                    return (
                        <div key={room.id} className="invoice-card" style={{
                            background: '#fff',
                            border: '1px solid rgba(0,0,0,0.08)',
                            padding: '40px',
                            minHeight: '520px',
                            display: 'flex',
                            flexDirection: 'column',
                            fontSize: '14px',
                            color: '#000',
                            borderRadius: '24px',
                            boxShadow: 'var(--shadow-lg)'
                        }}>
                            {/* Receipt Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #1a1a1a', paddingBottom: '24px', marginBottom: '24px' }}>
                                <div>
                                    <b style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>UNIT DESIGNATION</b>
                                    <div style={{ fontSize: '32px', fontWeight: '950', color: '#1a1a1a' }}>{room.roomNumber}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <b style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>STATEMENT DATE</b>
                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>{dateStr}</div>
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px', maxWidth: '180px' }}>{apartment.address}</div>
                                </div>
                            </div>

                            {/* Main Charges Table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                        <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>QTY</th>
                                        <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>ITEM DESCRIPTION</th>
                                        <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>RATE</th>
                                        <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>SUBTOTAL (฿)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #f9f9f9' }}>
                                        <td style={{ padding: '16px 0', fontWeight: '700' }}>{bill.waterUsage.toFixed(0)}</td>
                                        <td style={{ padding: '16px 0' }}>Water Usage (น้ำประปา)</td>
                                        <td style={{ padding: '16px 0', textAlign: 'right' }}>{apartment.defaultWaterPrice}</td>
                                        <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: '800' }}>{bill.waterCost.toLocaleString()}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f9f9f9' }}>
                                        <td style={{ padding: '16px 0', fontWeight: '700' }}>{bill.elecUsage.toFixed(1)}</td>
                                        <td style={{ padding: '16px 0' }}>Electricity Usage (ไฟฟ้า)</td>
                                        <td style={{ padding: '16px 0', textAlign: 'right' }}>{apartment.defaultElecPrice}</td>
                                        <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: '800' }}>{bill.elecCost.toLocaleString()}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f9f9f9' }}>
                                        <td style={{ padding: '16px 0', fontWeight: '700' }}>1</td>
                                        <td style={{ padding: '16px 0' }}>Monthly Base Rent (ค่าเช่า)</td>
                                        <td style={{ padding: '16px 0', textAlign: 'right' }}>{bill.rentAmount.toLocaleString()}</td>
                                        <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: '800' }}>{bill.rentAmount.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Meter Details Section */}
                            <div style={{ marginTop: 'auto', background: '#fcfcfc', border: '1px solid #f0f0f0', padding: '20px', borderRadius: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', textAlign: 'center', marginBottom: '12px', fontSize: '10px', color: '#999', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <div style={{ textAlign: 'left' }}>METRICS AUDIT</div>
                                    <div>PRESENT</div>
                                    <div>PREVIOUS</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', textAlign: 'center', marginBottom: '8px' }}>
                                    <div style={{ textAlign: 'left', fontWeight: '700', fontSize: '13px' }}>Water Meter</div>
                                    <div style={{ fontWeight: '600' }}>{bill.waterMeter}</div>
                                    <div style={{ color: '#888' }}>{bill.waterMeterPrev}</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', textAlign: 'center' }}>
                                    <div style={{ textAlign: 'left', fontWeight: '700', fontSize: '13px' }}>Energy Meter</div>
                                    <div style={{ fontWeight: '600' }}>{bill.elecMeter}</div>
                                    <div style={{ color: '#888' }}>{bill.elecMeterPrev}</div>
                                </div>
                            </div>

                            {/* Total Area */}
                            <div style={{
                                marginTop: '32px',
                                borderTop: '2px dashed #1a1a1a',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '24px 0 0 0'
                            }}>
                                <span style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#1a1a1a' }}>GRAND TOTAL DUE</span>
                                <span style={{ fontWeight: '950', fontSize: '32px', color: '#1a1a1a' }}>
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
                    body { background: white !important; color: black !important; background-image: none !important; }
                    .container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .invoice-grid { 
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important; 
                        gap: 10px !important; 
                        margin: 0 !important;
                    }
                    .invoice-card { 
                        border: 1px solid #000 !important;
                        page-break-inside: avoid;
                        height: 138mm !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        border-radius: 0 !important;
                        padding: 20px !important;
                    }
                }
            `}</style>
        </main>
    );
}
