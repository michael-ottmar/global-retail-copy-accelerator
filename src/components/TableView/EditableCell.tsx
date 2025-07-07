import { useRef, useEffect } from 'react';
import type { ColumnConfig, ColumnPosition } from './types';

interface EditableCellProps {
  column: ColumnConfig;
  position?: ColumnPosition;
  value: string;
  isEditing: boolean;
  isSource?: boolean;
  isSelected?: boolean;
  bgColor: string;
  onClick: () => void;
  onBlur: (value: string) => void;
}

export function EditableCell({
  column,
  position,
  value,
  isEditing,
  isSource,
  isSelected,
  bgColor,
  onClick,
  onBlur
}: EditableCellProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  
  const baseClasses = `px-4 py-2 transition-all duration-200 group border-b border-r border-gray-200`;
  
  const stickyClasses = column.sticky ? 'sticky z-10' : '';
  
  const colorClasses = isSource 
    ? 'bg-blue-50' 
    : isSelected 
    ? 'bg-purple-50'
    : bgColor;
  
  const style = column.sticky && position ? {
    left: `${position.left}px`,
    width: `${position.width}px`,
    minWidth: `${position.width}px`,
    maxWidth: `${position.width}px`
  } : {};
  
  return (
    <td
      className={`${baseClasses} ${stickyClasses} ${colorClasses}`}
      style={style}
      onClick={!isEditing ? onClick : undefined}
    >
      <div className="w-full">
        {isEditing ? (
          <textarea
            ref={inputRef}
            className="flex-1 px-2 py-1 text-sm border border-purple-500 rounded 
                     resize-none focus:outline-none focus:ring-1 focus:ring-purple-500
                     min-h-[28px] bg-white"
            defaultValue={value}
            onBlur={(e) => onBlur(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onBlur(e.currentTarget.value);
              }
              if (e.key === 'Escape') {
                e.currentTarget.value = value;
                e.currentTarget.blur();
              }
            }}
            rows={1}
            style={{ 
              height: 'auto',
              overflow: 'hidden'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
        ) : (
          <div
            className="min-h-[20px] cursor-pointer rounded px-2 py-1 text-sm
                     hover:bg-gray-900/5 transition-colors duration-150
                     break-words overflow-wrap-anywhere max-w-full"
            style={{ wordBreak: 'break-word' }}
          >
            {value || <span className="text-gray-400 italic">Click to edit</span>}
          </div>
        )}
      </div>
    </td>
  );
}