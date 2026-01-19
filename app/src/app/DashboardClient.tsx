'use client';

import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { signOut } from 'next-auth/react';

interface DashboardClientProps {
    stats: {
        totalApartments: number;
        totalRooms: number;
        occupiedRooms: number;
        projectedRevenue: number;
        netProfit: number;
        occupancyRate: number;
        collectionRate: number;
        outstandingDebt: number;
    };
    apartments: any[];
    currentMonthName: string;
}

export default function DashboardClient({ stats, apartments, currentMonthName }: DashboardClientProps) {
    const { t } = useI18n();

    return (
        <main className="container animate-fade-in" style={{ paddingBottom: '6rem' }}>
            {/* Header Section */}
            <header className="flex-between" style={{ padding: '60px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                    <h1 className="text-gradient" style={{ marginBottom: '12px' }}>{t('dashboard')}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t('welcome')}</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Link href="/apartments" className="btn btn-primary">
                        + {t('add_property')}
                    </Link>
                    <button onClick={() => signOut()} className="btn btn-secondary">
                        {t('logout')}
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <section className="grid-dashboard">
                <div className="glass-card hover-effect">
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('projected_revenue')}</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '16px', color: 'var(--text-dark)' }}>฿{stats.projectedRevenue.toLocaleString()}</div>
                    <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Invoiced/Target for {currentMonthName}
                    </div>
                </div>

                <div className="glass-card hover-effect" style={{ borderLeft: '4px solid var(--success)' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('net_profit')}</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '16px', color: 'var(--success)' }}>฿{stats.netProfit.toLocaleString()}</div>
                    <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Net Cash flow
                    </div>
                </div>

                <div className="glass-card hover-effect">
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text_muted)', textTransform: 'uppercase' }}>{t('collection_rate')}</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '16px', color: stats.collectionRate > 90 ? 'var(--success)' : 'var(--warning)' }}>{stats.collectionRate}%</div>
                    {stats.outstandingDebt > 0 && (
                        <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--danger)', fontWeight: '600' }}>
                            ฿{stats.outstandingDebt.toLocaleString()} Pending
                        </div>
                    )}
                </div>

                <div className="glass-card hover-effect">
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('occupancy_rate')}</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '16px', color: 'var(--text-dark)' }}>{stats.occupancyRate}%</div>
                    <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {stats.occupiedRooms} / {stats.totalRooms} {t('rooms')}
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section style={{ marginTop: '64px' }}>
                <h2 style={{ marginBottom: '32px' }}>{t('quick_actions')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                    <Link href="/utilities" className="glass-card hover-effect" style={{ textDecoration: 'none' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⚡</div>
                        <h3 style={{ marginBottom: '8px' }}>{t('utility_manager')}</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Record meters and generate monthly bills.</p>
                    </Link>
                    <Link href="/billing" className="glass-card hover-effect" style={{ textDecoration: 'none' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>💰</div>
                        <h3 style={{ marginBottom: '8px' }}>{t('billing_payments')}</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Manage collections and unpaid invoices.</p>
                    </Link>
                    <Link href="/finance" className="glass-card hover-effect" style={{ textDecoration: 'none', border: '1px solid var(--primary)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📈</div>
                        <h3 style={{ marginBottom: '8px' }}>{t('finance')}</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Analyze profit, mortgage, and operational costs.</p>
                    </Link>
                    <Link href="/apartments" className="glass-card hover-effect" style={{ textDecoration: 'none' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📜</div>
                        <h3 style={{ marginBottom: '8px' }}>History & Invoices</h3>
                        <p style={{ color: 'var(--text-muted)' }}>View past bills and download/print monthly receipts.</p>
                    </Link>
                    <Link href="/apartments" className="glass-card hover-effect" style={{ textDecoration: 'none' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🏢</div>
                        <h3 style={{ marginBottom: '8px' }}>{t('properties')}</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Manage building data and room prices.</p>
                    </Link>
                </div>
            </section>

            {/* Property Overview */}
            <section style={{ marginTop: '64px' }}>
                <h2 style={{ marginBottom: '40px' }}>{t('property_overview')}</h2>

                {apartments.length === 0 ? (
                    <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No properties found. <Link href="/apartments" className="text-primary" style={{ fontWeight: '600' }}>{t('add_property')}</Link>.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '48px' }}>
                        {apartments.map((apt) => (
                            <div key={apt.id} className="glass-card">
                                <div className="flex-between" style={{ marginBottom: '32px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '2rem' }}>{apt.name}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '4px' }}>{apt.address}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <Link href={`/apartments/${apt.id}/invoices`} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                                            📜 View History & Invoices
                                        </Link>
                                        <Link href={`/apartments/${apt.id}`} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                                            {t('edit_property_info')}
                                        </Link>
                                    </div>
                                </div>

                                {/* Rooms Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                    {apt.rooms.length === 0 ? (
                                        <div style={{ gridColumn: '1/-1', color: 'var(--text-muted)', fontStyle: 'italic', padding: '20px' }}>No rooms added yet.</div>
                                    ) : (
                                        apt.rooms.map((room: any) => (
                                            <div key={room.id} className="card hover-effect" style={{ padding: '20px', background: 'var(--bg-panel-transparent)' }}>
                                                <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>{room.roomNumber}</span>
                                                    <span className={`badge ${room.status === 'OCCUPIED' ? 'green' : 'red'}`}>
                                                        {t(room.status.toLowerCase())}
                                                    </span>
                                                </div>
                                                <div style={{ marginTop: '16px', fontSize: '1rem', color: 'var(--text-main)', fontWeight: '500' }}>
                                                    ฿{room.baseRent.toLocaleString()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
