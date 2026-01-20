import { prisma } from '@/lib/prisma';
import { createApartment, deleteApartment } from '@/app/actions/apartments';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default async function ApartmentsPage() {
    const apartments = await prisma.apartment.findMany({
        include: { _count: { select: { rooms: true } } }
    });

    return (
        <main className="container animate-fade-in" style={{ paddingBottom: '6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '24px' }}>
                <BackButton label="Executive Dashboard" href="/" />
            </div>

            <header style={{ padding: '40px 0 60px 0' }}>
                <div className="flex-between flex-wrap gap-24">
                    <div>
                        <h1 className="text-gradient">Real Estate Portfolio</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '500', marginTop: '8px' }}>
                            Monitor and manage your property assets and operational rates.
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid-dashboard" style={{ gridTemplateColumns: '1.6fr 1fr', marginTop: '12px' }}>
                {/* List Section */}
                <section>
                    <div style={{ display: 'grid', gap: '24px' }}>
                        {apartments.length === 0 && (
                            <div className="glass-card flex-center" style={{ padding: '80px 40px', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--primary-subtle)' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '24px', filter: 'drop-shadow(0 0 15px var(--primary-glow))' }}>🏙️</div>
                                <h3 style={{ marginBottom: '12px', fontWeight: '900' }}>Portfolio Empty</h3>
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '300px' }}>Begin your journey by registering your first property using the portal on the right.</p>
                            </div>
                        )}

                        {apartments.map((apt) => (
                            <div key={apt.id} className="glass-card hover-effect" style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                                    <div style={{ flex: '1', minWidth: '240px' }}>
                                        <h3 style={{ marginBottom: '8px', fontSize: '1.75rem', fontWeight: '950' }}>{apt.name}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                                            <span style={{ marginRight: '8px', opacity: 0.7 }}>📍</span> {apt.address}
                                        </p>
                                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                            <span className="badge blue" style={{ padding: '10px 20px', borderRadius: '12px' }}>
                                                {apt._count.rooms} Units Registered
                                            </span>
                                            <span className="badge green" style={{ padding: '10px 20px', borderRadius: '12px' }}>
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <Link href={`/apartments/${apt.id}/invoices`} className="btn btn-secondary" style={{ borderRadius: '14px', padding: '12px 20px' }}>
                                            📜 Ledger
                                        </Link>
                                        <Link href={`/apartments/${apt.id}`} className="btn btn-secondary" style={{ borderRadius: '14px', padding: '12px 20px' }}>
                                            ⚙️ Config
                                        </Link>
                                        <form action={deleteApartment.bind(null, apt.id)} onSubmit={(e) => {
                                            if (!confirm(`Are you sure you want to decommission ${apt.name}? All historical data will be archived.`)) e.preventDefault();
                                        }}>
                                            <button type="submit" className="btn" style={{
                                                borderRadius: '14px',
                                                padding: '12px 20px',
                                                background: 'var(--danger-bg)',
                                                color: 'var(--danger)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                fontWeight: '800'
                                            }}>Remove</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Create Section */}
                <section>
                    <div className="glass-card" style={{ position: 'sticky', top: '40px', borderTop: '4px solid var(--primary)', background: 'linear-gradient(180deg, var(--bg-panel), rgba(var(--primary-rgb), 0.02))' }}>
                        <h3 style={{ marginBottom: '12px', fontWeight: '950' }}>Expand Portfolio</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>Onboard a new property and define its standard operating parameters.</p>
                        <form action={createApartment} style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Property Designation</label>
                                <input name="name" type="text" placeholder="e.g. Royal Heights Towers" required style={{ borderRadius: '14px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Geographic Location</label>
                                <textarea name="address" rows={3} placeholder="Full building address..." style={{ borderRadius: '14px' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Electricity (฿/Unit)</label>
                                    <input name="elecRate" type="number" step="0.1" defaultValue="7.0" style={{ borderRadius: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Water (฿/Unit)</label>
                                    <input name="waterRate" type="number" step="0.1" defaultValue="18.0" style={{ borderRadius: '14px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Base Rent (฿)</label>
                                    <input name="defaultRent" type="number" step="100" defaultValue="3500" style={{ borderRadius: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unit Capacity</label>
                                    <input name="roomCount" type="number" placeholder="Total rooms" required style={{ borderRadius: '14px' }} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px', height: '60px', borderRadius: '16px' }}>
                                Initialize Property Assets
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    );
}
