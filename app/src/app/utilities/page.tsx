import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default async function UtilitySelectionPage() {
    const apartments = await prisma.apartment.findMany({
        include: { _count: { select: { rooms: true } } }
    });

    return (
        <main className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <header style={{ padding: '40px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ marginBottom: '16px' }}>
                    <BackButton label="Back to Dashboard" />
                </div>
                <h1 className="text-gradient">Utility Recording</h1>
                <p style={{ color: 'var(--text-muted)' }}>Select a property to record this month's meters.</p>
            </header>

            <div className="grid-dashboard">
                {apartments.map(apt => (
                    <Link key={apt.id} href={`/utilities/${apt.id}`} style={{ textDecoration: 'none' }}>
                        <div className="card glass-card hover-effect" style={{ transition: 'transform 0.2s' }}>
                            <h3>{apt.name}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{apt.address}</p>
                            <div style={{ marginTop: '16px' }} className="btn btn-primary">
                                Record Meters →
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
