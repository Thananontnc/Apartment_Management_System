'use client';

import React from 'react';
import { updateApartment } from '@/app/actions/apartment-edit';
import { useI18n } from '@/providers/I18nProvider';

interface UpdateApartmentFormProps {
    apartment: {
        id: string;
        name: string;
        address: string | null;
        defaultElecPrice: number;
        defaultWaterPrice: number;
        defaultRent: number;
    };
}

export default function UpdateApartmentForm({ apartment }: UpdateApartmentFormProps) {
    const { t } = useI18n();

    return (
        <form action={updateApartment} style={{ display: 'grid', gap: '20px' }}>
            <input type="hidden" name="id" value={apartment.id} />
            <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('building_designation')}</label>
                <input name="name" type="text" defaultValue={apartment.name} required style={{ borderRadius: '14px' }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('physical_address')}</label>
                <input name="address" type="text" defaultValue={apartment.address || ''} style={{ borderRadius: '14px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('elec_rate')} (฿)</label>
                    <input name="elecRate" type="number" step="0.1" defaultValue={apartment.defaultElecPrice} style={{ borderRadius: '14px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('water_rate')} (฿)</label>
                    <input name="waterRate" type="number" step="0.1" defaultValue={apartment.defaultWaterPrice} style={{ borderRadius: '14px' }} />
                </div>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('base_monthly_rent')}</label>
                <input name="defaultRent" type="number" step="100" defaultValue={apartment.defaultRent} style={{ borderRadius: '14px' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px', height: '56px', borderRadius: '14px' }}>{t('save_changes')}</button>
        </form>
    );
}
