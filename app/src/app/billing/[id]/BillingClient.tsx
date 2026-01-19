'use client'

import React from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { markAsPaid } from '@/app/actions/billing';
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
        <main className="container animate-fade-in" style={{ paddingBottom: '6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '24px' }}>
                <BackButton label="Back to Selection" href="/billing" />
            </div>

            <header style={{ padding: '32px 0 60px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex-between">
                    <div>
                        <h1 className="text-gradient">Billing: {apartment.name}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '8px' }}>Manage monthly payments and status.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {currentMonth && (
                            <Link href={`/apartments/${apartment.id}/invoices?month=${currentMonth}`} className="btn btn-secondary">
                                📜 View & Print Invoices
                            </Link>
                        )}
                        {months.length > 0 && (
                            <select
                                value={currentMonth || ''}
                                onChange={handleMonthChange}
                                className="btn btn-secondary"
                                style={{ width: '250px' }}
                            >
                                <option value="">Select Month</option>
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            </header>

            {!currentMonth ? (
                <div className="card" style={{ marginTop: '48px', textAlign: 'center', padding: '80px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '24px' }}>🗓️</div>
                    <h2>Please select a month above</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Select a billing cycle to view payment status for all rooms.</p>
                </div>
            ) : sortedRooms.length === 0 ? (
                <div className="card" style={{ marginTop: '48px', textAlign: 'center', padding: '80px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '24px' }}>📝</div>
                    <h2>No data for this month</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Please record utility meters in the Utility Manager first.</p>
                </div>
            ) : (
                <div className="card" style={{ marginTop: '48px', padding: '0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--bg-panel)' }}>
                            <tr>
                                <th style={{ padding: '20px', textAlign: 'left' }}>Room</th>
                                <th style={{ padding: '20px', textAlign: 'right' }}>Rent</th>
                                <th style={{ padding: '20px', textAlign: 'right' }}>Utilities</th>
                                <th style={{ padding: '20px', textAlign: 'right' }}>Total Amount</th>
                                <th style={{ padding: '20px', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '20px', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRooms.map(room => {
                                const reading = room.readings[0];
                                if (!reading) return null;
                                return (
                                    <tr key={room.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <td style={{ padding: '20px', fontWeight: '700' }}>{room.roomNumber}</td>
                                        <td style={{ padding: '20px', textAlign: 'right' }}>฿{reading.rentAmount.toLocaleString()}</td>
                                        <td style={{ padding: '20px', textAlign: 'right' }}>฿{(reading.elecCost + reading.waterCost).toLocaleString()}</td>
                                        <td style={{ padding: '20px', textAlign: 'right', fontWeight: '800' }}>฿{reading.totalAmount.toLocaleString()}</td>
                                        <td style={{ padding: '20px', textAlign: 'center' }}>
                                            <span className={`badge ${reading.isPaid ? 'green' : 'red'}`}>
                                                {reading.isPaid ? 'PAID' : 'UNPAID'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px', textAlign: 'center' }}>
                                            {!reading.isPaid && (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <form action={markAsPaid}>
                                                        <input type="hidden" name="readingId" value={reading.id} />
                                                        <input type="hidden" name="apartmentId" value={apartment.id} />
                                                        <input type="hidden" name="paymentMethod" value="CASH" />
                                                        <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Cash</button>
                                                    </form>
                                                    <form action={markAsPaid} onSubmit={(e) => {
                                                        if (!confirm('Mark as Paid via QR Code?')) e.preventDefault();
                                                    }}>
                                                        <input type="hidden" name="readingId" value={reading.id} />
                                                        <input type="hidden" name="apartmentId" value={apartment.id} />
                                                        <input type="hidden" name="paymentMethod" value="QR" />
                                                        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>QR</button>
                                                    </form>
                                                </div>
                                            )}
                                            {reading.isPaid && (
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    {reading.paymentMethod} - {new Date(reading.paymentDate!).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
