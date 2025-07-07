import type { ReactNode } from 'react';
import type { ColumnConfig, ColumnPosition } from './types';

interface StickyCellProps {
  column: ColumnConfig;
  position?: ColumnPosition;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export function StickyCell({ 
  column, 
  position, 
  className = '', 
  children,
  onClick 
}: StickyCellProps) {
  const baseClasses = `px-4 py-2 transition-all duration-200 border-b border-r border-gray-200`;
  
  const stickyClasses = column.sticky ? 'sticky z-10' : '';
  
  const style = column.sticky && position ? {
    left: `${position.left}px`,
    width: `${position.width}px`,
    minWidth: `${position.width}px`,
    maxWidth: `${position.width}px`
  } : {};
  
  return (
    <td
      className={`${baseClasses} ${stickyClasses} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </td>
  );
}