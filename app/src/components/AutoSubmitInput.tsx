'use client'

import React from 'react';

interface AutoSubmitInputProps {
    name: string;
    type: string;
    defaultValue: string | number;
    style?: React.CSSProperties;
    placeholder?: string;
}

export default function AutoSubmitInput({ name, type, defaultValue, style, placeholder }: AutoSubmitInputProps) {
    return (
        <input
            name={name}
            type={type}
            defaultValue={defaultValue}
            style={style}
            placeholder={placeholder}
            onBlur={(e) => (e.target.form as HTMLFormElement).requestSubmit()}
        />
    );
}
