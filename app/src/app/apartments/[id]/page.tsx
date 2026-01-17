import { prisma } from '@/lib/prisma';
import { createRoom, updateRoomStatus, deleteRoom, createBulkRooms } from '@/app/actions/rooms';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default async function ApartmentDetails({ params }: { params: { id: string } }) {
    const { id } = await params; // Await params in newer Next.js versions if needed, or straightforward destructuring
    const apartment = await prisma.apartment.findUnique({
        where: { id },
        include: {
            rooms: {
                orderBy: { roomNumber: 'asc' },
                include: { readings: { orderBy: { recordDate: 'desc' }, take: 1 } } // Get latest reading
            }
        }
    });

    if (!apartment) return <div className="container">Apartment not found</div>;

    // Sort rooms naturally (1, 2, 10 instead of 1, 10, 2)
    const sortedRooms = apartment.rooms.sort((a, b) =>
        a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
    );

    return (
        <main className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <header style={{ padding: '40px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <BackButton label="Back to Properties" />
                <div className="flex-between" style={{ marginTop: '16px' }}>
                    <div>
                        <h1 className="text-gradient">{apartment.name}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>{apartment.address}</p>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <div>Elec: <span className="text-primary">{apartment.defaultElecPrice}</span> THB</div>
                        <div>Water: <span className="text-primary">{apartment.defaultWaterPrice}</span> THB</div>
                    </div>
                </div>
            </header>

            <div className="grid-dashboard" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2>Rooms ({apartment.rooms.length})</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                        {sortedRooms.map(room => (
                            <div key={room.id} className="card" style={{ padding: '16px' }}>
                                <div className="flex-between">
                                    <h3 style={{ fontSize: '1.2rem' }}>{room.roomNumber}</h3>
                                    <span className={`badge ${room.status === 'OCCUPIED' ? 'green' : room.status === 'MAINTENANCE' ? 'red' : 'red'}`} style={{
                                        fontSize: '0.65rem',
                                        color: room.status === 'VACANT' ? '#a1a1aa' : undefined,
                                        borderColor: room.status === 'VACANT' ? '#3f3f46' : undefined,
                                        background: room.status === 'VACANT' ? 'rgba(63, 63, 70, 0.3)' : undefined
                                    }}>
                                        {room.status}
                                    </span>
                                </div>
                                <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <div>Fl. {room.floor}</div>
                                    <div style={{ marginTop: '4px', fontWeight: '500', color: '#fff' }}>฿{room.baseRent.toLocaleString()}</div>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <form action={updateRoomStatus} style={{ display: 'flex', gap: '8px' }}>
                                        <input type="hidden" name="roomId" value={room.id} />
                                        <input type="hidden" name="apartmentId" value={apartment.id} />
                                        <select
                                            name="status"
                                            defaultValue={room.status}
                                            style={{
                                                width: '90px',
                                                fontSize: '0.8rem',
                                                padding: '4px 8px',
                                                height: '28px'
                                            }}
                                        >
                                            <option value="VACANT">Vacant</option>
                                            <option value="OCCUPIED">Occupied</option>
                                            <option value="MAINTENANCE">Maint.</option>
                                        </select>
                                        <button type="submit" className="btn btn-primary" style={{ padding: '0 10px', fontSize: '0.8rem', height: '28px' }}>Set</button>
                                    </form>

                                    <form action={deleteRoom}>
                                        <input type="hidden" name="roomId" value={room.id} />
                                        <input type="hidden" name="apartmentId" value={apartment.id} />
                                        <button type="submit" className="btn" style={{ padding: '0', color: '#ef4444', height: '28px', background: 'transparent' }} title="Delete Room">
                                            🗑️
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <aside>
                    <div className="glass-card" style={{ position: 'sticky', top: '24px' }}>
                        <h3>Add Room</h3>
                        <form action={createRoom.bind(null, apartment.id)}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Room #</label>
                                <input name="roomNumber" required placeholder="e.g. 101" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Floor</label>
                                    <input name="floor" type="number" defaultValue="1" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Rent (฿)</label>
                                    <input name="baseRent" type="number" defaultValue="2800" />
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%' }}>Add Room</button>
                        </form>
                    </div>

                    <div className="glass-card" style={{ position: 'sticky', top: '24px', marginTop: '24px' }}>
                        <h3>Bulk Add Rooms</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Auto-create multiple rooms sequentially.</p>
                        <form action={createBulkRooms.bind(null, apartment.id)}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Start No.</label>
                                    <input name="startRoomNumber" type="number" required placeholder="e.g 201" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Count</label>
                                    <input name="count" type="number" required placeholder="e.g 5" defaultValue="5" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Floor</label>
                                    <input name="floor" type="number" defaultValue="2" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Rent</label>
                                    <input name="baseRent" type="number" defaultValue="2800" />
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', background: 'var(--bg-panel)', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                                + Auto Generate
                            </button>
                        </form>
                    </div>
                </aside>
            </div>
        </main>
    );
}
