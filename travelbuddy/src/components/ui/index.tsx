// components/ui/index.tsx
import React from 'react';
import Image from 'next/image';

/**
 * Avatar component for user profiles
 */
export const Avatar = ({
    src,
    alt,
    size = 'md',
    bordered = false,
    borderColor = 'default'
}: {
    src?: string | null,
    alt: string,
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl',
    bordered?: boolean,
    borderColor?: 'default' | 'primary' | 'white'
}) => {
    const letter = alt.charAt(0).toUpperCase();

    // Get the correct size class
    const sizeClass = {
        'xs': 'avatar-xs',
        'sm': 'avatar-sm',
        'md': 'avatar-md',
        'lg': 'avatar-lg',
        'xl': 'avatar-xl',
        '2xl': 'avatar-2xl'
    }[size];

    // Get the correct border class
    let borderClass = '';
    if (bordered) {
        borderClass = {
            'default': 'avatar-bordered',
            'primary': 'avatar-bordered-primary',
            'white': 'avatar-bordered-white'
        }[borderColor];
    }

    if (!src) {
        return (
            <div className={`avatar avatar-placeholder ${sizeClass} ${borderClass}`}>
                {letter}
            </div>
        );
    }

    return (
        <div className={`avatar ${sizeClass} ${borderClass}`}>
            <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
            />
        </div>
    );
};

/**
 * Button component with variants
 */
export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    type = 'button',
    className = '',
    ...props
}: {
    children: React.ReactNode,
    variant?: 'primary' | 'secondary' | 'outline' | 'danger',
    size?: 'sm' | 'md' | 'lg',
    onClick?: () => void,
    disabled?: boolean,
    type?: 'button' | 'submit' | 'reset',
    className?: string,
    [key: string]: any
}) => {
    const variantClass = {
        'primary': 'btn-primary',
        'secondary': 'btn-secondary',
        'outline': 'btn-outline',
        'danger': 'btn-danger'
    }[variant];

    const sizeClass = {
        'sm': 'px-3 py-1 text-xs',
        'md': 'px-4 py-2 text-sm',
        'lg': 'px-6 py-3 text-base'
    }[size];

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            type={type}
            className={`btn ${variantClass} ${sizeClass} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

/**
 * Badge component for status indicators
 */
export const Badge = ({
    children,
    variant = 'primary'
}: {
    children: React.ReactNode,
    variant?: 'primary' | 'success' | 'warning' | 'danger'
}) => {
    const variantClass = {
        'primary': 'badge-primary',
        'success': 'badge-success',
        'warning': 'badge-warning',
        'danger': 'badge-danger'
    }[variant];

    return (
        <span className={`badge ${variantClass}`}>
            {children}
        </span>
    );
};

/**
 * Card component for content containers
 */
export const Card = ({
    children,
    className = ''
}: {
    children: React.ReactNode,
    className?: string
}) => {
    return (
        <div className={`card p-4 ${className}`}>
            {children}
        </div>
    );
};

/**
 * Status Badge for trip statuses
 */
export const StatusBadge = ({
    status
}: {
    status: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED'
}) => {
    const statusText = {
        'OPEN': 'Open',
        'FULL': 'Full',
        'COMPLETED': 'Completed',
        'CANCELLED': 'Cancelled'
    }[status];

    const statusClass = {
        'OPEN': 'open',
        'FULL': 'full',
        'COMPLETED': 'completed',
        'CANCELLED': 'cancelled'
    }[status];

    return (
        <span className={`status-badge ${statusClass}`}>
            {statusText}
        </span>
    );
};

/**
 * Activity Tag component
 */
export const ActivityTag = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <span className="activity-tag">
            {children}
        </span>
    );
};

/**
 * Spinner component for loading states
 */
export const Spinner = ({
    size = 'md'
}: {
    size?: 'sm' | 'md' | 'lg'
}) => {
    const sizeClass = {
        'sm': 'h-4 w-4',
        'md': 'h-8 w-8',
        'lg': 'h-12 w-12'
    }[size];

    return (
        <div className={`animate-spin rounded-full ${sizeClass} border-t-2 border-b-2 border-primary`}></div>
    );
};

/**
 * Loading component for page loading states
 */
export const Loading = () => {
    return (
        <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
        </div>
    );
};