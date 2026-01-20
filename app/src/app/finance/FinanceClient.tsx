'use client'

import React, { useState } from 'react';
import { useI18n } from '@/providers/I18nProvider';
import BackButton from '@/components/BackButton';
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
    const { t } = useI18n();
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
            name: new Date(rev.month).toLocaleDateString('th-TH', { month: 'short' }),
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
            name: new Date(o.month).toLocaleDateString('th-TH', { month: 'short' }),
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
                        <h1 className="text-gradient" style={{ marginBottom: '12px' }}>{t('finance')} Analytics</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '500' }}>Deep dive into your property's financial performance and trends.</p>
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
                    { id: 'overview', label: 'Summary', icon: '📊' },
                    { id: 'comparison', label: 'Revenue Breakdown', icon: '⚖️' },
                    { id: 'utilities', label: 'Utility Trends', icon: '⚡' },
                    { id: 'operations', label: 'Occupancy Flow', icon: '🔑' },
                    { id: 'maintenance', label: 'Maintenance Hub', icon: '🛠️' }
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
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Month Revenue</p>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: '950', marginTop: '8px' }}>฿{projectedRevenue.toLocaleString()}</h2>
                                        <p style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: '700', marginTop: '4px' }}>Invoiced & Projected</p>
                                    </div>
                                    <div style={{ fontSize: '2.5rem', opacity: 0.5 }}>💰</div>
                                </div>
                            </div>
                            <div className="glass-card hover-effect" style={{ padding: '32px', borderLeft: '5px solid var(--danger)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Outflow</p>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: '950', marginTop: '8px', color: 'var(--danger)' }}>฿{totalOutflow.toLocaleString()}</h2>
                                        <p style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '700', marginTop: '4px' }}>Mortgage, Ops & Fix</p>
                                    </div>
                                    <div style={{ fontSize: '2.5rem', opacity: 0.5 }}>📉</div>
                                </div>
                            </div>
                            <div className="glass-card hover-effect" style={{ padding: '32px', borderLeft: '5px solid var(--primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Estimated Net Profit</p>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: '950', marginTop: '8px', color: 'var(--primary)' }}>฿{netProfit.toLocaleString()}</h2>
                                        <p style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '700', marginTop: '4px' }}>Margin: {projectedRevenue > 0 ? ((netProfit / projectedRevenue) * 100).toFixed(1) : 0}%</p>
                                    </div>
                                    <div style={{ fontSize: '2.5rem', opacity: 0.5 }}>💎</div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Trends Chart */}
                        <div className="glass-card" style={{ padding: '48px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>Property Financial Trajectory</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Revenue vs Expenses vs Profit Evolution</p>
                                </div>
                                <div className="badge blue" style={{ padding: '8px 16px' }}>Real-time Data</div>
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
                                        <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={0} name="Revenue" strokeWidth={2} />
                                        <Area type="monotone" dataKey="expenses" stroke="var(--danger)" fillOpacity={0} name="Expenses" strokeWidth={2} />
                                        <Area
                                            type="monotone"
                                            dataKey="profit"
                                            stroke="var(--success)"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorProfit)"
                                            name="Net Profit"
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
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>📊 Revenue Source Segmentation</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Historical breakdown of rent and utilities</p>
                            </div>
                            <div style={{ height: '400px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueBreakdownData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }} />
                                        <Legend wrapperStyle={{ paddingTop: '24px' }} />
                                        <Area type="monotone" dataKey="rent" stackId="1" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} name="Room Rent" />
                                        <Area type="monotone" dataKey="elec" stackId="1" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.4} name="Electricity" />
                                        <Area type="monotone" dataKey="water" stackId="1" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.4} name="Water" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card" style={{ marginTop: '48px', padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '32px' }}>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '900' }}>Historical Ledgers</h4>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-app)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Month</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Rent</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Utilities</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Growth</th>
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
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>⚡ Meter Consumption Analysis</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Resource usage patterns over time</p>
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
                                        <Area yAxisId="left" type="monotone" dataKey="elecUsage" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.2} name="Electricity Usage (Units)" strokeWidth={3} />
                                        <Area yAxisId="right" type="monotone" dataKey="waterUsage" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.2} name="Water Usage (Units)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid-dashboard" style={{ marginTop: '48px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                            <div className="glass-card hover-effect" style={{ padding: '32px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Avg. Electricity Consumption</p>
                                <div style={{ fontSize: '2.5rem', fontWeight: '950', marginTop: '12px', color: 'var(--warning)' }}>
                                    {trendData.length > 0 ? (trendData.reduce((acc: number, d: any) => acc + d.elecUsage, 0) / trendData.length).toFixed(1) : 0} <span style={{ fontSize: '1rem', fontWeight: '500', opacity: 0.6 }}>UNITS</span>
                                </div>
                            </div>
                            <div className="glass-card hover-effect" style={{ padding: '32px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Avg. Water Consumption</p>
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
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>🔑 Tenant Flow Dynamics</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Lifecycle of room occupancy and transitions</p>
                            </div>
                            <div style={{ height: '400px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={occupancyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }} />
                                        <Legend wrapperStyle={{ paddingTop: '24px' }} />
                                        <Area type="stepBefore" dataKey="moveIn" stroke="var(--success)" fill="var(--success)" fillOpacity={0.2} name="Move Ins" strokeWidth={3} />
                                        <Area type="stepBefore" dataKey="moveOut" stroke="var(--danger)" fill="var(--danger)" fillOpacity={0.2} name="Move Outs" strokeWidth={3} />
                                        <Area type="stepBefore" dataKey="maintenance" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.2} name="To Maintenance" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card" style={{ marginTop: '48px', padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '32px' }}>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '900' }}>Recent Status Conversions</h4>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-app)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Timestamp</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Room</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Transition</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedApartment?.roomStatusHistory?.map((h: any) => (
                                            <tr key={h.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                <td style={{ padding: '20px 32px' }}>{new Date(h.changeDate).toLocaleString('th-TH')}</td>
                                                <td style={{ padding: '20px 32px', fontWeight: '900' }}>#{h.room?.roomNumber}</td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <span className="badge" style={{ opacity: 0.6 }}>{h.oldStatus}</span>
                                                        <span style={{ color: 'var(--text-muted)' }}>→</span>
                                                        <span className={`badge ${h.newStatus === 'OCCUPIED' ? 'green' : h.newStatus === 'VACANT' ? 'red' : 'yellow'}`}>
                                                            {h.newStatus}
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
                                <h3 style={{ marginBottom: '32px', fontSize: '1.25rem', fontWeight: '900' }}>🛠️ Maintenance Dispatch</h3>
                                <form action={async (formData) => { await createMaintenance(selectedApartmentId, formData) }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <input type="hidden" name="apartmentId" value={selectedApartmentId} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label className="label-global">Target Asset</label>
                                            <select name="roomId" className="input-global" style={{ width: '100%' }}>
                                                <option value="">General Property</option>
                                                {selectedApartment?.rooms.map((r: any) => (
                                                    <option key={r.id} value={r.id}>Room {r.roomNumber}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-global">Work Type</label>
                                            <select name="category" className="input-global" style={{ width: '100%' }}>
                                                <option value="REPAIR">Repair</option>
                                                <option value="CLEANING">Cleaning</option>
                                                <option value="UPGRADE">Upgrade</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label className="label-global">Cost Allocation (฿)</label>
                                            <input name="cost" type="number" required placeholder="0.00" className="input-global" />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '56px' }}>Dispatch Order</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-global">Brief Specifications</label>
                                        <input name="description" type="text" placeholder="Explain the maintenance required..." required className="input-global" />
                                    </div>
                                </form>
                            </div>

                            <div className="glass-card" style={{ padding: '32px' }}>
                                <h3 style={{ marginBottom: '32px', fontSize: '1.25rem', fontWeight: '900' }}>📉 OpEx Entry</h3>
                                <form action={async (formData) => { await addExpense(formData); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <input type="hidden" name="apartmentId" value={selectedApartmentId} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label className="label-global">Net Amount (฿)</label>
                                            <input name="amount" type="number" required placeholder="0.00" className="input-global" />
                                        </div>
                                        <div>
                                            <label className="label-global">Ledger Head</label>
                                            <select name="category" className="input-global" style={{ width: '100%' }}>
                                                <option value="STAFF">{t('staff_salary')}</option>
                                                <option value="TAX">{t('taxes')}</option>
                                                <option value="OTHER">{t('other_costs')}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label className="label-global">Accounting Period</label>
                                            <input name="month" type="month" defaultValue={currentMonthKey} required className="input-global" />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <button type="submit" className="btn btn-secondary" style={{ width: '100%', height: '56px' }}>Commit Entry</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Recent Maintenance Table */}
                        <div className="glass-card" style={{ marginTop: '48px', padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '32px' }}>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '900' }}>Maintenance & Repair Logs</h4>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-app)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Target</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Description</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Cost</th>
                                            <th style={{ padding: '20px 32px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedApartment?.maintenance?.map((m: any) => (
                                            <tr key={m.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                <td style={{ padding: '20px 32px' }}>{new Date(m.recordDate).toLocaleDateString('th-TH')}</td>
                                                <td style={{ padding: '20px 32px', fontWeight: '800' }}>{m.room ? `Room #${m.room.roomNumber}` : 'General'}</td>
                                                <td style={{ padding: '20px 32px', opacity: 0.8 }}>{m.description}</td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <span className={`badge ${m.status === 'COMPLETED' ? 'green' : 'yellow'}`}>{m.status}</span>
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
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>💳 Capital Liabilities (Mortgage)</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your base financial obligations for {selectedApartment?.name}</p>
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
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '64px', fontSize: '1.1rem' }}>Update Financial Settings</button>
                    </div>
                </form>
            </section>
        </main>
    );
}
