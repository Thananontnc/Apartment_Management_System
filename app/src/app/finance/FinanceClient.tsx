'use client'

import React, { useState } from 'react';
import { useI18n } from '@/providers/I18nProvider';
import BackButton from '@/components/ui/BackButton';
import { updateMortgage, addExpense, deleteExpense } from '@/app/actions/finance';
import { createMaintenance, updateMaintenanceStatus, deleteMaintenance } from '@/app/actions/maintenance';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Legend
} from 'recharts';

interface FinanceClientProps {
    apartments: any[];
}

const COLORS = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

export default function FinanceClient({ apartments }: FinanceClientProps) {
    const { t, lang } = useI18n();
    const [selectedApartmentId, setSelectedApartmentId] = useState(apartments[0]?.id || '');
    const [activeTab, setActiveTab] = useState('overview');

    const selectedApartment = apartments.find(apt => apt.id === selectedApartmentId);

    // CURRENT MONTH DATA
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    const readingForCurrentMonth = selectedApartment?.historicalRevenue?.find((r: any) => r.month === currentMonthKey);

    // REVENUE: Prefer actual Invoiced total, fallback to projected base rent
    const projectedRevenue = readingForCurrentMonth?.total || selectedApartment?.rooms.reduce((acc: number, room: any) => acc + room.baseRent, 0) || 0;

    const monthlyMortgage = selectedApartment?.mortgage?.monthlyPayment || 0;
    const monthlyExpenses = selectedApartment?.expenses
        .filter((e: any) => e.recordMonth.toISOString().startsWith(currentMonthKey))
        .reduce((acc: number, exp: any) => acc + exp.amount, 0) || 0;
    const monthlyMaintenance = selectedApartment?.maintenance
        .filter((m: any) => m.recordDate.toISOString().startsWith(currentMonthKey))
        .reduce((acc: number, maint: any) => acc + maint.cost, 0) || 0;

    const totalOutflow = monthlyMortgage + monthlyExpenses + monthlyMaintenance;
    const netProfit = projectedRevenue - totalOutflow;

    // ANALYTICS: Trend Data (Last 12 Months)
    const trendData = (selectedApartment?.historicalRevenue || []).map((rev: any) => {
        const monthExpenses = (selectedApartment?.expenses || [])
            .filter((e: any) => e.recordMonth.toISOString().startsWith(rev.month))
            .reduce((acc: number, exp: any) => acc + exp.amount, 0);

        const monthMaintenance = (selectedApartment?.maintenance || [])
            .filter((m: any) => m.recordDate.toISOString().startsWith(rev.month))
            .reduce((acc: number, m: any) => acc + m.cost, 0);

        const totalOut = monthExpenses + monthMaintenance + (selectedApartment?.mortgage?.monthlyPayment || 0);

        return {
            name: new Date(rev.month).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { month: 'short' }),
            rawMonth: rev.month,
            revenue: rev.total,
            expenses: totalOut,
            profit: rev.total - totalOut,
            elec: rev.elec,
            water: rev.water,
            rent: rev.rent,
            elecUsage: rev.elecUsage,
            waterUsage: rev.waterUsage
        };
    }).sort((a: any, b: any) => a.rawMonth.localeCompare(b.rawMonth));

    // REVENUE COMPARISON DATA
    const revenueBreakdownData = trendData.map((d: any) => ({
        name: d.name,
        rent: d.rent,
        elec: d.elec,
        water: d.water
    }));

    // UTILITY ANALYTICS DATA
    const utilityUsageData = trendData.map((d: any) => ({
        name: d.name,
        elecUsage: d.elecUsage,
        waterUsage: d.waterUsage
    }));

    // OCCUPANCY DATA (Status history grouping)
    const statusHistory = selectedApartment?.roomStatusHistory || [];
    const occupancyStatsByMonth: { [key: string]: any } = {};

    statusHistory.forEach((h: any) => {
        const month = h.changeDate.toISOString().slice(0, 7);
        if (!occupancyStatsByMonth[month]) {
            occupancyStatsByMonth[month] = { month, moveIn: 0, moveOut: 0, maintenance: 0 };
        }
        if (h.newStatus === 'OCCUPIED') occupancyStatsByMonth[month].moveIn++;
        if (h.oldStatus === 'OCCUPIED' && h.newStatus === 'VACANT') occupancyStatsByMonth[month].moveOut++;
        if (h.newStatus === 'MAINTENANCE') occupancyStatsByMonth[month].maintenance++;
    });

    const occupancyTrend = Object.values(occupancyStatsByMonth)
        .sort((a: any, b: any) => a.month.localeCompare(b.month))
        .map(o => ({
            name: new Date(o.month).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { month: 'short' }),
            moveIn: o.moveIn,
            moveOut: o.moveOut,
            maintenance: o.maintenance
        }));

    return (
        <main className="container animate-fade-in" style={{ paddingBottom: '8rem' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '24px' }}>
                <BackButton label={t('back_to_dashboard')} href="/" />
            </div>

            <header style={{ padding: '40px 0 60px 0' }}>
                <div className="flex-between flex-wrap gap-24">
                    <div>
                        <h1 className="text-gradient" style={{ marginBottom: '12px' }}>{t('finance_analytics')}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '500' }}>{t('finance_subtitle')}</p>
                    </div>
                    <div className="no-print" style={{ width: '100%', maxWidth: '300px' }}>
                        <select
                            value={selectedApartmentId}
                            onChange={(e) => setSelectedApartmentId(e.target.value)}
                            className="btn btn-secondary"
                            style={{ width: '100%', background: 'var(--bg-panel)', textAlign: 'left', borderRadius: '16px' }}
                        >
                            {apartments.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {/* Premium Navigation Tabs */}
            <nav className="no-print glass-card" style={{
                marginTop: '12px',
                padding: '6px',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                borderRadius: '20px',
                scrollbarWidth: 'none',
                background: 'rgba(var(--primary-rgb), 0.03)',
                border: '1px solid var(--glass-border)'
            }}>
                {[
                    { id: 'overview', label: t('summary'), icon: '📊' },
                    { id: 'comparison', label: t('revenue_breakdown'), icon: '⚖️' },
                    { id: 'utilities', label: t('utility_trends'), icon: '⚡' },
                    { id: 'operations', label: t('occupancy_flow'), icon: '🔑' },
                    { id: 'maintenance', label: t('maintenance_hub'), icon: '🛠️' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn ${activeTab === tab.id ? 'btn-primary' : ''}`}
                        style={{
                            flex: '1',
                            minWidth: '180px',
                            borderRadius: '14px',
                            whiteSpace: 'nowrap',
                            padding: '12px 24px',
                            minHeight: '48px',
                            fontSize: '0.9rem',
                            background: activeTab === tab.id ? '' : 'transparent',
                            color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            boxShadow: activeTab === tab.id ? 'var(--shadow-glow)' : 'none'
                        }}
                    >
                        <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </nav>

            {/* Tab Contents */}
            <div style={{ marginTop: '40px' }}>

                {/* 1. Profit/Loss Overview */}
                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
                        {/* Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginBottom: '48px' }}>
                            <div className="glass-card hover-effect" style={{ padding: '32px', borderLeft: '5px solid var(--success)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('current_month_rev')}</p>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: '950', marginTop: '8px' }}>฿{projectedRevenue.toLocaleString()}</h2>
                                        <p style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: '700', marginTop: '4px' }}>{t('invoiced_projected')}</p>
                                    </div>
                                    <div style={{ fontSize: '2.5rem', opacity: 0.5 }}>💰</div>
                                </div>
                            </div>
                            <div className="glass-card hover-effect" style={{ padding: '32px', borderLeft: '5px solid var(--danger)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('monthly_outflow')}</p>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: '950', marginTop: '8px', color: 'var(--danger)' }}>฿{totalOutflow.toLocaleString()}</h2>
                                        <p style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '700', marginTop: '4px' }}>{t('mortgage_ops_fix')}</p>
                                    </div>
                                    <div style={{ fontSize: '2.5rem', opacity: 0.5 }}>📉</div>
                                </div>
                            </div>
                            <div className="glass-card hover-effect" style={{ padding: '32px', borderLeft: '5px solid var(--primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('est_net_profit')}</p>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: '950', marginTop: '8px', color: 'var(--primary)' }}>฿{netProfit.toLocaleString()}</h2>
                                        <p style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '700', marginTop: '4px' }}>{t('margin')}: {projectedRevenue > 0 ? ((netProfit / projectedRevenue) * 100).toFixed(1) : 0}%</p>
                                    </div>
                                    <div style={{ fontSize: '2.5rem', opacity: 0.5 }}>💎</div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Trends Chart */}
                        <div className="glass-card" style={{ padding: '48px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>{t('financial_trajectory')}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{t('evolution_desc')}</p>
                                </div>
                                <div className="badge blue" style={{ padding: '8px 16px' }}>{t('real_time_data')}</div>
                            </div>
                            <div style={{ height: '450px', width: '100%', marginTop: '20px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}
                                            tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'var(--bg-panel)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: '16px',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                                padding: '16px'
                                            }}
                                            itemStyle={{ fontWeight: 800 }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '32px' }} />
                                        <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={0} name={t('revenue')} strokeWidth={2} />
                                        <Area type="monotone" dataKey="expenses" stroke="var(--danger)" fillOpacity={0} name={t('expenses')} strokeWidth={2} />
                                        <Area
                                            type="monotone"
                                            dataKey="profit"
                                            stroke="var(--success)"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorProfit)"
                                            name={t('net_profit')}
                                            dot={{ r: 6, fill: 'var(--success)', strokeWidth: 2, stroke: '#fff' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Revenue Comparison */}
                {activeTab === 'comparison' && (
                    <div className="animate-fade-in">
                        <div className="glass-card" style={{ padding: '48px' }}>
                            <div style={{ marginBottom: '40px' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>{t('revenue_segmentation')}</h3>
                                <p style={{ color: 'var(--text-muted)' }}>{t('hist_breakdown_desc')}</p>
                            </div>
                            <div style={{ height: '400px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueBreakdownData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }} />
                                        <Legend wrapperStyle={{ paddingTop: '24px' }} />
                                        <Area type="monotone" dataKey="rent" stackId="1" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} name={t('room_rent')} />
                                        <Area type="monotone" dataKey="elec" stackId="1" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.4} name={t('elec')} />
                                        <Area type="monotone" dataKey="water" stackId="1" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.4} name={t('water')} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card" style={{ marginTop: '48px', padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '32px' }}>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '900' }}>{t('hist_ledgers')}</h4>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-app)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('month')}</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('rent')}</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('utilities')}</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('total')}</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>{t('growth')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trendData.slice().reverse().map((d: any, i: number, arr: any[]) => {
                                            const prev = arr[i + 1];
                                            const growth = prev ? ((d.revenue - prev.revenue) / prev.revenue * 100).toFixed(1) : '-';
                                            return (
                                                <tr key={d.name} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                    <td style={{ padding: '20px 32px', fontWeight: '800' }}>{d.name}</td>
                                                    <td style={{ padding: '20px 32px' }}>฿{d.rent.toLocaleString()}</td>
                                                    <td style={{ padding: '20px 32px' }}>฿{(d.elec + d.water).toLocaleString()}</td>
                                                    <td style={{ padding: '20px 32px', fontWeight: '900', color: 'var(--primary)' }}>฿{d.revenue.toLocaleString()}</td>
                                                    <td style={{ padding: '20px 32px', textAlign: 'right', fontWeight: '800', color: parseFloat(growth) > 0 ? 'var(--success)' : 'var(--danger)' }}>
                                                        {growth !== '-' ? `${parseFloat(growth) > 0 ? '+' : ''}${growth}%` : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Utility Analysis */}
                {activeTab === 'utilities' && (
                    <div className="animate-fade-in">
                        <div className="glass-card" style={{ padding: '48px' }}>
                            <div style={{ marginBottom: '40px' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>{t('meter_analysis')}</h3>
                                <p style={{ color: 'var(--text-muted)' }}>{t('resource_patterns')}</p>
                            </div>
                            <div style={{ height: '400px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={utilityUsageData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <YAxis yAxisId="left" hide />
                                        <YAxis yAxisId="right" hide />
                                        <Tooltip contentStyle={{ background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }} />
                                        <Legend wrapperStyle={{ paddingTop: '24px' }} />
                                        <Area yAxisId="left" type="monotone" dataKey="elecUsage" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.2} name={t('elec_usage_units')} strokeWidth={3} />
                                        <Area yAxisId="right" type="monotone" dataKey="waterUsage" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.2} name={t('water_usage_units')} strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid-dashboard" style={{ marginTop: '48px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                            <div className="glass-card hover-effect" style={{ padding: '32px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>{t('avg_elec_cons')}</p>
                                <div style={{ fontSize: '2.5rem', fontWeight: '950', marginTop: '12px', color: 'var(--warning)' }}>
                                    {trendData.length > 0 ? (trendData.reduce((acc: number, d: any) => acc + d.elecUsage, 0) / trendData.length).toFixed(1) : 0} <span style={{ fontSize: '1rem', fontWeight: '500', opacity: 0.6 }}>{lang === 'th' ? 'หน่วย' : 'UNITS'}</span>
                                </div>
                            </div>
                            <div className="glass-card hover-effect" style={{ padding: '32px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>{t('avg_water_cons')}</p>
                                <div style={{ fontSize: '2.5rem', fontWeight: '950', marginTop: '12px', color: 'var(--blue)' }}>
                                    {trendData.length > 0 ? (trendData.reduce((acc: number, d: any) => acc + d.waterUsage, 0) / trendData.length).toFixed(1) : 0} <span style={{ fontSize: '1rem', fontWeight: '500', opacity: 0.6 }}>UNITS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Operations (In/Out) */}
                {activeTab === 'operations' && (
                    <div className="animate-fade-in">
                        <div className="glass-card" style={{ padding: '48px' }}>
                            <div style={{ marginBottom: '40px' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>{t('tenant_flow_dynamics')}</h3>
                                <p style={{ color: 'var(--text-muted)' }}>{t('lifecycle_desc')}</p>
                            </div>
                            <div style={{ height: '400px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={occupancyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }} />
                                        <Legend wrapperStyle={{ paddingTop: '24px' }} />
                                        <Area type="stepBefore" dataKey="moveIn" stroke="var(--success)" fill="var(--success)" fillOpacity={0.2} name={t('move_ins')} strokeWidth={3} />
                                        <Area type="stepBefore" dataKey="moveOut" stroke="var(--danger)" fill="var(--danger)" fillOpacity={0.2} name={t('move_outs')} strokeWidth={3} />
                                        <Area type="stepBefore" dataKey="maintenance" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.2} name={t('to_maintenance')} strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card" style={{ marginTop: '48px', padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '32px' }}>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '900' }}>{t('recent_status_conversions')}</h4>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-app)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('timestamp')}</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('room')}</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('transition')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedApartment?.roomStatusHistory?.map((h: any) => (
                                            <tr key={h.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                <td style={{ padding: '20px 32px' }}>{new Date(h.changeDate).toLocaleString(lang === 'th' ? 'th-TH' : 'en-GB')}</td>
                                                <td style={{ padding: '20px 32px', fontWeight: '900' }}>#{h.room?.roomNumber}</td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <span className="badge" style={{ opacity: 0.6 }}>{t(h.oldStatus.toLowerCase())}</span>
                                                        <span style={{ color: 'var(--text-muted)' }}>→</span>
                                                        <span className={`badge ${h.newStatus === 'OCCUPIED' ? 'green' : h.newStatus === 'VACANT' ? 'red' : 'yellow'}`}>
                                                            {t(h.newStatus.toLowerCase())}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. Maintenance / Expenses */}
                {activeTab === 'maintenance' && (
                    <div className="animate-fade-in">
                        <div className="grid-dashboard" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                            <div className="glass-card" style={{ padding: '32px' }}>
                                <h3 style={{ marginBottom: '32px', fontSize: '1.25rem', fontWeight: '900' }}>{t('maintenance_dispatch')}</h3>
                                <form action={async (formData) => { await createMaintenance(selectedApartmentId, formData) }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <input type="hidden" name="apartmentId" value={selectedApartmentId} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label className="label-global">{t('target_asset')}</label>
                                            <select name="roomId" className="input-global" style={{ width: '100%' }}>
                                                <option value="">{t('general_property')}</option>
                                                {selectedApartment?.rooms.map((r: any) => (
                                                    <option key={r.id} value={r.id}>{t('room')} {r.roomNumber}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-global">{t('work_type')}</label>
                                            <select name="category" className="input-global" style={{ width: '100%' }}>
                                                <option value="REPAIR">{t('repair')}</option>
                                                <option value="CLEANING">{t('cleaning')}</option>
                                                <option value="UPGRADE">{t('upgrade')}</option>
                                                <option value="OTHER">{t('other')}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label className="label-global">{t('cost_allocation')}</label>
                                            <input name="cost" type="number" required placeholder="0.00" className="input-global" />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '56px' }}>{t('dispatch_order')}</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-global">{t('brief_specs')}</label>
                                        <input name="description" type="text" placeholder={t('maintenance_required_placeholder')} required className="input-global" />
                                    </div>
                                </form>
                            </div>

                            <div className="glass-card" style={{ padding: '32px' }}>
                                <h3 style={{ marginBottom: '32px', fontSize: '1.25rem', fontWeight: '900' }}>{t('opex_entry')}</h3>
                                <form action={async (formData) => { await addExpense(formData); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <input type="hidden" name="apartmentId" value={selectedApartmentId} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label className="label-global">{t('net_amount')} (฿)</label>
                                            <input name="amount" type="number" required placeholder="0.00" className="input-global" />
                                        </div>
                                        <div>
                                            <label className="label-global">{t('ledger_head')}</label>
                                            <select name="category" className="input-global" style={{ width: '100%' }}>
                                                <option value="STAFF">{t('staff_salary')}</option>
                                                <option value="TAX">{t('taxes')}</option>
                                                <option value="OTHER">{t('other_costs')}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label className="label-global">{t('accounting_period')}</label>
                                            <input name="month" type="month" defaultValue={currentMonthKey} required className="input-global" />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <button type="submit" className="btn btn-secondary" style={{ width: '100%', height: '56px' }}>{t('commit_entry')}</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Recent Maintenance Table */}
                        <div className="glass-card" style={{ marginTop: '48px', padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '32px' }}>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '900' }}>{t('maintenance_repair_logs')}</h4>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-app)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('date')}</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('target')}</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('description')}</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('status')}</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>{t('cost')}</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'center' }}>{t('action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedApartment?.maintenance?.map((m: any) => (
                                            <tr key={m.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                <td style={{ padding: '20px 32px' }}>{new Date(m.recordDate).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB')}</td>
                                                <td style={{ padding: '20px 32px', fontWeight: '800' }}>{m.room ? `${t('room')} #${m.room.roomNumber}` : t('general_property')}</td>
                                                <td style={{ padding: '20px 32px', opacity: 0.8 }}>{m.description}</td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <span className={`badge ${m.status === 'COMPLETED' ? 'green' : 'yellow'}`}>{t(m.status.toLowerCase())}</span>
                                                </td>
                                                <td style={{ padding: '20px 32px', textAlign: 'right', fontWeight: '900' }}>฿{m.cost.toLocaleString()}</td>
                                                <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                                        {m.status !== 'COMPLETED' && (
                                                            <form action={updateMaintenanceStatus}>
                                                                <input type="hidden" name="id" value={m.id} />
                                                                <input type="hidden" name="status" value="COMPLETED" />
                                                                <button type="submit" className="btn btn-secondary icon-btn" style={{ padding: '8px', minWidth: '36px', minHeight: '36px', fontSize: '1rem' }}>✓</button>
                                                            </form>
                                                        )}
                                                        <form action={deleteMaintenance}>
                                                            <input type="hidden" name="id" value={m.id} />
                                                            <button type="submit" className="btn btn-secondary icon-btn" style={{ padding: '8px', minWidth: '36px', minHeight: '36px', fontSize: '1rem', color: 'var(--danger)' }}>🗑</button>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Premium Mortgage Controller */}
            <section className="glass-card no-print hover-effect" style={{ marginTop: '80px', borderTop: '4px solid var(--primary)', padding: '48px', background: 'linear-gradient(135deg, var(--bg-panel), rgba(var(--primary-rgb), 0.05))' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>{t('capital_liabilities')}</h3>
                    <p style={{ color: 'var(--text-muted)' }}>{t('mortgage_manage_desc', { name: selectedApartment?.name })}</p>
                </div>
                <form action={async (formData) => { await updateMortgage(formData); }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'flex-end', gap: '32px' }}>
                    <input type="hidden" name="apartmentId" value={selectedApartmentId} />
                    <div>
                        <label className="label-global">{t('monthly_repayment')} (฿)</label>
                        <input
                            name="monthlyPayment"
                            type="number"
                            defaultValue={selectedApartment?.mortgage?.monthlyPayment || 0}
                            required
                            className="input-global"
                            style={{ fontSize: '1.5rem', fontWeight: '900' }}
                        />
                    </div>
                    <div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '64px', fontSize: '1.1rem' }}>{t('update_financial_settings')}</button>
                    </div>
                </form>
            </section>
        </main>
    );
}
