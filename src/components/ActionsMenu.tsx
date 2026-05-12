import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';

export interface ActionItem {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  divider?: boolean;
}

interface ActionsMenuProps {
  actions: ActionItem[];
  className?: string;
}

export default function ActionsMenu({ actions, className = '' }: ActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate menu position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: buttonRect.bottom + 8, // 8px = mt-2 equivalent, fixed positioning uses viewport coordinates
        right: window.innerWidth - buttonRect.right,
      });
    }
  }, [isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle scroll and resize to update position
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        setMenuPosition({
          top: buttonRect.bottom + 8, // fixed positioning uses viewport coordinates
          right: window.innerWidth - buttonRect.right,
        });
      }
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const handleActionClick = (action: ActionItem) => {
    if (!action.disabled) {
      action.onClick();
      setIsOpen(false);
    }
  };

  if (actions.length === 0) {
    return null;
  }

  const dropdownMenu = isOpen && (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-9998"
        onClick={() => setIsOpen(false)}
      />
      {/* Dropdown Menu - Fixed positioning to escape table overflow */}
      <div
        ref={menuRef}
        className="fixed min-w-[150px] bg-white rounded-lg shadow-lg border border-slate-200 z-9999 py-2"
        style={{
          top: `${menuPosition.top}px`,
          right: `${menuPosition.right}px`,
        }}
      >
        {actions.map((action, index) => (
          <div key={index}>
            {action.divider ? (
              <div className="my-2 border-t border-slate-200"></div>
            ) : (
              <button
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                className={`w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors ${
                  action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${action.className || ''}`}
              >
                {action.icon && <div className="shrink-0">{action.icon}</div>}
                <div className="flex-1">
                  <div className="font-medium">{action.label}</div>
                  {action.description && (
                    <div className="text-xs text-slate-500 mt-0.5">{action.description}</div>
                  )}
                </div>
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          aria-label="More actions"
          title="More actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      {/* Render dropdown menu in portal to escape table overflow */}
      {typeof window !== 'undefined' && createPortal(dropdownMenu, document.body)}
    </>
  );
}

