import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default async function BillingSelectionPage() {
    const apartments = await prisma.apartment.findMany({
        include: { _count: { select: { rooms: true } } }
    });

    return (
        <main className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '24px' }}>
                <BackButton label="Back to Dashboard" href="/" />
            </div>

            <header style={{ padding: '32px 0 40px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <h1 className="text-gradient">Billing & Payments</h1>
                <p style={{ color: 'var(--text-muted)' }}>Select a property to manage bill payments.</p>
            </header>

            <div className="grid-dashboard" style={{ marginTop: '40px' }}>
                {apartments.length === 0 ? (
                    <div className="card glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💰</div>
                        <h3>No properties available</h3>
                        <p style={{ marginTop: '8px' }}>Please add a property in the <Link href="/apartments" className="text-primary" style={{ fontWeight: '600' }}>Properties</Link> section first.</p>
                    </div>
                ) : (
                    apartments.map(apt => (
                        <Link href={`/billing/${apt.id}`} key={apt.id} className="glass-card link-card hover-effect" style={{ textDecoration: 'none' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{apt.name}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{apt.address}</p>
                            <div style={{ marginTop: '20px' }} className="btn btn-secondary">
                                Manage Billing →
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </main>
    );
}
