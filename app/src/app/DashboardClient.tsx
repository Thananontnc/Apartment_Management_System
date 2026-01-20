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
}

export default function DashboardClient({ stats, apartments }: DashboardClientProps) {
    const { t, lang } = useI18n();

    const currentMonthLabel = new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-GB', { month: 'long', year: 'numeric' }).format(new Date());

    return (
        <main className="container animate-fade-in" style={{ paddingBottom: '8rem' }}>
            {/* Header Section */}
            <header className="flex-between" style={{ padding: '80px 0 60px 0' }}>
                <div>
                    <h1 className="text-gradient" style={{ marginBottom: '16px', letterSpacing: '-0.05em' }}>{t('dashboard')}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '500' }}>{t('welcome')}</p>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link href="/apartments" className="btn btn-primary" style={{ padding: '16px 36px' }}>
                        <span style={{ fontSize: '1.2rem' }}>+</span> {t('add_property')}
                    </Link>
                    <button onClick={() => signOut()} className="btn btn-secondary" style={{ padding: '16px 28px' }}>
                        {t('logout')}
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <section className="grid-dashboard">
                <div className="glass-card hover-effect" style={{ borderTop: '4px solid var(--primary)' }}>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800' }}>{t('projected_revenue')}</h3>
                    <div style={{ fontSize: '3rem', fontWeight: '900', marginTop: '20px', color: 'var(--text-dark)', letterSpacing: '-0.04em' }}>฿{stats.projectedRevenue.toLocaleString()}</div>
                    <div className="badge blue" style={{ marginTop: '20px' }}>
                        {t('target_for')} {currentMonthLabel}
                    </div>
                </div>

                <div className="glass-card hover-effect" style={{ borderTop: '4px solid var(--success)' }}>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800' }}>{t('net_profit')}</h3>
                    <div style={{ fontSize: '3rem', fontWeight: '900', marginTop: '20px', color: 'var(--success)', letterSpacing: '-0.04em' }}>฿{stats.netProfit.toLocaleString()}</div>
                    <div className="badge green" style={{ marginTop: '20px' }}>
                        {t('net_cash_flow')}
                    </div>
                </div>

                <div className="glass-card hover-effect" style={{ borderTop: '4px solid var(--warning)' }}>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800' }}>{t('collection_rate')}</h3>
                    <div style={{ fontSize: '3rem', fontWeight: '900', marginTop: '20px', color: stats.collectionRate > 90 ? 'var(--success)' : 'var(--warning)', letterSpacing: '-0.04em' }}>{stats.collectionRate}%</div>
                    {stats.outstandingDebt > 0 ? (
                        <div className="badge red" style={{ marginTop: '20px' }}>
                            ฿{stats.outstandingDebt.toLocaleString()} {t('pending')}
                        </div>
                    ) : (
                        <div className="badge green" style={{ marginTop: '20px' }}>{t('fully_collected')}</div>
                    )}
                </div>

                <div className="glass-card hover-effect" style={{ borderTop: '4px solid var(--blue)' }}>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800' }}>{t('occupancy_rate')}</h3>
                    <div style={{ fontSize: '3rem', fontWeight: '900', marginTop: '20px', color: 'var(--text-dark)', letterSpacing: '-0.04em' }}>{stats.occupancyRate}%</div>
                    <div className="badge blue" style={{ marginTop: '20px' }}>
                        {stats.occupiedRooms} / {stats.totalRooms} {t('rooms')}
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section style={{ marginTop: '100px' }}>
                <h2 className="text-gradient" style={{ marginBottom: '40px' }}>{t('quick_actions')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                    <Link href="/utilities" className="glass-card hover-effect" style={{ textDecoration: 'none', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>⚡</div>
                        <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>{t('utility_manager')}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{t('record_meters_desc')}</p>
                    </Link>
                    <Link href="/billing" className="glass-card hover-effect" style={{ textDecoration: 'none', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>💰</div>
                        <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>{t('billing_payments')}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{t('mark_paid_desc')}</p>
                    </Link>
                    <Link href="/finance" className="glass-card hover-effect" style={{ textDecoration: 'none', border: '1px solid var(--primary-glow)', background: 'linear-gradient(135deg, var(--glass-bg), rgba(var(--primary-rgb), 0.05))', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>📈</div>
                        <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>{t('finance')}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{t('finance_desc')}</p>
                    </Link>
                    <Link href="/apartments" className="glass-card hover-effect" style={{ textDecoration: 'none', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🏢</div>
                        <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>{t('properties')}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{t('property_mgmt_desc')}</p>
                    </Link>
                </div>
            </section>

            {/* Property Overview */}
            <section style={{ marginTop: '100px' }}>
                <div className="flex-between" style={{ marginBottom: '48px' }}>
                    <h2 className="text-gradient">{t('property_overview')}</h2>
                    <Link href="/apartments" className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>{t('view_all_properties')} →</Link>
                </div>

                {apartments.length === 0 ? (
                    <div className="card" style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)', borderStyle: 'dashed', borderWidth: '2px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🏢</div>
                        <p style={{ fontSize: '1.2rem', marginBottom: '24px' }}>{t('no_properties_found')}</p>
                        <Link href="/apartments" className="btn btn-primary">{t('add_property')}</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '64px' }}>
                        {apartments.map((apt) => (
                            <div key={apt.id} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ padding: '40px', borderBottom: '1px solid var(--border-subtle)', background: 'linear-gradient(90deg, var(--bg-panel), transparent)' }}>
                                    <div className="flex-between">
                                        <div>
                                            <h3 style={{ fontSize: '2.25rem', marginBottom: '8px' }}>{apt.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                                <span>📍</span> {apt.address}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px' }}>
                                            <Link href={`/apartments/${apt.id}/invoices`} className="btn btn-secondary">
                                                📜 {t('history')}
                                            </Link>
                                            <Link href={`/apartments/${apt.id}`} className="btn btn-secondary">
                                                ⚙️ {t('manage')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '40px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
                                        {apt.rooms.length === 0 ? (
                                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.1)', borderRadius: '16px' }}>
                                                {t('no_rooms_added')}
                                            </div>
                                        ) : (
                                            [...apt.rooms]
                                                .sort((a: any, b: any) => {
                                                    const numA = parseInt(a.roomNumber.replace(/\D/g, '')) || 0;
                                                    const numB = parseInt(b.roomNumber.replace(/\D/g, '')) || 0;
                                                    return numA - numB;
                                                })
                                                .map((room: any) => (
                                                    <div key={room.id} className="card hover-effect" style={{ padding: '24px', background: 'var(--bg-app)' }}>
                                                        <div className="flex-between" style={{ alignItems: 'center', marginBottom: '20px' }}>
                                                            <span style={{ fontWeight: '800', fontSize: '1.5rem', color: 'var(--text-dark)' }}>{room.roomNumber}</span>
                                                            <span className={`badge ${room.status === 'OCCUPIED' ? 'green' :
                                                                    room.status === 'VACANT' ? 'red' :
                                                                        room.status === 'MAINTENANCE' ? 'yellow' : 'blue'
                                                                }`} style={{ fontSize: '0.65rem' }}>
                                                                {t(room.status.toLowerCase())}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: '700' }}>
                                                            ฿{room.baseRent.toLocaleString()}
                                                        </div>
                                                    </div>
                                                ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
