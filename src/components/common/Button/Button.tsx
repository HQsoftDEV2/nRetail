import React, { forwardRef } from 'react';
import { Button as ZmpButton, ButtonProps as ZmpButtonProps } from 'zmp-ui';

export interface ButtonProps extends Omit<ZmpButtonProps, 'onClick'> {
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      onClick,
      loading = false,
      disabled = false,
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const getVariantProps = () => {
      switch (variant) {
        case 'primary':
          return { variant: 'primary' as const };
        case 'secondary':
          return { variant: 'secondary' as const };
        case 'danger':
          return { variant: 'primary' as const, className: 'bg-red-500 hover:bg-red-600' };
        case 'outline':
          return { variant: 'secondary' as const };
        default:
          return { variant: 'primary' as const };
      }
    };

    const getSizeProps = () => {
      switch (size) {
        case 'small':
          return { size: 'small' as const };
        case 'medium':
          return { size: 'medium' as const };
        case 'large':
          return { size: 'large' as const };
        default:
          return { size: 'medium' as const };
      }
    };

    return (
      <ZmpButton
        ref={ref}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${fullWidth ? 'w-full' : ''} ${className || ''}`}
        {...getVariantProps()}
        {...getSizeProps()}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </ZmpButton>
    );
  }
);

Button.displayName = 'Button';
