'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { useI18n } from '@/providers/I18nProvider';

export default function SettingsToggle() {
    const { theme, toggleTheme } = useTheme();
    const { lang, setLang } = useI18n();

    return (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', display: 'flex', gap: '12px', zIndex: 1000 }}>
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="glass-card hover-effect"
                style={{
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px'
                }}
                title="Toggle Theme"
            >
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Language Toggle */}
            <button
                onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
                className="glass-card hover-effect"
                style={{
                    padding: '12px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    fontSize: '0.8rem'
                }}
                title="Switch Language"
            >
                {lang === 'en' ? 'TH' : 'EN'}
            </button>
        </div>
    );
}
