'use client';

import React from 'react';
import AutoSubmitSelect from '@/components/AutoSubmitSelect';
import { updateRoomStatus } from '@/app/actions/rooms';
import { useI18n } from '@/providers/I18nProvider';

interface RoomStatusSelectorProps {
    roomId: string;
    apartmentId: string;
    currentStatus: string;
}

export default function RoomStatusSelector({ roomId, apartmentId, currentStatus }: RoomStatusSelectorProps) {
    const { t } = useI18n();

    const options = [
        { value: 'VACANT', label: t('vacant') },
        { value: 'OCCUPIED', label: t('occupied') },
        { value: 'MAINTENANCE', label: t('maintenance') }
    ];

    const getBadgeColor = (status: string) => {
        switch (status) {
            case 'OCCUPIED': return 'green';
            case 'VACANT': return 'red';
            case 'MAINTENANCE': return 'yellow';
            default: return 'gray';
        }
    };

    return (
        <form action={updateRoomStatus}>
            <input type="hidden" name="roomId" value={roomId} />
            <input type="hidden" name="apartmentId" value={apartmentId} />
            <AutoSubmitSelect
                key={currentStatus}
                name="status"
                defaultValue={currentStatus}
                className={`badge ${getBadgeColor(currentStatus)}`}
                style={{ width: 'auto', padding: '10px 16px', border: 'none', cursor: 'pointer', borderRadius: '12px', fontSize: '0.8rem' }}
                options={options}
            />
        </form>
    );
}
