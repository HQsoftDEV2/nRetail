import React, { forwardRef } from 'react';
import { Box, Input as ZmpInput, Text } from 'zmp-ui';

export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  className?: string;
  inputClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      placeholder,
      type = 'text',
      value,
      onChange,
      error,
      disabled = false,
      required = false,
      helperText,
      className,
      inputClassName,
      ...props
    },
    ref
  ) => {
    return (
      <Box className={`space-y-1 ${className || ''}`}>
        {label && (
          <Text size="small" className="text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Text>
        )}
        
        <ZmpInput
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`w-full ${inputClassName || ''}`}
          {...props}
        />
        
        {error && (
          <Text size="small" className="text-red-500">
            {error}
          </Text>
        )}
        
        {helperText && !error && (
          <Text size="small" className="text-gray-500 dark:text-gray-400">
            {helperText}
          </Text>
        )}
      </Box>
    );
  }
);

Input.displayName = 'Input';
