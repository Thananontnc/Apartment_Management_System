'use client';

import React from 'react';
import { createRoom } from '@/app/actions/rooms';
import { useI18n } from '@/providers/I18nProvider';

interface CreateRoomFormProps {
    apartmentId: string;
}

export default function CreateRoomForm({ apartmentId }: CreateRoomFormProps) {
    const { t } = useI18n();

    return (
        <form action={createRoom.bind(null, apartmentId)} style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('unit_hash')}</label>
                    <input name="roomNumber" type="text" placeholder="101" required style={{ borderRadius: '14px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('allocated_rent')}</label>
                    <input name="baseRent" type="number" step="100" defaultValue="3500" required style={{ borderRadius: '14px' }} />
                </div>
            </div>
            <button type="submit" className="btn btn-secondary hover-effect" style={{ borderRadius: '14px', height: '56px', background: 'rgba(255,255,255,0.03)' }}>+ {t('finalize_asset')}</button>
        </form>
    );
}
