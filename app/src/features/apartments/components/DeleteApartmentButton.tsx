'use client';

import React from 'react';
import { deleteApartment } from '@/app/actions/apartments';
import { useI18n } from '@/providers/I18nProvider';

interface DeleteApartmentButtonProps {
    id: string;
    name: string;
}

export default function DeleteApartmentButton({ id, name }: DeleteApartmentButtonProps) {
    const { t } = useI18n();

    return (
        <form
            action={deleteApartment.bind(null, id)}
            onSubmit={(e) => {
                if (!confirm(t('confirm_delete_apartment', { name }))) {
                    e.preventDefault();
                }
            }}
        >
            <button
                type="submit"
                className="btn"
                style={{
                    borderRadius: '14px',
                    padding: '12px 20px',
                    background: 'var(--danger-bg)',
                    color: 'var(--danger)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    fontWeight: '800'
                }}
            >
                {t('remove')}
            </button>
        </form>
    );
}
