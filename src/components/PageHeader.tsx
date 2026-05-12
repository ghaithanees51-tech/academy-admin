import type { PropsWithChildren, ComponentType, ReactNode } from 'react';

type IconComponent = ComponentType<{ className?: string }>;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: IconComponent;
  action?: ReactNode;
  actions?: ReactNode; // Support both action and actions for flexibility
  sticky?: boolean;
  containerClassName?: string;
}

const PageHeader = ({
  title,
  subtitle,
  icon: Icon,
  action,
  actions,
  sticky = true,
  containerClassName,
}: PropsWithChildren<PageHeaderProps>) => {
  const actionContent = actions || action;
  
  return (
    <div
      className={`${containerClassName ?? 'max-w-8xl'} ${sticky ? 'mx-auto sticky top-0 z-10 backdrop-blur mb-2 rounded-2xl border border-slate-200 bg-white' : ''}`}     
    >
      <div className={`mx-auto flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          {Icon ? <Icon className="w-6 h-6 text-indigo-600" /> : null}
          <div> 
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{title}</h1>
            {subtitle ? <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p> : null}
          </div>
        </div>
        {actionContent ? <div className="shrink-0">{actionContent}</div> : null}
      </div>
    </div>
  );
};

export default PageHeader;


