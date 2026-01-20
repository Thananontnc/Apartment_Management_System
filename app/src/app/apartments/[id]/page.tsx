import { prisma } from '@/lib/prisma';
import { updateRoomRent } from '@/app/actions/rooms';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import AutoSubmitInput from '@/components/AutoSubmitInput';
import DeleteRoomButton from '@/features/apartments/components/DeleteRoomButton';
import TranslatedText from '@/components/ui/TranslatedText';
import UpdateApartmentForm from '@/features/apartments/components/UpdateApartmentForm';
import CreateRoomForm from '@/features/apartments/components/CreateRoomForm';
import BulkCreateRoomsForm from '@/features/apartments/components/BulkCreateRoomsForm';
import RoomStatusSelector from '@/features/apartments/components/RoomStatusSelector';

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
                <BackButton label={<TranslatedText tKey="back_to_properties" />} href="/apartments" />
            </div>

            <header style={{ padding: '40px 0 60px 0' }}>
                <div className="flex-between flex-wrap gap-24">
                    <div>
                        <h1 className="text-gradient" style={{ marginBottom: '8px' }}>{apartment.name} <TranslatedText tKey="configuration" /></h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '500' }}>📍 {apartment.address}</p>
                    </div>
                    <Link href={`/apartments/${apartment.id}/invoices`} className="btn btn-secondary hover-effect" style={{ borderRadius: '16px', background: 'var(--bg-panel)' }}>
                        📜 <TranslatedText tKey="audit_ledger" />
                    </Link>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '48px', marginTop: '48px' }}>
                {/* Left Side: Apartment Management */}
                <section style={{ display: 'grid', gap: '32px' }}>
                    {/* Settings */}
                    <div className="glass-card" style={{ borderTop: '4px solid var(--primary)', background: 'linear-gradient(180deg, var(--bg-panel), rgba(var(--primary-rgb), 0.02))' }}>
                        <h3 style={{ marginBottom: '12px', fontWeight: '950' }}><TranslatedText tKey="property_metadata" /></h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}><TranslatedText tKey="monitor_manage" /></p>
                        <UpdateApartmentForm apartment={apartment} />
                    </div>

                    {/* Add Single Room */}
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '12px', fontWeight: '950' }}><TranslatedText tKey="register_new_unit" /></h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}><TranslatedText tKey="manage_rooms_desc" /></p>
                        <CreateRoomForm apartmentId={apartment.id} />
                    </div>

                    {/* Bulk Add */}
                    <div className="glass-card" style={{ border: '2px dashed var(--primary-subtle)', background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), transparent)' }}>
                        <h3 style={{ marginBottom: '8px', fontWeight: '950', display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '12px' }}>🧱</span> <TranslatedText tKey="batch_propagation" />
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Quickly generate multiple units. Pattern: <code style={{ color: 'var(--primary)', fontWeight: '700' }}>"201-210"</code></p>
                        <BulkCreateRoomsForm apartmentId={apartment.id} />
                    </div>
                </section>

                {/* Right Side: Room List */}
                <section>
                    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '32px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-panel)' }}>
                            <div className="flex-between">
                                <h3 style={{ fontWeight: '950', fontSize: '1.5rem' }}><TranslatedText tKey="asset_inventory" /></h3>
                                <span className="badge blue" style={{ padding: '8px 16px', borderRadius: '10px' }}>{sortedRooms.length} <TranslatedText tKey="units_registered" /></span>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(var(--primary-rgb), 0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <th style={{ padding: '20px 32px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}><TranslatedText tKey="unit_hash" /></th>
                                        <th style={{ padding: '20px 32px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}><TranslatedText tKey="operational_status" /></th>
                                        <th style={{ padding: '20px 32px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}><TranslatedText tKey="current_rent" /></th>
                                        <th style={{ padding: '20px 32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}><TranslatedText tKey="archival" /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedRooms.map(room => (
                                        <tr key={room.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '24px 32px' }}>
                                                <div style={{ fontWeight: '950', fontSize: '1.4rem', color: 'var(--text-dark)' }}>{room.roomNumber}</div>
                                            </td>
                                            <td style={{ padding: '24px 32px' }}>
                                                <RoomStatusSelector roomId={room.id} apartmentId={apartment.id} currentStatus={room.status} />
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
                                                <DeleteRoomButton roomId={room.id} apartmentId={apartment.id} roomNumber={room.roomNumber} />
                                            </td>
                                        </tr>
                                    ))}
                                    {sortedRooms.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
                                                <p style={{ fontWeight: '600' }}><TranslatedText tKey="no_units_found" /></p>
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
