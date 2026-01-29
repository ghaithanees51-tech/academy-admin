import type { PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';

type CardProps = {
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
  bordered?: boolean;
  interactive?: boolean;
};

type CardHeaderProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export const Card = ({
  className,
  padding = 'lg',
  elevated = false,
  bordered = true,
  interactive = false,
  children,
}: PropsWithChildren<CardProps>) => {
  const paddingClass =
    padding === 'none'
      ? 'p-0'
      : padding === 'sm'
        ? 'p-4'
        : padding === 'md'
          ? 'p-5'
          : 'p-6';

  return (
    <div
      className={clsx(
        'rounded-2xl bg-white',
        bordered && 'border border-slate-200',
        elevated ? 'shadow-md' : '',
        interactive && 'transition-shadow hover:shadow-lg',
        paddingClass,
        className,
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  title,
  subtitle,
  icon,
  action,
  className,
}: CardHeaderProps) => {
  if (!title && !subtitle && !icon && !action) return null;
  return (
    <div className={clsx('flex items-center justify-between gap-3', className)}>
      <div className="flex items-start gap-3">
        {icon ? <span className="rounded-xl p-2 text-slate-600">{icon}</span> : null}
        <div>
          {title ? <h3 className="text-base sm:text-lg font-semibold text-slate-900">{title}</h3> : null}
          {subtitle ? <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
};

export const CardSection = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => {
  return <div className={clsx('mt-6', className)}>{children}</div>;
};


