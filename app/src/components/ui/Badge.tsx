'use client';

import React from 'react';

type BadgeVariant = 'green' | 'red' | 'blue' | 'yellow';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    children: React.ReactNode;
}

export function Badge({ variant = 'blue', children, className, ...props }: BadgeProps) {
    return (
        <span className={`badge ${variant} ${className || ''}`} {...props}>
            {children}
        </span>
    );
}
