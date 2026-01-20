'use client';

import React from 'react';
import { createApartment } from '@/app/actions/apartments';
import { useI18n } from '@/providers/I18nProvider';

export default function CreateApartmentForm() {
    const { t } = useI18n();

    return (
        <form action={createApartment} style={{ display: 'grid', gap: '20px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('property_designation')}</label>
                <input name="name" type="text" placeholder={t('property_designation')} required style={{ borderRadius: '14px' }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('geographic_location')}</label>
                <textarea name="address" rows={3} placeholder={t('geographic_location')} style={{ borderRadius: '14px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('elec_rate')} (฿)</label>
                    <input name="elecRate" type="number" step="0.1" defaultValue="7.0" style={{ borderRadius: '14px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('water_rate')} (฿)</label>
                    <input name="waterRate" type="number" step="0.1" defaultValue="18.0" style={{ borderRadius: '14px' }} />
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('base_monthly_rent')}</label>
                    <input name="defaultRent" type="number" step="100" defaultValue="3500" style={{ borderRadius: '14px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('unit_capacity')}</label>
                    <input name="roomCount" type="number" placeholder={t('unit_capacity')} required style={{ borderRadius: '14px' }} />
                </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px', height: '60px', borderRadius: '16px' }}>
                {t('init_property')}
            </button>
        </form>
    );
}
