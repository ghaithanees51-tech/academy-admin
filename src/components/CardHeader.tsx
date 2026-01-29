import React from 'react';

interface CardHeaderProps {
  title: string;
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
}

export default function CardHeader({ 
  title, 
  icon, 
  iconColor = 'text-gray-500',
  className = ''
}: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        {icon && (
          <span className={iconColor}>
            {icon}
          </span>
        )}
        {title}
      </h2>
    </div>
  );
}
