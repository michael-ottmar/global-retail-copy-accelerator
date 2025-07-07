import { useState } from 'react';
import { EditIcon } from 'lucide-react';
import { useStore } from '../../store';
import type { Field, Asset, Deliverable, Language } from '../../types';
import type { ColumnConfig, ColumnPosition } from './types';
import { StickyCell } from './StickyCell';
import { EditableCell } from './EditableCell';
import { formatVariableName } from './utils';

interface FieldRowProps {
  field: Field;
  asset: Asset;
  deliverable: Deliverable;
  columns: ColumnConfig[];
  columnPositions: Record<string, ColumnPosition>;
  languages: Language[];
  bgColor: string;
  onVariableHover: (variable: string) => void;
}

export function FieldRow({
  field,
  asset,
  deliverable,
  columns,
  columnPositions,
  languages,
  bgColor,
  onVariableHover
}: FieldRowProps) {
  const { translations, updateTranslation, showVariableColumn } = useStore();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editingFieldName, setEditingFieldName] = useState(false);
  
  const variableName = formatVariableName(deliverable, asset, field);
  
  const getTranslation = (languageCode: string) => {
    return translations.find(t => t.fieldId === field.id && t.languageCode === languageCode);
  };
  
  const handleCellClick = (languageCode: string) => {
    setEditingCell(`${field.id}-${languageCode}`);
    onVariableHover(variableName);
  };
  
  const handleCellBlur = (languageCode: string, value: string) => {
    updateTranslation(field.id, languageCode, value);
    setEditingCell(null);
  };

  return (
    <tr 
      className={`${bgColor} hover:bg-gray-100/50 transition-colors`}
      onMouseEnter={() => onVariableHover(variableName)}
    >
      {columns.map((column) => {
        // Hierarchy column
        if (column.id === 'hierarchy') {
          return (
            <StickyCell
              key={column.id}
              column={column}
              position={columnPositions[column.id]}
              className={bgColor}
            >
              <div className="flex items-center justify-between group ml-10">
                {editingFieldName && field.type === 'custom' ? (
                  <input
                    type="text"
                    value={field.customName}
                    onChange={() => {/* TODO: Update field name */}}
                    onBlur={() => setEditingFieldName(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === 'Escape') {
                        setEditingFieldName(false);
                      }
                    }}
                    className="text-sm px-1 py-0.5 border border-purple-500 rounded focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm text-gray-600">
                    {field.customName || field.name}
                  </span>
                )}
                {field.type === 'custom' && (
                  <button
                    onClick={() => setEditingFieldName(true)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all duration-200 p-1"
                    title="Edit field name"
                  >
                    <EditIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            </StickyCell>
          );
        }
        
        // Variable column
        if (column.id === 'variable' && showVariableColumn) {
          return (
            <StickyCell
              key={column.id}
              column={column}
              position={columnPositions[column.id]}
              className={`${bgColor} text-gray-500`}
            >
              <code className="font-mono text-xs">{variableName}</code>
            </StickyCell>
          );
        }
        
        // Language columns
        const language = languages.find(l => l.code === column.id);
        if (language) {
          const translation = getTranslation(language.code);
          const cellKey = `${field.id}-${language.code}`;
          const isEditing = editingCell === cellKey;
          
          return (
            <EditableCell
              key={column.id}
              column={column}
              position={columnPositions[column.id]}
              value={translation?.value || ''}
              isEditing={isEditing}
              isSource={column.isSource}
              isSelected={column.isSelected}
              bgColor={bgColor}
              onClick={() => handleCellClick(language.code)}
              onBlur={(value) => handleCellBlur(language.code, value)}
            />
          );
        }
        
        return null;
      })}
    </tr>
  );
}