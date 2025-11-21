import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-matrix-text-secondary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-matrix-text-muted">
            {icon}
          </div>
        )}
        <input
          className={clsx(
            'w-full px-4 py-2.5 bg-matrix-surface/50 border border-matrix-border rounded-lg',
            'text-matrix-text-primary placeholder-matrix-text-muted',
            'transition-smooth backdrop-blur-sm',
            'hover:border-matrix-accent-primary/30',
            'focus:border-matrix-accent-primary/50 focus:bg-matrix-surface/70',
            error && 'border-matrix-accent-danger/50',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-matrix-accent-danger">{error}</p>
      )}
    </div>
  );
};
