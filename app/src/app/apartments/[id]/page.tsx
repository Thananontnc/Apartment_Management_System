import { prisma } from '@/lib/prisma';
import { createRoom, updateRoomStatus, deleteRoom, createBulkRooms, updateRoomRent } from '@/app/actions/rooms';
import { updateApartment } from '@/app/actions/apartment-edit';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import AutoSubmitSelect from '@/components/AutoSubmitSelect';
import AutoSubmitInput from '@/components/AutoSubmitInput';

export default async function ApartmentDetails({ params }: { params: { id: string } }) {
    const { id } = await params;
    const apartment = await prisma.apartment.findUnique({
        where: { id },
        include: {
            rooms: {
                orderBy: { roomNumber: 'asc' },
                include: { readings: { orderBy: { recordDate: 'desc' }, take: 1 } }
            }
        }
    });

    if (!apartment) return <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}><h2>Apartment not found</h2></div>;

    const sortedRooms = [...apartment.rooms].sort((a, b) => {
        const numA = parseInt(a.roomNumber.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.roomNumber.replace(/\D/g, '')) || 0;
        return numA - numB;
    });

    return (
        <main className="container animate-fade-in" style={{ paddingBottom: '8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '24px' }}>
                <BackButton label="Portfolio Overview" href="/apartments" />
            </div>

            <header style={{ padding: '40px 0 60px 0' }}>
                <div className="flex-between flex-wrap gap-24">
                    <div>
                        <h1 className="text-gradient" style={{ marginBottom: '8px' }}>{apartment.name} Configuration</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '500' }}>📍 {apartment.address}</p>
                    </div>
                    <Link href={`/apartments/${apartment.id}/invoices`} className="btn btn-secondary hover-effect" style={{ borderRadius: '16px', background: 'var(--bg-panel)' }}>
                        📜 Audit Historical Ledger
                    </Link>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '48px', marginTop: '48px' }}>
                {/* Left Side: Apartment Management */}
                <section style={{ display: 'grid', gap: '32px' }}>
                    {/* Settings */}
                    <div className="glass-card" style={{ borderTop: '4px solid var(--primary)', background: 'linear-gradient(180deg, var(--bg-panel), rgba(var(--primary-rgb), 0.02))' }}>
                        <h3 style={{ marginBottom: '12px', fontWeight: '950' }}>Property Metadata</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}>Core operational rates and building identifiers.</p>
                        <form action={updateApartment} style={{ display: 'grid', gap: '20px' }}>
                            <input type="hidden" name="id" value={apartment.id} />
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Building Designation</label>
                                <input name="name" type="text" defaultValue={apartment.name} required style={{ borderRadius: '14px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Physical Address</label>
                                <input name="address" type="text" defaultValue={apartment.address || ''} style={{ borderRadius: '14px' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Elec. (฿)</label>
                                    <input name="elecRate" type="number" step="0.1" defaultValue={apartment.defaultElecPrice} style={{ borderRadius: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Water (฿)</label>
                                    <input name="waterRate" type="number" step="0.1" defaultValue={apartment.defaultWaterPrice} style={{ borderRadius: '14px' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Base Monthly Rent (฿)</label>
                                <input name="defaultRent" type="number" step="100" defaultValue={apartment.defaultRent} style={{ borderRadius: '14px' }} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px', height: '56px', borderRadius: '14px' }}>Authorize Update</button>
                        </form>
                    </div>

                    {/* Add Single Room */}
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '12px', fontWeight: '950' }}>Register New Unit</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}>Individually append a new room to the property inventory.</p>
                        <form action={createRoom.bind(null, apartment.id)} style={{ display: 'grid', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unit #</label>
                                    <input name="roomNumber" type="text" placeholder="101" required style={{ borderRadius: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Allocated Rent</label>
                                    <input name="baseRent" type="number" step="100" defaultValue="3500" required style={{ borderRadius: '14px' }} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-secondary hover-effect" style={{ borderRadius: '14px', height: '56px', background: 'rgba(255,255,255,0.03)' }}>+ Finalize Asset</button>
                        </form>
                    </div>

                    {/* Bulk Add */}
                    <div className="glass-card" style={{ border: '2px dashed var(--primary-subtle)', background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), transparent)' }}>
                        <h3 style={{ marginBottom: '8px', fontWeight: '950', display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '12px' }}>🧱</span> Batch Propagation
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Quickly generate multiple units. Pattern: <code style={{ color: 'var(--primary)', fontWeight: '700' }}>"201-210"</code></p>
                        <form action={createBulkRooms.bind(null, apartment.id)} style={{ display: 'grid', gap: '16px' }}>
                            <input name="roomPattern" type="text" placeholder="e.g. 101-120" required style={{ borderRadius: '14px' }} />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input name="baseRent" type="number" step="100" defaultValue="3500" style={{ flex: 1, borderRadius: '14px' }} />
                                <button type="submit" className="btn btn-secondary" style={{ borderRadius: '14px', background: 'var(--bg-panel)' }}>Generate Batch</button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Right Side: Room List */}
                <section>
                    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '32px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-panel)' }}>
                            <div className="flex-between">
                                <h3 style={{ fontWeight: '950', fontSize: '1.5rem' }}>Asset Inventory</h3>
                                <span className="badge blue" style={{ padding: '8px 16px', borderRadius: '10px' }}>{sortedRooms.length} Registered Units</span>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(var(--primary-rgb), 0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <th style={{ padding: '20px 32px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}>Unit Number</th>
                                        <th style={{ padding: '20px 32px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}>Operational Status</th>
                                        <th style={{ padding: '20px 32px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}>Current Rent</th>
                                        <th style={{ padding: '20px 32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}>Archival</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedRooms.map(room => (
                                        <tr key={room.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '24px 32px' }}>
                                                <div style={{ fontWeight: '950', fontSize: '1.4rem', color: 'var(--text-dark)' }}>{room.roomNumber}</div>
                                            </td>
                                            <td style={{ padding: '24px 32px' }}>
                                                <form action={updateRoomStatus}>
                                                    <input type="hidden" name="roomId" value={room.id} />
                                                    <input type="hidden" name="apartmentId" value={apartment.id} />
                                                    <AutoSubmitSelect
                                                        key={room.status}
                                                        name="status"
                                                        defaultValue={room.status}
                                                        className={`badge ${room.status === 'OCCUPIED' ? 'green' :
                                                            room.status === 'VACANT' ? 'red' :
                                                                'yellow'
                                                            }`}
                                                        style={{ width: 'auto', padding: '10px 16px', border: 'none', cursor: 'pointer', borderRadius: '12px', fontSize: '0.8rem' }}
                                                        options={[
                                                            { value: 'VACANT', label: 'VACANT' },
                                                            { value: 'OCCUPIED', label: 'OCCUPIED' },
                                                            { value: 'MAINTENANCE', label: 'SERVICE' }
                                                        ]}
                                                    />
                                                </form>
                                            </td>
                                            <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                                                <form action={updateRoomRent} style={{ display: 'inline' }}>
                                                    <input type="hidden" name="roomId" value={room.id} />
                                                    <input type="hidden" name="apartmentId" value={apartment.id} />
                                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                                        <span style={{ position: 'absolute', left: '-20px', top: '2px', color: 'var(--text-muted)', fontWeight: '700' }}>฿</span>
                                                        <AutoSubmitInput
                                                            key={room.baseRent}
                                                            name="baseRent"
                                                            type="number"
                                                            defaultValue={room.baseRent}
                                                            style={{
                                                                width: '100px',
                                                                padding: '6px 0',
                                                                textAlign: 'right',
                                                                border: 'none',
                                                                background: 'transparent',
                                                                fontWeight: '900',
                                                                fontSize: '1.2rem',
                                                                color: 'var(--text-dark)'
                                                            }}
                                                        />
                                                    </div>
                                                </form>
                                            </td>
                                            <td style={{ padding: '24px 32px', textAlign: 'center' }}>
                                                <form action={deleteRoom} onSubmit={(e) => {
                                                    if (!confirm(`Permanently remove Unit ${room.roomNumber}?`)) e.preventDefault();
                                                }}>
                                                    <input type="hidden" name="roomId" value={room.id} />
                                                    <input type="hidden" name="apartmentId" value={apartment.id} />
                                                    <button type="submit" style={{ cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', width: '40px', height: '40px', borderRadius: '10px', fontSize: '1.1rem', transition: 'all 0.2s' }} className="hover-effect">🗑️</button>
                                                </form>
                                            </td>
                                        </tr>
                                    ))}
                                    {sortedRooms.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
                                                <p style={{ fontWeight: '600' }}>No units found in this property asset inventory.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
