'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { togglePaymentStatus } from '@/app/actions/billing';
import { useI18n } from '@/providers/I18nProvider';

interface PaymentActionProps {
    reading: {
        id: string;
        isPaid: boolean;
        paymentMethod: string | null;
        paymentDate: Date | string | null;
        totalAmount: number;
    };
    apartmentId: string;
    roomNumber: string;
}

export default function PaymentAction({ reading, apartmentId, roomNumber }: PaymentActionProps) {
    const { t, lang } = useI18n();
    const [showConfirm, setShowConfirm] = useState(false);
    const [methodToConfirm, setMethodToConfirm] = useState<'CASH' | 'QR' | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleInitiatePayment = (method: 'CASH' | 'QR') => {
        setMethodToConfirm(method);
        setShowConfirm(true);
    };

    const handleConfirmPayment = async () => {
        if (!methodToConfirm) return;
        setIsPending(true);
        const formData = new FormData();
        formData.append('readingId', reading.id);
        formData.append('apartmentId', apartmentId);
        formData.append('action', 'PAY');
        formData.append('paymentMethod', methodToConfirm);

        await togglePaymentStatus(formData);
        setIsPending(false);
        setShowConfirm(false);
        setMethodToConfirm(null);
    };

    const handleUndoPayment = async () => {
        if (!confirm(t('confirm_undo_payment'))) return;

        setIsPending(true);
        const formData = new FormData();
        formData.append('readingId', reading.id);
        formData.append('apartmentId', apartmentId);
        formData.append('action', 'UNPAY');

        await togglePaymentStatus(formData);
        setIsPending(false);
    };

    if (reading.isPaid) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(var(--primary-rgb), 0.05)', padding: '12px 16px', borderRadius: '16px', minWidth: '140px' }}>
                    <div style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '900' }}>
                        {reading.paymentMethod === 'CASH' ? t('cash') : t('qr_code')}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
                        {new Date(reading.paymentDate!).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB')}
                    </div>
                </div>
                <button
                    onClick={handleUndoPayment}
                    disabled={isPending}
                    className="btn btn-secondary hover-effect"
                    style={{
                        padding: '12px',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--danger)'
                    }}
                    title={t('undo_payment')}
                >
                    ↩️
                </button>
            </div>
        );
    }

    return (
        <>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                    onClick={() => handleInitiatePayment('CASH')}
                    className="btn btn-secondary hover-effect"
                    style={{ padding: '12px 24px', fontSize: '0.9rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}
                >
                    💵 {t('cash')}
                </button>
                <button
                    onClick={() => handleInitiatePayment('QR')}
                    className="btn btn-primary hover-effect"
                    style={{ padding: '12px 24px', fontSize: '0.9rem', borderRadius: '12px' }}
                >
                    📱 {t('qr_code')}
                </button>
            </div>

            {showConfirm && mounted && createPortal(
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                }}>
                    <div className="glass-card animate-bounce-in" style={{
                        width: '90%',
                        maxWidth: '420px',
                        padding: '40px',
                        background: 'var(--bg-app)',
                        border: '1px solid var(--glass-border)',
                        boxShadow: '0 0 50px rgba(0,0,0,0.5), 0 0 20px rgba(var(--primary-rgb), 0.2)',
                        borderRadius: '24px'
                    }}>
                        <h3 style={{ fontSize: '1.75rem', marginBottom: '24px', textAlign: 'center', fontWeight: '900' }}>{t('confirm_payment')}</h3>

                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
                                {t('room_number')}: <span style={{ fontWeight: '900', color: 'var(--text-dark)' }}>{roomNumber}</span>
                            </div>
                            <div style={{ fontSize: '3.5rem', fontWeight: '950', color: 'var(--primary)', marginBottom: '12px', letterSpacing: '-2px' }}>
                                ฿{reading.totalAmount.toLocaleString()}
                            </div>
                            <div className="badge blue" style={{ display: 'inline-flex', fontSize: '1rem', padding: '10px 20px', borderRadius: '12px' }}>
                                {methodToConfirm === 'CASH' ? `💵 ${t('cash')}` : `📱 ${t('qr_code')}`}
                            </div>
                        </div>

                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1rem', lineHeight: '1.6' }}>
                            {t('confirm_payment_desc')}
                        </p>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="btn btn-secondary"
                                style={{ flex: 1, padding: '16px', borderRadius: '16px' }}
                                disabled={isPending}
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleConfirmPayment}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '16px', borderRadius: '16px', boxShadow: 'var(--shadow-glow)' }}
                                disabled={isPending}
                            >
                                {isPending ? t('pending') : t('confirm')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
