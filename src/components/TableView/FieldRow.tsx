import { useState } from 'react';
import { GripVerticalIcon, Trash2Icon } from 'lucide-react';
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
  dragAndDrop?: any;
  opacity?: number;
}

export function FieldRow({
  field,
  asset,
  deliverable,
  columns,
  columnPositions,
  languages,
  bgColor,
  onVariableHover,
  dragAndDrop,
  opacity = 1
}: FieldRowProps) {
  const { getEffectiveTranslation, updateTranslation, showVariableColumn, removeField, updateFieldName, selectedVariant, project } = useStore();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editingFieldName, setEditingFieldName] = useState(false);
  const [fieldName, setFieldName] = useState(field.customName || field.name);
  
  const variableName = formatVariableName(deliverable, asset, field);
  const currentVariantId = selectedVariant || project?.skuVariants?.find(v => v.isBase)?.id || '1';
  
  const handleCellClick = (languageCode: string) => {
    setEditingCell(`${field.id}-${languageCode}`);
    onVariableHover(variableName);
  };
  
  const handleCellBlur = (languageCode: string, value: string) => {
    updateTranslation(field.id, languageCode, value, currentVariantId);
    setEditingCell(null);
  };

  return (
    <tr 
      className={`${bgColor} hover:bg-gray-100/50 transition-colors group ${
        dragAndDrop?.isDragging?.({ type: 'field', assetId: asset.id, fieldId: field.id, deliverableId: deliverable.id }) ? 'opacity-50' : ''
      } ${
        dragAndDrop?.isDragOver?.({ type: 'field', assetId: asset.id, fieldId: field.id, deliverableId: deliverable.id }) ? 'border-t-2 border-t-purple-500' : ''
      }`}
      style={{ opacity }}
      onMouseEnter={() => onVariableHover(variableName)}
      draggable
      onDragStart={() => dragAndDrop?.handleDragStart?.({ 
        type: 'field', 
        assetId: asset.id, 
        fieldId: field.id,
        deliverableId: deliverable.id 
      })}
      onDragOver={(e) => dragAndDrop?.handleDragOver?.(e, { 
        type: 'field', 
        assetId: asset.id, 
        fieldId: field.id,
        deliverableId: deliverable.id 
      })}
      onDrop={(e) => dragAndDrop?.handleDrop?.(e, { 
        type: 'field', 
        assetId: asset.id, 
        fieldId: field.id,
        deliverableId: deliverable.id 
      })}
      onDragEnd={dragAndDrop?.handleDragEnd}
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
              <div className="flex items-center justify-between ml-6">
                <div className="flex items-center gap-2">
                  <GripVerticalIcon className="w-4 h-4 text-gray-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                  {editingFieldName ? (
                    <input
                      type="text"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                      onBlur={() => {
                        updateFieldName(asset.id, field.id, fieldName);
                        setEditingFieldName(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateFieldName(asset.id, field.id, fieldName);
                          setEditingFieldName(false);
                        }
                        if (e.key === 'Escape') {
                          setFieldName(field.customName || field.name);
                          setEditingFieldName(false);
                        }
                      }}
                      className="text-sm px-1 py-0.5 border border-purple-500 rounded focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="text-sm text-gray-600 cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                      onClick={() => setEditingFieldName(true)}
                    >
                      {field.customName || field.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => removeField(asset.id, field.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-200 p-1"
                    title="Delete field"
                  >
                    <Trash2Icon className="w-3 h-3" />
                  </button>
                </div>
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
          const translation = getEffectiveTranslation(field.id, language.code, currentVariantId);
          const cellKey = `${field.id}-${language.code}`;
          const isEditing = editingCell === cellKey;
          const isInherited = translation?.status === 'inherited';
          
          return (
            <EditableCell
              key={column.id}
              column={column}
              position={columnPositions[column.id]}
              value={translation?.value || ''}
              isEditing={isEditing}
              isSource={column.isSource}
              isSelected={column.isSelected}
              bgColor={isInherited ? 'bg-gray-50 italic' : bgColor}
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