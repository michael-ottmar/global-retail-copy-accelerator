import type { ColumnConfig, ColumnPosition } from './types';
import type { Language } from '../../types';

interface TableHeaderProps {
  columns: ColumnConfig[];
  columnPositions: Record<string, ColumnPosition>;
  languages: Language[];
}

export function TableHeader({ columns, columnPositions, languages }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {columns.map((column) => {
          const position = columnPositions[column.id];
          const lang = languages.find(l => l.code === column.id);
          
          const baseClasses = `
            border-b border-gray-200 px-4 py-3 text-left text-xs font-medium 
            uppercase tracking-wider transition-all duration-200
          `;
          
          const stickyClasses = column.sticky ? 'sticky z-20' : '';
          
          const colorClasses = column.isSource 
            ? 'bg-blue-50 text-blue-700 border-r'
            : column.isSelected 
            ? 'bg-purple-50 text-purple-700 border-r' 
            : column.id === 'hierarchy'
            ? 'bg-gray-50 text-gray-700 border-r'
            : column.id === 'variable'
            ? 'bg-gray-100 text-gray-600 border-r'
            : 'bg-gray-50 text-gray-500';
          
          const style = column.sticky && position ? {
            left: `${position.left}px`,
            width: `${position.width}px`,
            minWidth: `${position.width}px`,
            maxWidth: `${position.width}px`
          } : {
            width: `${column.width}px`,
            minWidth: `${column.width}px`
          };
          
          return (
            <th
              key={column.id}
              className={`${baseClasses} ${stickyClasses} ${colorClasses}`}
              style={style}
            >
              {lang && <span className="mr-2">{lang.flag}</span>}
              {column.label}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}