'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { submitReadings } from '@/app/actions/utilities';
import { useRouter, useSearchParams } from 'next/navigation';

interface UtilitiesClientProps {
    apartment: any;
    sortedRooms: any[];
}

export default function UtilitiesClient({ apartment, sortedRooms }: UtilitiesClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentMonth = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [showMonthGrid, setShowMonthGrid] = useState(false);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = parseInt(currentMonth.split('-')[0]);
    const currentMonthIdx = parseInt(currentMonth.split('-')[1]) - 1;

    // Progress Calculation
    const totalRooms = sortedRooms.length;
    const completedRooms = sortedRooms.filter(r => (drafts[`elec_${r.id}`] || drafts[`water_${r.id}`])).length;
    const progressPercent = totalRooms > 0 ? Math.round((completedRooms / totalRooms) * 100) : 0;

    // Load drafts on mount or month change
    useEffect(() => {
        const key = `utility_draft_${apartment.id}_${currentMonth}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                setDrafts(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse drafts", e);
            }
        } else {
            setDrafts({});
        }
    }, [apartment.id, currentMonth]);

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        router.push(`?month=${val}`);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const key = `utility_draft_${apartment.id}_${currentMonth}`;
        const updatedDrafts = { ...drafts, [name]: value };
        setDrafts(updatedDrafts);
        localStorage.setItem(key, JSON.stringify(updatedDrafts));
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
                @media (max-width: 1024px) {
                    .room-card-grid {
                        grid-template-columns: 80px 1fr !important;
                        gap: 24px !important;
                        padding: 24px !important;
                    }
                    .utility-meters-row {
                        grid-column: 1 / -1;
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 16px;
                    }
                    .room-number-display {
                        font-size: 2rem !important;
                    }
                    .sticky-control-bar {
                        flex-direction: column !important;
                        gap: 16px !important;
                        padding: 20px !important;
                    }
                    .cycle-controls-wrapper {
                        flex-direction: column !important;
                        gap: 16px !important;
                        width: 100%;
                    }
                    .rate-badges-wrapper {
                        justify-content: center;
                        flex-wrap: wrap;
                    }
                }
                @media (max-width: 768px) {
                    .room-card-grid {
                        grid-template-columns: 1fr !important;
                        gap: 20px !important;
                        padding: 20px !important;
                    }
                    .utility-meters-row {
                        grid-template-columns: 1fr !important;
                    }
                    .room-number-display {
                        font-size: 1.75rem !important;
                    }
                    .header-title {
                        font-size: 1.75rem !important;
                    }
                    .month-picker-modal {
                        width: 90% !important;
                        max-width: 340px !important;
                    }
                }
            `}</style>
            <main className="container animate-fade-in" style={{ paddingBottom: '6rem' }}>
                {/* Month Picker Overlay */}
                {showMonthGrid && (
                    <div
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            zIndex: 100, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            padding: '20px'
                        }}
                        onClick={() => setShowMonthGrid(false)}
                    >
                        <div
                            className="glass-card month-picker-modal"
                            style={{ padding: '32px', width: '360px', maxWidth: '90vw', borderRadius: '32px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex-between" style={{ marginBottom: '24px' }}>
                                <button type="button" onClick={() => navigateToMonth(currentYear - 1, currentMonthIdx)} className="btn btn-secondary icon-btn" style={{ minWidth: '44px', minHeight: '44px' }}>←</button>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>{currentYear}</h3>
                                <button type="button" onClick={() => navigateToMonth(currentYear + 1, currentMonthIdx)} className="btn btn-secondary icon-btn" style={{ minWidth: '44px', minHeight: '44px' }}>→</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                {months.map((m, idx) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => navigateToMonth(currentYear, idx)}
                                        className={`btn ${idx === currentMonthIdx ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{ padding: '12px 0', minHeight: '44px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: '700' }}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '24px' }}>
                    <BackButton label="Back to Selection" href="/utilities" />
                </div>

                <header style={{ padding: '32px 0 40px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <h1 className="text-gradient header-title" style={{ fontSize: '2.5rem' }}>Meter Hub: {apartment.name}</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '8px' }}>Record monthly utility usage for all rooms.</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Current Progress</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>{progressPercent}%</div>
                        </div>
                    </div>

                    {/* Modern Progress Bar */}
                    <div style={{ marginTop: '24px', height: '6px', background: 'var(--bg-panel)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progressPercent}%`, background: 'var(--primary)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                    </div>
                </header>

                <form
                    action={submitReadings.bind(null, apartment.id)}
                    onSubmit={handleFormSubmit}
                    style={{ marginTop: '40px' }}
                >
                    {/* Custom Month/Cycle Control Strip */}
                    <div className="glass-card sticky-control-bar" style={{
                        marginBottom: '48px',
                        padding: '24px 32px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'sticky',
                        top: '20px',
                        zIndex: 10,
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                        gap: '20px',
                        flexWrap: 'wrap'
                    }}>
                        <div className="cycle-controls-wrapper" style={{ display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                <label style={{ fontWeight: '800', color: 'var(--text-dark)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Billing Cycle
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-app)', borderRadius: '16px', padding: '4px', border: '1px solid var(--border-subtle)' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const d = new Date(currentMonth + '-01');
                                            d.setMonth(d.getMonth() - 1);
                                            router.push(`?month=${d.toISOString().slice(0, 7)}`);
                                        }}
                                        className="btn btn-secondary icon-btn"
                                        style={{ padding: '8px 12px', borderRadius: '12px', minWidth: '44px', minHeight: '44px', border: 'none' }}
                                    >
                                        ←
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowMonthGrid(true)}
                                        className="btn-cycle-display"
                                        style={{
                                            padding: '8px 24px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            fontWeight: '900',
                                            background: 'transparent',
                                            fontSize: '1.25rem',
                                            color: 'var(--primary)',
                                            minWidth: '180px',
                                            minHeight: '44px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s ease'
                                        }}
                                    >
                                        {months[currentMonthIdx]} {currentYear}
                                    </button>
                                    <input type="hidden" name="recordDate" value={currentMonth} />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const d = new Date(currentMonth + '-01');
                                            d.setMonth(d.getMonth() + 1);
                                            router.push(`?month=${d.toISOString().slice(0, 7)}`);
                                        }}
                                        className="btn btn-secondary icon-btn"
                                        style={{ padding: '8px 12px', borderRadius: '12px', minWidth: '44px', minHeight: '44px', border: 'none' }}
                                    >
                                        →
                                    </button>
                                </div>
                            </div>
                            <div className="rate-badges-wrapper" style={{ display: 'flex', gap: '12px' }}>
                                <div className="badge blue" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>⚡ ฿{apartment.defaultElecPrice} / unit</div>
                                <div className="badge blue" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>💧 ฿{apartment.defaultWaterPrice} / unit</div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-secondary" style={{ padding: '14px 32px', minHeight: '48px', borderRadius: '16px', fontWeight: '700' }}>
                            💾 Sync Draft
                        </button>
                    </div>

                    {/* Simplified List View */}
                    <div style={{ display: 'grid', gap: '24px' }}>
                        {sortedRooms.map((room) => {
                            const lastReading = room.readings[0];

                            // Real-time calculation logic
                            const prevElec = parseFloat(drafts[`prevElec_${room.id}`] || (lastReading?.elecMeter || 0).toString());
                            const currElec = parseFloat(drafts[`elec_${room.id}`] || '0');
                            const elecUsage = currElec > 0 ? (currElec - prevElec) : 0;
                            const isElecError = currElec > 0 && elecUsage < 0;

                            const prevWater = parseFloat(drafts[`prevWater_${room.id}`] || (lastReading?.waterMeter || 0).toString());
                            const currWater = parseFloat(drafts[`water_${room.id}`] || '0');
                            const waterUsage = currWater > 0 ? (currWater - prevWater) : 0;
                            const isWaterError = currWater > 0 && waterUsage < 0;

                            return (
                                <div key={room.id} className="card room-card-grid" style={{
                                    padding: '32px',
                                    display: 'grid',
                                    gridTemplateColumns: '120px 1fr 1fr',
                                    gap: '48px',
                                    alignItems: 'start',
                                    border: (isElecError || isWaterError) ? '2px solid var(--danger)' : '1px solid var(--border-subtle)',
                                    transition: 'all 0.2s ease',
                                    transform: drafts[`elec_${room.id}`] || drafts[`water_${room.id}`] ? 'scale(1.01)' : 'scale(1)',
                                    boxShadow: drafts[`elec_${room.id}`] || drafts[`water_${room.id}`] ? '0 10px 20px -10px rgba(0,0,0,0.1)' : 'none'
                                }}>
                                    <div style={{ paddingTop: '8px' }}>
                                        <h2 className="room-number-display" style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-dark)' }}>{room.roomNumber}</h2>
                                        <div className="badge" style={{ marginTop: '8px', fontSize: '0.75rem' }}>UNIT</div>
                                        <input type="hidden" name="roomIds[]" value={room.id} />
                                    </div>

                                    <div className="utility-meters-row" style={{ display: 'contents' }}>
                                        {/* Electricity Card */}
                                        <div style={{
                                            background: 'var(--bg-panel)',
                                            padding: '24px',
                                            borderRadius: '20px',
                                            border: isElecError ? '1px solid var(--danger)' : '1px solid transparent'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                                                <span style={{ fontWeight: '700', color: isElecError ? 'var(--danger)' : 'var(--text-dark)' }}>⚡ ELECTRICITY</span>
                                                {currElec > 0 && !isElecError && (
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: '700' }}>+ {elecUsage.toFixed(1)} units</span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                <div style={{ minWidth: '90px', flex: '0 0 auto' }}>
                                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px', display: 'block' }}>PREVIOUS</label>
                                                    <input
                                                        key={`prev_elec_${room.id}_${currentMonth}`}
                                                        type="number"
                                                        name={`prevElec_${room.id}`}
                                                        value={drafts[`prevElec_${room.id}`] !== undefined ? drafts[`prevElec_${room.id}`] : (lastReading?.elecMeter || 0)}
                                                        onChange={handleInputChange}
                                                        step="0.1"
                                                        style={{ width: '100%', padding: '10px', minHeight: '44px', borderRadius: '8px', border: '1px dashed var(--border-subtle)', background: 'transparent', textAlign: 'center' }}
                                                    />
                                                </div>
                                                <div style={{ flex: 1, minWidth: '140px' }}>
                                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px', display: 'block' }}>CURRENT</label>
                                                    <input
                                                        type="number"
                                                        name={`elec_${room.id}`}
                                                        value={drafts[`elec_${room.id}`] || ''}
                                                        onChange={handleInputChange}
                                                        onKeyDown={(e) => handleKeyDown(e, room.id, 'elec')}
                                                        step="0.1"
                                                        placeholder="0.0"
                                                        style={{
                                                            width: '100%',
                                                            fontSize: '1.5rem',
                                                            fontWeight: '800',
                                                            padding: '12px 20px',
                                                            minHeight: '56px',
                                                            borderRadius: '12px',
                                                            background: 'var(--bg-app)'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            {currElec > 0 && !isElecError && (
                                                <div style={{ marginTop: '16px', textAlign: 'right', fontWeight: '800', fontSize: '1.1rem' }}>
                                                    ฿{(elecUsage * apartment.defaultElecPrice).toLocaleString()}
                                                </div>
                                            )}
                                            {isElecError && (
                                                <div style={{ marginTop: '12px', color: 'var(--danger)', fontSize: '0.8rem', fontWeight: '600' }}>⚠️ Reading too low</div>
                                            )}
                                        </div>

                                        {/* Water Card */}
                                        <div style={{
                                            background: 'var(--bg-panel)',
                                            padding: '24px',
                                            borderRadius: '20px',
                                            border: isWaterError ? '1px solid var(--danger)' : '1px solid transparent'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                                                <span style={{ fontWeight: '700', color: isWaterError ? 'var(--danger)' : 'var(--text-dark)' }}>💧 WATER</span>
                                                {currWater > 0 && !isWaterError && (
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: '700' }}>+ {waterUsage.toFixed(0)} units</span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                <div style={{ minWidth: '90px', flex: '0 0 auto' }}>
                                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px', display: 'block' }}>PREVIOUS</label>
                                                    <input
                                                        key={`prev_water_${room.id}_${currentMonth}`}
                                                        type="number"
                                                        name={`prevWater_${room.id}`}
                                                        value={drafts[`prevWater_${room.id}`] !== undefined ? drafts[`prevWater_${room.id}`] : (lastReading?.waterMeter || 0)}
                                                        onChange={handleInputChange}
                                                        step="0.1"
                                                        style={{ width: '100%', padding: '10px', minHeight: '44px', borderRadius: '8px', border: '1px dashed var(--border-subtle)', background: 'transparent', textAlign: 'center' }}
                                                    />
                                                </div>
                                                <div style={{ flex: 1, minWidth: '140px' }}>
                                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px', display: 'block' }}>CURRENT</label>
                                                    <input
                                                        type="number"
                                                        name={`water_${room.id}`}
                                                        value={drafts[`water_${room.id}`] || ''}
                                                        onChange={handleInputChange}
                                                        onKeyDown={(e) => handleKeyDown(e, room.id, 'water')}
                                                        step="0.1"
                                                        placeholder="0.0"
                                                        style={{
                                                            width: '100%',
                                                            fontSize: '1.5rem',
                                                            fontWeight: '800',
                                                            padding: '12px 20px',
                                                            minHeight: '56px',
                                                            borderRadius: '12px',
                                                            background: 'var(--bg-app)'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            {currWater > 0 && !isWaterError && (
                                                <div style={{ marginTop: '16px', textAlign: 'right', fontWeight: '800', fontSize: '1.1rem' }}>
                                                    ฿{(waterUsage * apartment.defaultWaterPrice).toLocaleString()}
                                                </div>
                                            )}
                                            {isWaterError && (
                                                <div style={{ marginTop: '12px', color: 'var(--danger)', fontSize: '0.8rem', fontWeight: '600' }}>⚠️ Reading too low</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '20px 80px', minHeight: '64px', fontSize: '1.25rem', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(var(--primary-rgb), 0.3)' }}>
                            ✅ Finalize & Generate Invoices
                        </button>
                    </div>
                </form>
            </main>
        </>
    );
}
