import { prisma } from '@/lib/prisma';
import { createApartment, deleteApartment } from '@/app/actions/apartments';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default async function ApartmentsPage() {
    const apartments = await prisma.apartment.findMany({
        include: { _count: { select: { rooms: true } } }
    });

    return (
        <main className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <header className="" style={{ padding: '40px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ marginBottom: '16px' }}>
                    <BackButton label="Back to Dashboard" />
                </div>
                <div className="flex-between">
                    <div>
                        <h1 className="text-gradient">Properties</h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Manage your buildings and standard rates.</p>
                    </div>
                </div>
            </header>

            <div className="grid-dashboard" style={{ gridTemplateColumns: '2fr 1fr' }}>

                {/* List Section */}
                <section>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {apartments.length === 0 && (
                            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No apartments found. Add your first property!
                            </div>
                        )}

                        {apartments.map((apt) => (
                            <div key={apt.id} className="card flex-between">
                                <div>
                                    <h3 style={{ marginBottom: '4px' }}>{apt.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{apt.address}</p>
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <span>⚡ {apt.defaultElecPrice} THB/u</span>
                                        <span>💧 {apt.defaultWaterPrice} THB/u</span>
                                        <span>🏠 {apt._count.rooms} Rooms</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <Link href={`/apartments/${apt.id}`} className="btn" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}>
                                        Manage Rooms
                                    </Link>
                                    <form action={async () => {
                                        'use server';
                                        await deleteApartment(apt.id);
                                    }}>
                                        <button className="btn" style={{ color: '#ef4444', padding: '8px 12px' }}>✕</button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Add New Form */}
                <aside>
                    <div className="glass-card" style={{ position: 'sticky', top: '24px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Add Property</h3>
                        <form action={createApartment}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Property Name</label>
                                <input name="name" required placeholder="e.g. Sunrise View" />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Address</label>
                                <input name="address" required placeholder="e.g. 123 Main St" />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Number of Rooms (Optional)</label>
                                <input name="roomCount" type="number" placeholder="e.g. 10 (Auto-creates 1, 2...)" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Elec (THB)</label>
                                    <input name="elecPrice" type="number" step="0.1" defaultValue="7" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Water (THB)</label>
                                    <input name="waterPrice" type="number" step="0.1" defaultValue="18" />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Property</button>
                        </form>
                    </div>
                </aside>

            </div>
        </main>
    );
}
