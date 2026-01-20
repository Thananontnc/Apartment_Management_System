'use client';

import React from 'react';
import { createBulkRooms } from '@/app/actions/rooms';
import { useI18n } from '@/providers/I18nProvider';

interface BulkCreateRoomsFormProps {
    apartmentId: string;
}

export default function BulkCreateRoomsForm({ apartmentId }: BulkCreateRoomsFormProps) {
    const { t } = useI18n();

    return (
        <form action={createBulkRooms.bind(null, apartmentId)} style={{ display: 'grid', gap: '16px' }}>
            <input name="roomPattern" type="text" placeholder="e.g. 101-120" required style={{ borderRadius: '14px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
                <input name="baseRent" type="number" step="100" defaultValue="3500" style={{ flex: 1, borderRadius: '14px' }} />
                <button type="submit" className="btn btn-secondary" style={{ borderRadius: '14px', background: 'var(--bg-panel)' }}>{t('batch_propagation')}</button>
            </div>
        </form>
    );
}
