'use client'

import React from 'react';

interface AutoSubmitSelectProps {
    name: string;
    defaultValue: string;
    className: string;
    style?: React.CSSProperties;
    options: { value: string; label: string }[];
}

export default function AutoSubmitSelect({ name, defaultValue, className, style, options }: AutoSubmitSelectProps) {
    return (
        <select
            name={name}
            defaultValue={defaultValue}
            className={className}
            style={style}
            onChange={(e) => (e.target.form as HTMLFormElement).requestSubmit()}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );
}
