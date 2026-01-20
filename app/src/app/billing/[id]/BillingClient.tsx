'use client'

import React from 'react';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import PaymentAction from '@/features/billing/components/PaymentAction';
import { useRouter } from 'next/navigation';

interface BillingProps {
    apartment: any;
    sortedRooms: any[];
    months: { value: string, label: string }[];
    currentMonth?: string;
}

export default function BillingClient({ apartment, sortedRooms, months, currentMonth }: BillingProps) {
    const router = useRouter();

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
                <BackButton label="Property Overview" href="/billing" />
            </div>

            <header style={{ padding: '40px 0 60px 0' }}>
                <div className="flex-between flex-wrap gap-24">
                    <div>
                        <h1 className="text-gradient" style={{ marginBottom: '12px' }}>{apartment.name} Billing</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '500' }}>Manage receivables and track payment status for all rooms.</p>
                    </div>
                    <div className="no-print" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {currentMonth && (
                            <Link href={`/apartments/${apartment.id}/invoices?month=${currentMonth}`} className="btn btn-secondary hover-effect" style={{ borderRadius: '16px', background: 'var(--bg-panel)' }}>
                                <span style={{ marginRight: '8px' }}>📜</span> Print All Invoices
                            </Link>
                        )}
                        {months.length > 0 && (
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={currentMonth || ''}
                                    onChange={handleMonthChange}
                                    className="btn btn-secondary"
                                    style={{ width: '280px', borderRadius: '16px', background: 'var(--bg-panel)', textAlign: 'left' }}
                                >
                                    <option value="">Select Billing Cycle</option>
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {!currentMonth ? (
                <div className="glass-card flex-center animate-fade-in" style={{ marginTop: '40px', padding: '120px 40px', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--primary-subtle)' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '32px', filter: 'drop-shadow(0 0 20px var(--primary-glow))' }}>🗓️</div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '16px' }}>Ready to review payments?</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', textAlign: 'center', maxWidth: '500px' }}>Select an active billing cycle from the menu above to audit collection statuses for this property.</p>
                </div>
            ) : sortedRooms.length === 0 ? (
                <div className="glass-card flex-center animate-bounce-in" style={{ marginTop: '40px', padding: '120px 40px', flexDirection: 'column' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '32px' }}>⚡</div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '16px' }}>Readings Pending</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', textAlign: 'center', maxWidth: '500px', marginBottom: '40px' }}>It appears no meter readings have been committed for this period yet.</p>
                    <Link href={`/utilities/${apartment.id}?month=${currentMonth}`} className="btn btn-primary" style={{ padding: '18px 48px', borderRadius: '20px' }}>
                        Visit Meter Hub →
                    </Link>
                </div>
            ) : (
                <div className="glass-card animate-fade-in" style={{ marginTop: '40px', padding: '0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <th style={{ padding: '24px 32px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}>Room</th>
                                    <th style={{ padding: '24px 32px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}>Rent Portion</th>
                                    <th style={{ padding: '24px 32px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}>Utilities</th>
                                    <th style={{ padding: '24px 32px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}>Grand Total</th>
                                    <th style={{ padding: '24px 32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}>Status</th>
                                    <th style={{ padding: '24px 32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}>Collection Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedRooms.map(room => {
                                    const reading = room.readings[0];
                                    if (!reading) return null;
                                    return (
                                        <tr key={room.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '24px 32px' }}>
                                                <div style={{ fontWeight: '950', fontSize: '1.5rem', color: 'var(--text-dark)' }}>{room.roomNumber}</div>
                                            </td>
                                            <td style={{ padding: '24px 32px', textAlign: 'right', fontWeight: '600' }}>฿{reading.rentAmount.toLocaleString()}</td>
                                            <td style={{ padding: '24px 32px', textAlign: 'right', color: 'var(--primary)', fontWeight: '700' }}>฿{(reading.elecCost + reading.waterCost).toLocaleString()}</td>
                                            <td style={{ padding: '24px 32px', textAlign: 'right', fontWeight: '950', fontSize: '1.4rem', color: 'var(--text-dark)' }}>฿{reading.totalAmount.toLocaleString()}</td>
                                            <td style={{ padding: '24px 32px', textAlign: 'center' }}>
                                                <span className={`badge ${reading.isPaid ? 'green' : 'red'}`} style={{ padding: '12px 24px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: '800' }}>
                                                    {reading.isPaid ? 'PAID' : 'PENDING'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '24px 32px', textAlign: 'center' }}>
                                                <PaymentAction
                                                    reading={reading}
                                                    apartmentId={apartment.id}
                                                    roomNumber={room.roomNumber}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    );
}
