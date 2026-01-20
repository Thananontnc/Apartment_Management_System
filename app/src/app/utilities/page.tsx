import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import TranslatedText from '@/components/ui/TranslatedText';

export default async function UtilitySelectionPage() {
    const apartments = await prisma.apartment.findMany({
        include: { _count: { select: { rooms: true } } }
    });

    return (
        <main className="container animate-fade-in" style={{ paddingBottom: '6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '24px' }}>
                <BackButton label="Executive Dashboard" href="/" />
            </div>

            <header style={{ padding: '40px 0 60px 0' }}>
                <div className="flex-between">
                    <div>
                        <h1 className="text-gradient"><TranslatedText tKey="meter_hubs" /></h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '500', marginTop: '8px' }}><TranslatedText tKey="select_asset" /></p>
                    </div>
                </div>
            </header>

            <div className="grid-dashboard" style={{ marginTop: '12px' }}>
                {apartments.length === 0 ? (
                    <div className="glass-card flex-center" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 40px', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--primary-subtle)' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '32px', filter: 'drop-shadow(0 0 20px var(--primary-glow))' }}>🌆</div>
                        <h3 style={{ fontWeight: '950', fontSize: '2rem' }}><TranslatedText tKey="no_active_portfolios" /></h3>
                        <p style={{ marginTop: '12px', color: 'var(--text-muted)', maxWidth: '400px' }}><TranslatedText tKey="init_building" /></p>
                    </div>
                ) : (
                    apartments.map(apt => (
                        <Link href={`/utilities/${apt.id}`} key={apt.id} className="glass-card hover-effect" style={{ textDecoration: 'none', padding: '40px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '24px' }}>⚡</div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '950', marginBottom: '8px' }}>{apt.name}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500', minHeight: '3rem' }}>{apt.address}</p>
                            <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="badge blue" style={{ padding: '8px 16px', borderRadius: '10px' }}>{apt._count.rooms} Sensors</span>
                                <div className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '14px', fontSize: '0.9rem' }}>
                                    <TranslatedText tKey="record_meters" /> →
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </main>
    );
}
