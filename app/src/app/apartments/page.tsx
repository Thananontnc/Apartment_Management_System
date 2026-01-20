import { prisma } from '@/lib/prisma';
// createApartment removed from here as it's used in CreateApartmentForm now
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import DeleteApartmentButton from '@/features/apartments/components/DeleteApartmentButton';
import CreateApartmentForm from '@/features/apartments/components/CreateApartmentForm';
import TranslatedText from '@/components/ui/TranslatedText';
export default async function ApartmentsPage() {
    const apartments = await prisma.apartment.findMany({
        include: { _count: { select: { rooms: true } } }
    });

    return (
        <main className="container animate-fade-in" style={{ paddingBottom: '6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '24px' }}>
                <BackButton label="Executive Dashboard" href="/" />
            </div>

            <header style={{ padding: '40px 0 60px 0' }}>
                <div className="flex-between flex-wrap gap-24">
                    <div>
                        <h1 className="text-gradient"><TranslatedText tKey="real_estate_portfolio" /></h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '500', marginTop: '8px' }}>
                            <TranslatedText tKey="monitor_manage" />
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid-dashboard" style={{ gridTemplateColumns: '1.6fr 1fr', marginTop: '12px' }}>
                {/* List Section */}
                <section>
                    <div style={{ display: 'grid', gap: '24px' }}>
                        {apartments.length === 0 && (
                            <div className="glass-card flex-center" style={{ padding: '80px 40px', flexDirection: 'column', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--primary-subtle)' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '24px', filter: 'drop-shadow(0 0 15px var(--primary-glow))' }}>🏙️</div>
                                <h3 style={{ marginBottom: '12px', fontWeight: '900' }}><TranslatedText tKey="portfolio_empty" /></h3>
                            </div>
                        )}

                        {apartments.map((apt) => (
                            <div key={apt.id} className="glass-card hover-effect" style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                                    <div style={{ flex: '1', minWidth: '240px' }}>
                                        <h3 style={{ marginBottom: '8px', fontSize: '1.75rem', fontWeight: '950' }}>{apt.name}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                                            <span style={{ marginRight: '8px', opacity: 0.7 }}>📍</span> {apt.address}
                                        </p>
                                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                            <span className="badge blue" style={{ padding: '10px 20px', borderRadius: '12px' }}>
                                                {apt._count.rooms} <TranslatedText tKey="units_registered" />
                                            </span>
                                            <span className="badge green" style={{ padding: '10px 20px', borderRadius: '12px' }}>
                                                <TranslatedText tKey="active" />
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <Link href={`/apartments/${apt.id}/invoices`} className="btn btn-secondary" style={{ borderRadius: '14px', padding: '12px 20px' }}>
                                            📜 <TranslatedText tKey="ledger" />
                                        </Link>
                                        <Link href={`/apartments/${apt.id}`} className="btn btn-secondary" style={{ borderRadius: '14px', padding: '12px 20px' }}>
                                            ⚙️ <TranslatedText tKey="config" />
                                        </Link>
                                        <DeleteApartmentButton id={apt.id} name={apt.name} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Create Section */}
                <section>
                    <div className="glass-card" style={{ position: 'sticky', top: '40px', borderTop: '4px solid var(--primary)', background: 'linear-gradient(180deg, var(--bg-panel), rgba(var(--primary-rgb), 0.02))' }}>
                        <h3 style={{ marginBottom: '12px', fontWeight: '950' }}><TranslatedText tKey="expand_portfolio" /></h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}><TranslatedText tKey="onboard_property" /></p>
                        <CreateApartmentForm />
                    </div>
                </section>
            </div>
        </main>
    );
}
