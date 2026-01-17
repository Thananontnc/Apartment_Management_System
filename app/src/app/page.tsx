import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function Dashboard() {
  const apartments = await prisma.apartment.findMany({
    include: {
      rooms: {
        orderBy: { roomNumber: 'asc' }
      }
    }
  });

  // Calculate basic KPIs
  const totalApartments = await prisma.apartment.count();
  const totalRooms = await prisma.room.count();
  const occupiedRooms = await prisma.room.count({ where: { status: 'OCCUPIED' } });

  // Example Revenue (Sum of all latest Invoice totals? Or just base rent for now?)
  // For Real KPI we need to sum invoices. Let's just sum Base Rent of occupied rooms for "Projected Rent"
  const rentAggregation = await prisma.room.aggregate({
    _sum: { baseRent: true },
    where: { status: 'OCCUPIED' }
  });

  const projectedRevenue = rentAggregation._sum.baseRent || 0;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Header Section */}
      <header className="flex-between" style={{ padding: '40px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <h1 className="text-gradient">Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Welcome back. Here is your business at a glance.</p>
        </div>
        <Link href="/apartments" className="btn btn-primary">
          + Add Property
        </Link>
      </header>

      {/* KPI Cards */}
      <section className="grid-dashboard">
        <div className="glass-card">
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Projected Revenue</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', marginTop: '8px', color: '#fff' }}>฿{projectedRevenue.toLocaleString()}</div>
          <div style={{ marginTop: '12px', fontSize: '0.9rem' }}>
            Monthly Base Rent
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Occupancy Rate</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', marginTop: '8px', color: '#fff' }}>{occupancyRate}%</div>
          <div style={{ marginTop: '12px', fontSize: '0.9rem' }}>
            {occupiedRooms} / {totalRooms} Rooms Occupied
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Properties</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', marginTop: '8px', color: '#fff' }}>{totalApartments}</div>
          <div style={{ marginTop: '12px', fontSize: '0.9rem' }}>
            Active Buildings
          </div>
        </div>
      </section>

      {/* Quick Actions for Utilities */}
      <section style={{ marginTop: '48px' }}>
        <h2>Quick Actions</h2>
        <div className="grid-dashboard">
          <Link href="/utilities" className="glass-card hover-primary" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>⚡ Utility Manager</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Record meters and generate invoices for this month.</p>
          </Link>
          <Link href="/apartments" className="glass-card hover-primary" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>🏢 Property Manager</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Add new rooms, adjust rent prices, or add new buildings.</p>
          </Link>
        </div>
      </section>

      {/* Property Overview */}
      <section style={{ marginTop: '48px' }}>
        <h2 style={{ marginBottom: '24px' }}>Property Overview</h2>

        {apartments.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No properties found. <Link href="/apartments" className="text-primary">Add one now</Link>.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '32px' }}>
            {apartments.map((apt) => (
              <div key={apt.id} className="glass-card">
                <div className="flex-between" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem' }}>{apt.name}</h3>
                    <p style={{ color: 'var(--text-muted)' }}>{apt.address}</p>
                  </div>
                  <Link href={`/apartments/${apt.id}`} className="btn" style={{ fontSize: '0.85rem', padding: '8px 16px', background: 'var(--bg-app)' }}>
                    Manage Details
                  </Link>
                </div>

                {/* Rooms Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                  {apt.rooms.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', color: 'var(--text-muted)', fontStyle: 'italic' }}>No rooms added yet.</div>
                  ) : (
                    apt.rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })).map(room => (
                      <div key={room.id} className="card" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                        <div className="flex-between">
                          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{room.roomNumber}</span>
                          <span className={`badge ${room.status === 'OCCUPIED' ? 'green' : 'red'}`} style={{ fontSize: '0.65rem' }}>
                            {room.status}
                          </span>
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          ฿{room.baseRent.toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}
