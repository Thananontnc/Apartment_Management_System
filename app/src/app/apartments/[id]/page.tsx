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
        <main className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '24px' }}>
                <BackButton label="Back to Properties" href="/apartments" />
            </div>

            <header style={{ padding: '32px 0 60px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex-between">
                    <div>
                        <h1 className="text-gradient">{apartment.name}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>{apartment.address}</p>
                    </div>
                    <Link href={`/apartments/${apartment.id}/invoices`} className="btn btn-secondary">
                        📜 View Past Invoices & History
                    </Link>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '48px', marginTop: '48px' }}>
                {/* Left Side: Apartment Management */}
                <section style={{ display: 'grid', gap: '32px' }}>
                    {/* Settings */}
                    <div className="card glass-card">
                        <h3 style={{ marginBottom: '24px' }}>Default Settings</h3>
                        <form action={updateApartment} style={{ display: 'grid', gap: '20px' }}>
                            <input type="hidden" name="id" value={apartment.id} />
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Building Name</label>
                                <input name="name" type="text" defaultValue={apartment.name} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Address</label>
                                <input name="address" type="text" defaultValue={apartment.address || ''} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Elec. Rate (฿)</label>
                                    <input name="elecRate" type="number" step="0.1" defaultValue={apartment.defaultElecPrice} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Water Rate (฿)</label>
                                    <input name="waterRate" type="number" step="0.1" defaultValue={apartment.defaultWaterPrice} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Base Rent (฿)</label>
                                    <input name="defaultRent" type="number" step="100" defaultValue={apartment.defaultRent} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-secondary">Update Settings</button>
                        </form>
                    </div>

                    {/* Add Single Room */}
                    <div className="card">
                        <h3 style={{ marginBottom: '24px' }}>Add Single Room</h3>
                        <form action={createRoom.bind(null, apartment.id)} style={{ display: 'grid', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem' }}>Room #</label>
                                    <input name="roomNumber" type="text" placeholder="101" required />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem' }}>Monthly Rent (฿)</label>
                                    <input name="baseRent" type="number" step="100" defaultValue="3500" required />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">+ Add Room</button>
                        </form>
                    </div>

                    {/* Bulk Add */}
                    <div className="card" style={{ border: '1px dashed var(--primary)' }}>
                        <h3 style={{ marginBottom: '16px' }}>Bulk Generating</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Example: "101,102,103,104" or "201-210"</p>
                        <form action={createBulkRooms.bind(null, apartment.id)} style={{ display: 'grid', gap: '16px' }}>
                            <input name="roomPattern" type="text" placeholder="101-110" required />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input name="baseRent" type="number" step="100" defaultValue="3500" style={{ flex: 1 }} />
                                <button type="submit" className="btn btn-secondary">Generate Batch</button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Right Side: Room List */}
                <section>
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Room Inventory
                                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{sortedRooms.length} Total</span>
                            </h3>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--bg-panel)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <tr>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Number</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '16px', textAlign: 'right' }}>Rent</th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedRooms.map(room => (
                                    <tr key={room.id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="hover-row">
                                        <td style={{ padding: '16px', fontWeight: '700' }}>{room.roomNumber}</td>
                                        <td style={{ padding: '16px' }}>
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
                                                    style={{ width: 'auto', padding: '4px 12px', border: 'none', cursor: 'pointer' }}
                                                    options={[
                                                        { value: 'VACANT', label: 'VACANT' },
                                                        { value: 'OCCUPIED', label: 'OCCUPIED' },
                                                        { value: 'MAINTENANCE', label: 'MAINTENANCE' }
                                                    ]}
                                                />
                                            </form>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <form action={updateRoomRent} style={{ display: 'inline' }}>
                                                <input type="hidden" name="roomId" value={room.id} />
                                                <input type="hidden" name="apartmentId" value={apartment.id} />
                                                <AutoSubmitInput
                                                    key={room.baseRent}
                                                    name="baseRent"
                                                    type="number"
                                                    defaultValue={room.baseRent}
                                                    style={{ width: '90px', padding: '4px', textAlign: 'right', border: 'none', background: 'transparent', fontWeight: 'bold' }}
                                                />
                                            </form>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <form action={deleteRoom}>
                                                <input type="hidden" name="roomId" value={room.id} />
                                                <input type="hidden" name="apartmentId" value={apartment.id} />
                                                <button type="submit" style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--danger)' }}>🗑️</button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                                {sortedRooms.length === 0 && (
                                    <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No rooms added yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
}
