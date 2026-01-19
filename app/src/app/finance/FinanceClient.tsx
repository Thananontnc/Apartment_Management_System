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
        <main className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '24px' }}>
                <BackButton label={t('back_to_dashboard')} href="/" />
            </div>

            <header style={{ padding: '32px 0 40px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex-between flex-wrap gap-20">
                    <div>
                        <h1 className="text-gradient" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', lineHeight: '1.2' }}>{t('finance')} Analysis</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Detailed financial insights & reporting</p>
                    </div>
                    <div className="no-print" style={{ width: '100%', maxWidth: '250px' }}>
                        <select
                            value={selectedApartmentId}
                            onChange={(e) => setSelectedApartmentId(e.target.value)}
                            className="btn"
                            style={{ width: '100%', background: 'var(--bg-panel)', border: '1px solid var(--primary)', borderRadius: '16px' }}
                        >
                            {apartments.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="no-print glass-card" style={{ marginTop: '32px', padding: '8px', display: 'flex', gap: '8px', overflowX: 'auto', borderRadius: '20px', scrollbarWidth: 'none' }}>
                {[
                    { id: 'overview', label: 'วิเคราะห์รายรับ/กำไร', icon: '📊' },
                    { id: 'comparison', label: 'เปรียบเทียบระหว่างเดือน', icon: '⚖️' },
                    { id: 'utilities', label: 'วิเคราะห์มิเตอร์ (น้ำ/ไฟ)', icon: '⚡' },
                    { id: 'operations', label: 'จอง/เข้า/ออก', icon: '🔑' },
                    { id: 'maintenance', label: 'งานซ่อมบำรุง/รายจ่าย', icon: '🛠️' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: '1', minWidth: '160px', borderRadius: '14px', whiteSpace: 'nowrap', padding: '12px 20px' }}
                    >
                        <span style={{ marginRight: '8px' }}>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </nav>

            {/* Tab Contents */}
            <div style={{ marginTop: '40px' }}>

                {/* 1. Profit/Loss Overview */}
                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
                        <section className="grid-dashboard" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                            <div className="glass-card hover-effect">
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Income (Invoiced)</h3>
                                <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '800', marginTop: '12px', color: 'var(--text-dark)' }}>
                                    ฿{projectedRevenue.toLocaleString()}
                                </div>
                            </div>

                            <div className="glass-card hover-effect" style={{ borderLeft: '4px solid var(--danger)' }}>
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expenses (Actual)</h3>
                                <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '800', marginTop: '12px', color: 'var(--danger)' }}>
                                    ฿{totalOutflow.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    Ops: ฿{monthlyExpenses.toLocaleString()} | Fix: ฿{monthlyMaintenance.toLocaleString()}
                                </div>
                            </div>

                            <div className="glass-card hover-effect" style={{ borderLeft: '4px solid var(--success)' }}>
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Profit (Net)</h3>
                                <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '800', marginTop: '12px', color: 'var(--success)' }}>
                                    ฿{netProfit.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    Margin: {projectedRevenue > 0 ? ((netProfit / projectedRevenue) * 100).toFixed(1) : 0}%
                                </div>
                            </div>
                        </section>

                        <div className="glass-card" style={{ height: 'auto', minHeight: '400px', padding: '24px', marginTop: '32px' }}>
                            <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>📈 Financial Evolution (Revenue vs Expenses vs Profit)</h3>
                            <div style={{ width: '100%', height: '320px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                                        <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(value) => `฿${value >= 1000 ? value / 1000 + 'k' : value}`} />
                                        <Tooltip
                                            contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--primary)', borderRadius: '12px' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={0} name="Revenue" strokeWidth={2} />
                                        <Area type="monotone" dataKey="expenses" stroke="var(--danger)" fillOpacity={0} name="Expenses" strokeWidth={2} />
                                        <Area type="monotone" dataKey="profit" stroke="var(--success)" fillOpacity={1} fill="url(#colorProfit)" name="Profit" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Revenue Comparison */}
                {activeTab === 'comparison' && (
                    <div className="animate-fade-in card glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>📊 Revenue Source Segmentation</h3>
                        <div style={{ height: 'auto', minHeight: '350px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={revenueBreakdownData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Area type="monotone" dataKey="rent" stackId="1" stroke="#818cf8" fill="#818cf8" name="Room Rent" />
                                    <Area type="monotone" dataKey="elec" stackId="1" stroke="#fbbf24" fill="#fbbf24" name="Electricity" />
                                    <Area type="monotone" dataKey="water" stackId="1" stroke="#38bdf8" fill="#38bdf8" name="Water" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ marginTop: '40px' }}>
                            <h4 style={{ marginBottom: '20px' }}>Monthly Breakdown Table</h4>
                            <div style={{ overflowX: 'auto', margin: '0 -24px', padding: '0 24px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-subtle)' }}>
                                            <th style={{ padding: '12px' }}>Month</th>
                                            <th style={{ padding: '12px' }}>Rent</th>
                                            <th style={{ padding: '12px' }}>Utilities</th>
                                            <th style={{ padding: '12px' }}>Total</th>
                                            <th style={{ padding: '12px' }}>Growth</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trendData.slice().reverse().map((d: any, i: number, arr: any[]) => {
                                            const prev = arr[i + 1];
                                            const growth = prev ? ((d.revenue - prev.revenue) / prev.revenue * 100).toFixed(1) : '-';
                                            return (
                                                <tr key={d.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                    <td style={{ padding: '12px' }}>{d.name}</td>
                                                    <td style={{ padding: '12px' }}>฿{d.rent.toLocaleString()}</td>
                                                    <td style={{ padding: '12px' }}>฿{(d.elec + d.water).toLocaleString()}</td>
                                                    <td style={{ padding: '12px', fontWeight: '700' }}>฿{d.revenue.toLocaleString()}</td>
                                                    <td style={{ padding: '12px', color: parseFloat(growth) > 0 ? 'var(--success)' : 'var(--danger)' }}>
                                                        {growth !== '-' ? `${growth}%` : '-'}
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
                    <div className="animate-fade-in card glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>⚡ Meter Consumption Analysis (Combined)</h3>
                        <div style={{ height: 'auto', minHeight: '350px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={utilityUsageData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis yAxisId="left" orientation="left" stroke="#fbbf24" fontSize={10} label={{ value: 'Elec (Unit)', angle: -90, position: 'insideLeft', style: { fill: '#fbbf24' } }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={10} label={{ value: 'Water (Unit)', angle: 90, position: 'insideRight', style: { fill: '#38bdf8' } }} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Area yAxisId="left" type="monotone" dataKey="elecUsage" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.1} name="Electricity Usage" />
                                    <Area yAxisId="right" type="monotone" dataKey="waterUsage" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.1} name="Water Usage" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid-dashboard" style={{ marginTop: '48px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                            <div className="glass-card">
                                <h4 style={{ fontSize: '0.9rem' }}>Avg. Electricity Usage/Month</h4>
                                <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', marginTop: '10px' }}>
                                    {trendData.length > 0 ? (trendData.reduce((acc: number, d: any) => acc + d.elecUsage, 0) / trendData.length).toFixed(1) : 0} <span style={{ fontSize: '1rem', fontWeight: '400' }}>Units</span>
                                </div>
                            </div>
                            <div className="glass-card">
                                <h4 style={{ fontSize: '0.9rem' }}>Avg. Water Usage/Month</h4>
                                <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', marginTop: '10px' }}>
                                    {trendData.length > 0 ? (trendData.reduce((acc: number, d: any) => acc + d.waterUsage, 0) / trendData.length).toFixed(1) : 0} <span style={{ fontSize: '1rem', fontWeight: '400' }}>Units</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Operations (In/Out) */}
                {activeTab === 'operations' && (
                    <div className="animate-fade-in">
                        <div className="card glass-card" style={{ padding: '24px' }}>
                            <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>🔑 Tenant Flow (Move-ins vs Move-outs)</h3>
                            <div style={{ height: 'auto', minHeight: '350px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height={320}>
                                    <AreaChart data={occupancyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={12} />
                                        <YAxis fontSize={12} />
                                        <Tooltip />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Area type="stepBefore" dataKey="moveIn" stroke="var(--success)" fill="var(--success)" fillOpacity={0.1} name="Move Ins" />
                                        <Area type="stepBefore" dataKey="moveOut" stroke="var(--danger)" fill="var(--danger)" fillOpacity={0.1} name="Move Outs" />
                                        <Area type="stepBefore" dataKey="maintenance" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.1} name="To Maintenance" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="card" style={{ marginTop: '32px', padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '1.2rem' }}>Recent Status History</h3>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead style={{ background: 'var(--bg-panel)' }}>
                                        <tr style={{ textAlign: 'left' }}>
                                            <th style={{ padding: '16px' }}>Date</th>
                                            <th style={{ padding: '16px' }}>Room</th>
                                            <th style={{ padding: '16px' }}>Old Status</th>
                                            <th style={{ padding: '16px' }}>New Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedApartment?.roomStatusHistory?.map((h: any) => (
                                            <tr key={h.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                <td style={{ padding: '16px' }}>{new Date(h.changeDate).toLocaleString('th-TH')}</td>
                                                <td style={{ padding: '16px', fontWeight: '700' }}>#{h.room?.roomNumber}</td>
                                                <td style={{ padding: '16px' }}><span className="badge">{h.oldStatus}</span></td>
                                                <td style={{ padding: '16px' }}>
                                                    <span className={`badge ${h.newStatus === 'OCCUPIED' ? 'green' : h.newStatus === 'VACANT' ? 'red' : 'yellow'}`}>
                                                        {h.newStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!selectedApartment?.roomStatusHistory || selectedApartment.roomStatusHistory.length === 0) && (
                                            <tr>
                                                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No occupancy events tracked yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. Maintenance / Expenses */}
                {activeTab === 'maintenance' && (
                    <div className="animate-fade-in">
                        <div className="grid-dashboard" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                            <div className="card" style={{ padding: '24px' }}>
                                <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>🛠️ Log Maintenance</h3>
                                <form action={async (formData) => { await createMaintenance(selectedApartmentId, formData) }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <input type="hidden" name="apartmentId" value={selectedApartmentId} />
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Room #</label>
                                            <select name="roomId" className="btn" style={{ width: '100%', height: '48px', padding: '0 12px' }}>
                                                <option value="">General Property</option>
                                                {selectedApartment?.rooms.map((r: any) => (
                                                    <option key={r.id} value={r.id}>Room {r.roomNumber}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Category</label>
                                            <select name="category" className="btn" style={{ width: '100%', height: '48px', padding: '0 12px' }}>
                                                <option value="REPAIR">Repair</option>
                                                <option value="CLEANING">Cleaning</option>
                                                <option value="UPGRADE">Upgrade</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Cost (฿)</label>
                                            <input name="cost" type="number" required placeholder="0" />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', padding: '0' }}>Add Record</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Description</label>
                                        <input name="description" type="text" placeholder="Detail..." required />
                                    </div>
                                </form>
                            </div>

                            <div className="card" style={{ padding: '24px' }}>
                                <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>📉 Add General Expense</h3>
                                <form action={async (formData) => { await addExpense(formData); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <input type="hidden" name="apartmentId" value={selectedApartmentId} />
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Amount (฿)</label>
                                            <input name="amount" type="number" required placeholder="0" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Category</label>
                                            <select name="category" className="btn" style={{ width: '100%', height: '48px', padding: '0 12px' }}>
                                                <option value="STAFF">{t('staff_salary')}</option>
                                                <option value="TAX">{t('taxes')}</option>
                                                <option value="OTHER">{t('other_costs')}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Billing Month</label>
                                            <input name="month" type="month" defaultValue={currentMonthKey} required />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <button type="submit" className="btn btn-secondary" style={{ width: '100%', height: '48px', padding: '0' }}>Record</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Recent Maintenance Table */}
                        <div className="card" style={{ marginTop: '32px', padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '1.2rem' }}>Maintenance & Repairs Log</h3>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                    <thead style={{ background: 'var(--bg-panel)' }}>
                                        <tr style={{ textAlign: 'left' }}>
                                            <th style={{ padding: '16px' }}>Date</th>
                                            <th style={{ padding: '16px' }}>Target</th>
                                            <th style={{ padding: '16px' }}>Description</th>
                                            <th style={{ padding: '16px' }}>Status</th>
                                            <th style={{ padding: '16px', textAlign: 'right' }}>Cost</th>
                                            <th style={{ padding: '16px', textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedApartment?.maintenance?.map((m: any) => (
                                            <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                <td style={{ padding: '16px' }}>{new Date(m.recordDate).toLocaleDateString('th-TH')}</td>
                                                <td style={{ padding: '16px' }}>{m.room ? `Room #${m.room.roomNumber}` : 'General Property'}</td>
                                                <td style={{ padding: '16px' }}>{m.description}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <span className={`badge ${m.status === 'COMPLETED' ? 'green' : 'yellow'}`}>{m.status}</span>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700' }}>฿{m.cost.toLocaleString()}</td>
                                                <td style={{ padding: '16px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    {m.status !== 'COMPLETED' && (
                                                        <form action={updateMaintenanceStatus}>
                                                            <input type="hidden" name="id" value={m.id} />
                                                            <input type="hidden" name="status" value="COMPLETED" />
                                                            <button type="submit" title="Mark as Completed" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✅</button>
                                                        </form>
                                                    )}
                                                    <form action={deleteMaintenance}>
                                                        <input type="hidden" name="id" value={m.id} />
                                                        <button type="submit" title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                                                    </form>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!selectedApartment?.maintenance || selectedApartment.maintenance.length === 0) && (
                                            <tr>
                                                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No maintenance activity logged yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Bank/Mortgage is now at the footer across all tabs */}
            <section className="card no-print" style={{ marginTop: '64px', borderTop: '4px solid var(--primary)', padding: '24px' }}>
                <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>💳 Base Financial Liabilities (Mortgage)</h3>
                <form action={async (formData) => { await updateMortgage(formData); }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'flex-end', gap: '20px' }}>
                    <input type="hidden" name="apartmentId" value={selectedApartmentId} />
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('monthly_repayment')} (฿)</label>
                        <input name="monthlyPayment" type="number" defaultValue={selectedApartment?.mortgage?.monthlyPayment || 0} required />
                    </div>
                    <div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '56px' }}>Update Bank Settings</button>
                    </div>
                </form>
            </section>
        </main>
    );
}
