'use client';

import React from 'react';
import { useI18n } from '@/providers/I18nProvider';

interface TranslatedTextProps {
    tKey: string;
    defaultValue?: string;
    className?: string;
    style?: React.CSSProperties;
}

export default function TranslatedText({ tKey, defaultValue, className, style }: TranslatedTextProps) {
    const { t } = useI18n();
    const text = t(tKey);

    // If translation is missing (returns key) and we have a default, use default.
    // However, the provider returns key if missing.
    const displayText = text === tKey && defaultValue ? defaultValue : text;

    return <span className={className} style={style}>{displayText}</span>;
}
