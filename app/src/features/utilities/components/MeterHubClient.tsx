'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import BackButton from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { submitReadings } from '@/app/actions/utilities';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';

interface MeterHubProps {
    apartment: any;
    sortedRooms: any[];
}

export default function MeterHub({ apartment, sortedRooms }: MeterHubProps) {
    const { t } = useI18n();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentMonth = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [showMonthGrid, setShowMonthGrid] = useState(false);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = parseInt(currentMonth.split('-')[0]);
    const currentMonthIdx = parseInt(currentMonth.split('-')[1]) - 1;

    // Progress Calculation - Memoized
    const { progressPercent, completedRooms } = useMemo(() => {
        const total = sortedRooms.length;
        const completed = sortedRooms.filter(r => (drafts[`elec_${r.id}`] || drafts[`water_${r.id}`])).length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { progressPercent: percent, completedRooms: completed };
    }, [sortedRooms, drafts]);

    // Initialize drafts from server data (Edit mode) or localStorage
    useEffect(() => {
        const key = `utility_draft_${apartment.id}_${currentMonth}`;
        const saved = localStorage.getItem(key);

        // Initial data mapping from server
        const initialMap: Record<string, string> = {};
        sortedRooms.forEach((room: any) => {
            if (room.currentReading) {
                initialMap[`elec_${room.id}`] = room.currentReading.elecMeter.toString();
                initialMap[`prevElec_${room.id}`] = room.currentReading.elecMeterPrev.toString();
                initialMap[`water_${room.id}`] = room.currentReading.waterMeter.toString();
                initialMap[`prevWater_${room.id}`] = room.currentReading.waterMeterPrev.toString();
            } else if (room.previousReading) {
                initialMap[`prevElec_${room.id}`] = room.previousReading.elecMeter.toString();
                initialMap[`prevWater_${room.id}`] = room.previousReading.waterMeter.toString();
            }
        });

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setDrafts({ ...initialMap, ...parsed });
            } catch (e) {
                setDrafts(initialMap);
            }
        } else {
            setDrafts(initialMap);
        }
    }, [apartment.id, currentMonth, sortedRooms]);

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        router.push(`?month=${val}`);
    };

    // Debounced LocalStorage Saving
    useEffect(() => {
        const timer = setTimeout(() => {
            const key = `utility_draft_${apartment.id}_${currentMonth}`;
            localStorage.setItem(key, JSON.stringify(drafts));
        }, 800);

        return () => clearTimeout(timer);
    }, [drafts, apartment.id, currentMonth]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDrafts(prev => ({ ...prev, [name]: value }));
    };

    const handleKeyDown = (e: React.KeyboardEvent, roomId: string, type: 'elec' | 'water') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
            const currentIndex = inputs.indexOf(e.target as HTMLInputElement);
            if (currentIndex > -1 && currentIndex < inputs.length - 1) {
                (inputs[currentIndex + 1] as HTMLInputElement).focus();
            }
        }
    };

    // Memoized Financial Totals
    const { buildingRent, buildingElec, buildingWater, totalRevenue } = useMemo(() => {
        let bRent = 0;
        let bElec = 0;
        let bWater = 0;
        sortedRooms.forEach(room => {
            bRent += room.baseRent;
            const pE = parseFloat(drafts[`prevElec_${room.id}`] || '0');
            const cE = parseFloat(drafts[`elec_${room.id}`] || '0');
            if (cE > pE) bElec += (cE - pE) * apartment.defaultElecPrice;

            const pW = parseFloat(drafts[`prevWater_${room.id}`] || '0');
            const cW = parseFloat(drafts[`water_${room.id}`] || '0');
            if (cW > pW) bWater += (cW - pW) * apartment.defaultWaterPrice;
        });
        return {
            buildingRent: bRent,
            buildingElec: bElec,
            buildingWater: bWater,
            totalRevenue: bRent + bElec + bWater
        };
    }, [sortedRooms, drafts, apartment.defaultElecPrice, apartment.defaultWaterPrice]);

    const handleFormSubmit = () => {
        const key = `utility_draft_${apartment.id}_${currentMonth}`;
        localStorage.removeItem(key);
    };

    const navigateToMonth = (year: number, monthIdx: number) => {
        const val = `${year}-${(monthIdx + 1).toString().padStart(2, '0')}`;
        router.push(`?month=${val}`);
        setShowMonthGrid(false);
    };

    return (
        <>
            <style jsx>{`
                .room-card-grid {
                    display: grid;
                    grid-template-columns: 140px 1fr 1.5fr;
                    gap: 32px;
                    padding: 32px;
                    align-items: center;
                }
                .utility-meters-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }
                .room-number-display {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: var(--text-dark);
                    letter-spacing: -2px;
                }
                @media (max-width: 1024px) {
                    .room-card-grid {
                        grid-template-columns: 120px 1fr !important;
                        gap: 24px !important;
                        padding: 24px !important;
                    }
                    .utility-meters-row {
                        grid-column: 1 / -1;
                    }
                    .room-number-display {
                        font-size: 2rem !important;
                    }
                }
                @media (max-width: 768px) {
                    .room-card-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .utility-meters-row {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            {/* Month Picker Overlay */}
            {showMonthGrid && mounted && createPortal(
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 99999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        padding: '20px'
                    }}
                    onClick={() => setShowMonthGrid(false)}
                >
                    <div
                        className="glass-card animate-bounce-in"
                        style={{
                            padding: '40px',
                            width: '420px',
                            maxWidth: '95vw',
                            borderRadius: '32px',
                            background: 'var(--bg-app)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            border: '1px solid var(--glass-border)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex-between" style={{ marginBottom: '32px', flexDirection: 'row' }}>
                            <Button variant="secondary" onClick={() => navigateToMonth(currentYear - 1, currentMonthIdx)} style={{ minWidth: '48px', minHeight: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)' }}>←</Button>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: '950', letterSpacing: '-0.02em', margin: '0 16px', background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{currentYear} {t('cycle')}</h3>
                            <Button variant="secondary" onClick={() => navigateToMonth(currentYear + 1, currentMonthIdx)} style={{ minWidth: '48px', minHeight: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)' }}>→</Button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {months.map((m, idx) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => navigateToMonth(currentYear, idx)}
                                    className={`btn ${idx === currentMonthIdx ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{
                                        padding: '16px 0',
                                        borderRadius: '16px',
                                        fontSize: '1rem',
                                        fontWeight: '800',
                                        background: idx === currentMonthIdx ? '' : 'rgba(255,255,255,0.03)',
                                        border: idx === currentMonthIdx ? '' : '1px solid var(--border-subtle)',
                                        transition: 'all 0.2s ease',
                                        color: idx === currentMonthIdx ? 'white' : 'var(--text-main)'
                                    }}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <main className="container animate-fade-in" style={{ paddingBottom: '8rem' }}>

                <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '24px' }}>
                    <BackButton label={t('back_to_selection')} href="/utilities" />
                </div>

                <header style={{ padding: '40px 0 60px 0' }}>
                    <div className="flex-between flex-wrap gap-32">
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <h1 className="text-gradient">{t('meter_hub')}: {apartment.name}</h1>
                                {sortedRooms.some(r => r.currentReading) && <Badge variant="blue" style={{ borderRadius: '12px', padding: '8px 16px', fontWeight: '800' }}>✏️ {t('revision_mode')}</Badge>}
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '12px', fontWeight: '500' }}>{t('precision_monitoring')}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>{t('operational_audit')}</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '950', color: 'var(--primary)', letterSpacing: '-1px' }}>{progressPercent}% <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t('complete')}</span></div>
                            </div>
                            <div className="no-print" style={{ display: 'flex', background: 'var(--bg-panel)', padding: '6px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                <Button variant={viewMode === 'card' ? 'primary' : 'secondary'} onClick={() => setViewMode('card')} style={{ padding: '10px 24px', fontSize: '0.85rem', borderRadius: '12px', minWidth: '100px' }}>{t('cards')}</Button>
                                <Button variant={viewMode === 'table' ? 'primary' : 'secondary'} onClick={() => setViewMode('table')} style={{ padding: '10px 24px', fontSize: '0.85rem', borderRadius: '12px', minWidth: '100px' }}>{t('table')}</Button>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px', height: '10px', background: 'var(--bg-panel)', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)', boxShadow: '0 0 20px var(--primary-glow)' }}></div>
                    </div>
                </header>

                <form
                    action={submitReadings.bind(null, apartment.id)}
                    onSubmit={handleFormSubmit}
                    style={{ marginTop: '20px' }}
                >
                    {/* Building Insight Summary */}
                    <Card variant="glass" style={{
                        marginBottom: '48px',
                        padding: '40px',
                        background: 'linear-gradient(135deg, var(--bg-panel), rgba(var(--primary-rgb), 0.05))',
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 2fr',
                        gap: '48px',
                        borderTop: '4px solid var(--primary)',
                        alignItems: 'center'
                    }}>
                        {/* Memoized Financial Data View */}
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '2px' }}>{t('institutional_revenue')}</label>
                            <div style={{ fontSize: '3.5rem', fontWeight: '950', color: 'var(--text-dark)', marginTop: '12px', letterSpacing: '-2px' }}>
                                ฿<span className="text-gradient">{totalRevenue.toLocaleString()}</span>
                            </div>
                            <p style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: '700', marginTop: '8px' }}>{t('estimated_target')} {months[currentMonthIdx]} {t('cycle')}</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            <Card variant="glass" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: 'none' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>🏦</div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800' }}>{t('unit_rent')}</label>
                                <div style={{ fontWeight: '900', fontSize: '1.4rem', marginTop: '4px' }}>฿{buildingRent.toLocaleString()}</div>
                            </Card>
                            <Card variant="glass" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: 'none' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>⚡</div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800' }}>{t('energy')}</label>
                                <div style={{ fontWeight: '900', fontSize: '1.4rem', marginTop: '4px', color: 'var(--warning)' }}>฿{buildingElec.toLocaleString()}</div>
                            </Card>
                            <Card variant="glass" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: 'none' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>💧</div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800' }}>{t('water')}</label>
                                <div style={{ fontWeight: '900', fontSize: '1.4rem', marginTop: '4px', color: 'var(--blue)' }}>฿{buildingWater.toLocaleString()}</div>
                            </Card>
                        </div>
                    </Card>

                    {/* Cycle Control Strip */}
                    <Card variant="glass" className="no-print" style={{
                        marginBottom: '48px',
                        padding: '24px 40px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'sticky',
                        top: '24px',
                        zIndex: 100,
                        gap: '24px',
                        flexWrap: 'wrap',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(var(--bg-panel-rgb), 0.85)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        boxShadow: 'var(--shadow-glow)'
                    }}>
                        <div style={{ display: 'flex', gap: '48px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <label style={{ fontWeight: '950', color: 'var(--text-dark)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                    {t('cycle')}
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-app)', borderRadius: '16px', padding: '6px', border: '1px solid var(--border-subtle)' }}>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            const d = new Date(currentMonth + '-01');
                                            d.setMonth(d.getMonth() - 1);
                                            router.push(`?month=${d.toISOString().slice(0, 7)}`);
                                        }}
                                        style={{ padding: '8px 12px', borderRadius: '12px', minWidth: '44px', border: 'none' }}
                                    >←</Button>

                                    <button
                                        type="button"
                                        onClick={() => setShowMonthGrid(true)}
                                        style={{
                                            padding: '0 24px',
                                            border: 'none',
                                            fontWeight: '950',
                                            background: 'transparent',
                                            fontSize: '1.3rem',
                                            color: 'var(--primary)',
                                            minWidth: '220px',
                                            textAlign: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {months[currentMonthIdx]} {currentYear}
                                    </button>
                                    <input type="hidden" name="recordDate" value={currentMonth} />

                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            const d = new Date(currentMonth + '-01');
                                            d.setMonth(d.getMonth() + 1);
                                            router.push(`?month=${d.toISOString().slice(0, 7)}`);
                                        }}
                                        style={{ padding: '8px 12px', borderRadius: '12px', minWidth: '44px', border: 'none' }}
                                    >→</Button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <Badge variant="blue" style={{ padding: '12px 24px', fontSize: '0.9rem', borderRadius: '12px' }}>⚡ ฿{apartment.defaultElecPrice}</Badge>
                                <Badge variant="blue" style={{ padding: '12px 24px', fontSize: '0.9rem', borderRadius: '12px' }}>💧 ฿{apartment.defaultWaterPrice}</Badge>
                            </div>
                        </div>
                        <Button type="submit" variant="primary" className="hover-effect" style={{ padding: '16px 48px', height: '60px', borderRadius: '16px', fontWeight: '950', fontSize: '1rem', boxShadow: 'var(--shadow-glow)' }}>
                            🚀 {t('finalize_batch')}
                        </Button>
                    </Card>

                    {viewMode === 'card' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>
                            {sortedRooms.map((room) => {
                                const prevElec = parseFloat(drafts[`prevElec_${room.id}`] || '0');
                                const currElec = parseFloat(drafts[`elec_${room.id}`] || '0');
                                const elecDiff = Math.max(0, currElec - prevElec);

                                const prevWater = parseFloat(drafts[`prevWater_${room.id}`] || '0');
                                const currWater = parseFloat(drafts[`water_${room.id}`] || '0');
                                const waterUsage = Math.max(0, currWater - prevWater);

                                const hasData = drafts[`elec_${room.id}`] || drafts[`water_${room.id}`];

                                return (
                                    <Card key={room.id} variant="glass" hoverEffect className="hover-effect" style={{
                                        padding: '0',
                                        overflow: 'hidden',
                                        border: hasData ? '2px solid var(--primary-glow)' : '1px solid var(--glass-border)',
                                        background: hasData ? 'rgba(var(--primary-rgb), 0.04)' : ''
                                    }}>
                                        <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '140px 1fr', gap: '32px', alignItems: 'center' }}>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'var(--bg-panel)',
                                                padding: '24px 8px',
                                                borderRadius: '24px',
                                                minHeight: '150px',
                                                width: '100%',
                                                border: '1px solid var(--border-subtle)'
                                            }}>
                                                <div className="room-number-display" style={{ fontSize: '3rem', fontWeight: '950', letterSpacing: '-2px', lineHeight: '1' }}>{room.roomNumber}</div>
                                                <Badge variant={room.status === 'OCCUPIED' ? 'green' : 'red'} style={{ marginTop: '16px', borderRadius: '12px', fontSize: '0.7rem', width: 'fit-content', whiteSpace: 'nowrap' }}>{room.status}</Badge>
                                                <input type="hidden" name="roomIds[]" value={room.id} />
                                            </div>

                                            <div style={{ display: 'grid', gap: '20px' }}>
                                                {/* Electricity Group */}
                                                <div style={{ background: 'rgba(251, 191, 36, 0.06)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(251, 191, 36, 0.1)' }}>
                                                    <div className="flex-between" style={{ marginBottom: '12px' }}>
                                                        <label style={{ fontSize: '0.75rem', fontWeight: '950', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '1px' }}>⚡ Energy (kWh)</label>
                                                        {elecDiff > 0 && <Badge variant="yellow" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>+{elecDiff.toFixed(1)}</Badge>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
                                                        <div style={{ flex: 1.5 }}>
                                                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Current Reading</label>
                                                            <input
                                                                type="number"
                                                                name={`elec_${room.id}`}
                                                                value={drafts[`elec_${room.id}`] || ''}
                                                                onChange={handleInputChange}
                                                                onKeyDown={(e) => handleKeyDown(e, room.id, 'elec')}
                                                                placeholder="Current"
                                                                className="input-global"
                                                                style={{ fontWeight: '950', fontSize: '1.5rem', height: '64px', borderRadius: '16px', background: 'var(--bg-panel)' }}
                                                            />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Previous</label>
                                                            <input
                                                                type="number"
                                                                name={`prevElec_${room.id}`}
                                                                value={drafts[`prevElec_${room.id}`] || ''}
                                                                onChange={handleInputChange}
                                                                placeholder="Prev"
                                                                className="input-global"
                                                                style={{ width: '100%', height: '64px', opacity: 0.7, fontSize: '1.1rem', fontWeight: '800', borderRadius: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Water Group */}
                                                <div style={{ background: 'rgba(56, 189, 248, 0.06)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                                                    <div className="flex-between" style={{ marginBottom: '12px' }}>
                                                        <label style={{ fontSize: '0.75rem', fontWeight: '950', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '1px' }}>💧 Water (Units)</label>
                                                        {waterUsage > 0 && <Badge variant="blue" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>+{waterUsage.toFixed(0)}</Badge>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
                                                        <div style={{ flex: 1.5 }}>
                                                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Current Reading</label>
                                                            <input
                                                                type="number"
                                                                name={`water_${room.id}`}
                                                                value={drafts[`water_${room.id}`] || ''}
                                                                onChange={handleInputChange}
                                                                onKeyDown={(e) => handleKeyDown(e, room.id, 'water')}
                                                                placeholder="Current"
                                                                className="input-global"
                                                                style={{ fontWeight: '950', fontSize: '1.5rem', height: '64px', borderRadius: '16px', background: 'var(--bg-panel)' }}
                                                            />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Previous</label>
                                                            <input
                                                                type="number"
                                                                name={`prevWater_${room.id}`}
                                                                value={drafts[`prevWater_${room.id}`] || ''}
                                                                onChange={handleInputChange}
                                                                placeholder="Prev"
                                                                className="input-global"
                                                                style={{ width: '100%', height: '64px', opacity: 0.7, fontSize: '1.1rem', fontWeight: '800', borderRadius: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card variant="glass" className="animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(var(--primary-rgb), 0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                                            <th style={{ padding: '24px 40px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '950', letterSpacing: '2px' }}>Unit</th>
                                            <th style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '950' }}>Prev Elec</th>
                                            <th style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '950' }}>Curr Elec</th>
                                            <th style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '950' }}>Prev Water</th>
                                            <th style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '950' }}>Curr Water</th>
                                            <th style={{ padding: '24px 40px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '950', letterSpacing: '2px' }}>Total Ledger</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedRooms.map(room => {
                                            const pE = parseFloat(drafts[`prevElec_${room.id}`] || '0');
                                            const cE = parseFloat(drafts[`elec_${room.id}`] || '0');
                                            const eDiff = Math.max(0, cE - pE);
                                            const pW = parseFloat(drafts[`prevWater_${room.id}`] || '0');
                                            const cW = parseFloat(drafts[`water_${room.id}`] || '0');
                                            const wDiff = Math.max(0, cW - pW);
                                            const total = room.baseRent + (eDiff * apartment.defaultElecPrice) + (wDiff * apartment.defaultWaterPrice);

                                            return (
                                                <tr key={room.id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="table-row-hover">
                                                    <td style={{ padding: '20px 40px' }}>
                                                        <div style={{ fontWeight: '950', fontSize: '1.6rem', color: 'var(--text-dark)' }}>{room.roomNumber}</div>
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                                        <input type="number" name={`prevElec_${room.id}`} value={drafts[`prevElec_${room.id}`] || ''} onChange={handleInputChange} className="input-global" style={{ width: '120px', opacity: 0.5, fontSize: '0.9rem', textAlign: 'center', borderRadius: '12px' }} />
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                                        <input type="number" name={`elec_${room.id}`} value={drafts[`elec_${room.id}`] || ''} onChange={handleInputChange} className="input-global" style={{ width: '120px', fontWeight: '950', textAlign: 'center', color: 'var(--warning)', borderColor: 'rgba(251, 191, 36, 0.3)', fontSize: '1.2rem', borderRadius: '12px' }} />
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                                        <input type="number" name={`prevWater_${room.id}`} value={drafts[`prevWater_${room.id}`] || ''} onChange={handleInputChange} className="input-global" style={{ width: '120px', opacity: 0.5, fontSize: '0.9rem', textAlign: 'center', borderRadius: '12px' }} />
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                                        <input type="number" name={`water_${room.id}`} value={drafts[`water_${room.id}`] || ''} onChange={handleInputChange} className="input-global" style={{ width: '120px', fontWeight: '950', textAlign: 'center', color: 'var(--blue)', borderColor: 'rgba(56, 189, 248, 0.3)', fontSize: '1.2rem', borderRadius: '12px' }} />
                                                    </td>
                                                    <td style={{ padding: '20px 40px', textAlign: 'right', fontWeight: '950', fontSize: '1.4rem' }}>
                                                        ฿{total.toLocaleString()}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    <div style={{ marginTop: '100px', display: 'flex', justifyContent: 'center', paddingBottom: '120px' }}>
                        <Button type="submit" variant="primary" className="hover-effect" style={{ padding: '24px 120px', minHeight: '100px', fontSize: '1.75rem', borderRadius: '40px', boxShadow: '0 40px 80px -15px rgba(var(--primary-rgb), 0.6)', fontWeight: '950' }}>
                            ⚡ {t('authorize_generate')}
                        </Button>
                    </div>
                </form>
            </main>
        </>
    );
}
