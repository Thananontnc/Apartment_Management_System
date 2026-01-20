'use client';

import React from 'react';
import { deleteRoom } from '@/app/actions/rooms';
import { useI18n } from '@/providers/I18nProvider';

interface DeleteRoomButtonProps {
    roomId: string;
    apartmentId: string;
    roomNumber: string;
}

export default function DeleteRoomButton({ roomId, apartmentId, roomNumber }: DeleteRoomButtonProps) {
    const { t } = useI18n();

    return (
        <form
            action={deleteRoom}
            onSubmit={(e) => {
                if (!confirm(t('confirm_delete_room', { number: roomNumber }))) {
                    e.preventDefault();
                }
            }}
        >
            <input type="hidden" name="roomId" value={roomId} />
            <input type="hidden" name="apartmentId" value={apartmentId} />
            <button
                type="submit"
                style={{
                    cursor: 'pointer',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    color: 'var(--danger)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    fontSize: '1.1rem',
                    transition: 'all 0.2s'
                }}
                className="hover-effect"
            >
                🗑️
            </button>
        </form>
    );
}
