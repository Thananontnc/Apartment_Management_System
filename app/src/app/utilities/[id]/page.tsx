'use server'
import { prisma } from '@/lib/prisma';
import { submitReadings } from '@/app/actions/utilities';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default async function RecordUtilitiesPage({ params }: { params: { id: string } }) {
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

    if (!apartment) return <div>Apartment not found</div>;

    return (
        <main className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <header style={{ padding: '40px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <BackButton label="Back to Selection" />
                <div className="flex-between" style={{ marginTop: '16px' }}>
                    <h1>Record: {apartment.name}</h1>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Rates</div>
                        <div>⚡ {apartment.defaultElecPrice} | 💧 {apartment.defaultWaterPrice}</div>
                    </div>
                </div>
            </header>

            <form action={submitReadings.bind(null, apartment.id)} style={{ marginTop: '32px' }}>
                <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-subtle)' }}>
                            <tr>
                                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Room</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Previous Elec</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>New Elec</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Previous Water</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>New Water</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apartment.rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })).map(room => {
                                const last = room.readings[0];
                                const prevElec = last?.elecMeter ?? 0;
                                const prevWater = last?.waterMeter ?? 0;

                                return (
                                    <tr key={room.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <td style={{ padding: '16px', fontWeight: 'bold' }}>{room.roomNumber}</td>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{prevElec}</td>
                                        <td style={{ padding: '16px' }}>
                                            <input
                                                name={`elec_${room.id}`}
                                                type="number" step="0.1"
                                                defaultValue={prevElec}
                                                style={{ width: '100px', padding: '8px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{prevWater}</td>
                                        <td style={{ padding: '16px' }}>
                                            <input
                                                name={`water_${room.id}`}
                                                type="number" step="0.1"
                                                defaultValue={prevWater}
                                                style={{ width: '100px', padding: '8px' }}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'right' }}>
                    <button type="submit" className="btn btn-primary">Save Readings & Generate Invoices</button>
                </div>
            </form>
        </main>
    );
}
