import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'font-medium transition-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-matrix-bg disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-matrix-accent-primary/10 text-matrix-accent-primary hover:bg-matrix-accent-primary/20 border border-matrix-accent-primary/30 focus:ring-matrix-accent-primary/50',
    secondary: 'bg-matrix-surface text-matrix-text-primary hover:bg-matrix-border border border-matrix-border focus:ring-matrix-border',
    ghost: 'text-matrix-text-secondary hover:text-matrix-text-primary hover:bg-matrix-surface/50',
    danger: 'bg-matrix-accent-danger/10 text-matrix-accent-danger hover:bg-matrix-accent-danger/20 border border-matrix-accent-danger/30 focus:ring-matrix-accent-danger/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </button>
  );
};
