'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass';
    hoverEffect?: boolean;
    children: React.ReactNode;
}

export function Card({ variant = 'default', hoverEffect = false, className, children, ...props }: CardProps) {
    const variantClass = variant === 'glass' ? 'glass-card' : 'card';
    const hoverClass = hoverEffect ? 'hover-effect' : '';

    return (
        <div className={`${variantClass} ${hoverClass} ${className || ''}`} {...props}>
            {children}
        </div>
    );
}
