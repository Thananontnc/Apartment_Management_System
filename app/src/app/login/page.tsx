'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/providers/I18nProvider";

export default function LoginPage() {
    const { t } = useI18n();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError(t('invalid_credentials'));
            setLoading(false);
        } else {
            router.push("/");
            router.refresh();
        }
    };

    return (
        <main className="container animate-fade-in" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top right, var(--primary-glow), transparent 40%), radial-gradient(circle at bottom left, var(--danger-bg), transparent 40%)'
        }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '48px' }}>
                <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '12px', fontSize: '2.5rem' }}>{t('app_name')}</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem' }}>{t('login_subtitle')}</p>

                {error && (
                    <div style={{
                        background: 'var(--danger-bg)',
                        color: 'var(--danger)',
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '24px',
                        fontSize: '0.95rem',
                        textAlign: 'center',
                        border: '1px solid var(--danger)',
                        fontWeight: '500'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-muted)' }}>{t('email_label')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-muted)' }}>{t('password_label')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '12px', padding: '16px' }}
                        disabled={loading}
                    >
                        {loading ? t('logging_in') : t('login_btn')}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {t('default_password_hint')} <b className="text-primary">password123</b>
                </div>
            </div>
        </main>
    );
}
