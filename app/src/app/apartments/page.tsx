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
            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '24px' }}>
                <BackButton label="Back to Dashboard" href="/" />
            </div>

            <header style={{ padding: '32px 0 40px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex-between">
                    <div>
                        <h1 className="text-gradient">Properties</h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Manage your buildings and standard rates.</p>
                    </div>
                </div>
            </header>

            <div className="grid-dashboard" style={{ gridTemplateColumns: '2fr 1fr', marginTop: '40px' }}>
                {/* List Section */}
                <section>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {apartments.length === 0 && (
                            <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border-subtle)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏢</div>
                                <h3 style={{ marginBottom: '8px' }}>No properties found</h3>
                                <p>Start by adding your first apartment building on the right.</p>
                            </div>
                        )}

                        {apartments.map((apt) => (
                            <div key={apt.id} className="card flex-between">
                                <div>
                                    <h3 style={{ marginBottom: '4px' }}>{apt.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{apt.address}</p>
                                    <div style={{ marginTop: '12px', fontSize: '0.85rem' }}>
                                        <span className="badge green">{apt._count.rooms} Rooms</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <Link href={`/apartments/${apt.id}/invoices`} className="btn btn-secondary">📜 History</Link>
                                    <Link href={`/apartments/${apt.id}`} className="btn btn-secondary">Edit Info</Link>
                                    <form action={deleteApartment.bind(null, apt.id)}>
                                        <button type="submit" className="btn" style={{ color: 'var(--danger)', border: '1px solid var(--danger-bg)' }}>Delete</button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Create Section */}
                <section>
                    <div className="card glass-card">
                        <h3 style={{ marginBottom: '24px' }}>Add New Building</h3>
                        <form action={createApartment} style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Apartment Name</label>
                                <input name="name" type="text" placeholder="Green View Apartment" required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Address</label>
                                <textarea name="address" rows={3} placeholder="123 Sukhumvit Road..." />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Elec Rate (฿)</label>
                                    <input name="elecRate" type="number" step="0.1" defaultValue="7.0" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Water Rate (฿)</label>
                                    <input name="waterRate" type="number" step="0.1" defaultValue="18.0" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Base Rent (฿)</label>
                                    <input name="defaultRent" type="number" step="100" defaultValue="3500" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Room Count</label>
                                    <input name="roomCount" type="number" placeholder="e.g. 10" />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
                                Create Property
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    );
}
