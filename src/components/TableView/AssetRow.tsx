import { useState } from 'react';
import { Trash2Icon, PlusIcon } from 'lucide-react';
import { useStore } from '../../store';
import type { Asset, Deliverable, Language } from '../../types';
import type { ColumnConfig, ColumnPosition } from './types';
import { FieldRow } from './FieldRow';
import { StickyCell } from './StickyCell';

interface AssetRowProps {
  asset: Asset;
  deliverable: Deliverable;
  columns: ColumnConfig[];
  columnPositions: Record<string, ColumnPosition>;
  languages: Language[];
  assetIndex: number;
  searchQuery: string;
  onVariableHover: (variable: string) => void;
}

export function AssetRow({
  asset,
  deliverable,
  columns,
  columnPositions,
  languages,
  assetIndex,
  searchQuery,
  onVariableHover
}: AssetRowProps) {
  const { removeAsset, addCustomField } = useStore();
  const [addingField, setAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  
  const bgColor = assetIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50';
  
  const handleAddField = () => {
    if (newFieldName.trim()) {
      addCustomField(asset.id, newFieldName.trim());
      setNewFieldName('');
      setAddingField(false);
    }
  };
  
  const matchesSearch = (field: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const fieldName = (field.customName || field.name).toLowerCase();
    const assetName = asset.name.toLowerCase();
    const deliverableName = deliverable.name.toLowerCase();
    return fieldName.includes(query) || assetName.includes(query) || deliverableName.includes(query);
  };

  return (
    <>
      {/* Asset Header */}
      <tr className={`${bgColor} border-t border-gray-100`}>
        <StickyCell
          column={columns[0]}
          position={columnPositions[columns[0].id]}
          className={bgColor}
        >
          <div className="flex items-center justify-between group">
            <span className="text-sm font-medium text-gray-700 ml-6">{asset.name}</span>
            <button
              onClick={() => removeAsset(asset.id)}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-200 p-1"
              title="Remove asset"
            >
              <Trash2Icon className="w-3 h-3" />
            </button>
          </div>
        </StickyCell>
        {columns.slice(1).map(column => (
          <StickyCell
            key={column.id}
            column={column}
            position={columnPositions[column.id]}
            className={bgColor}
          />
        ))}
      </tr>
      
      {/* Fields */}
      {asset.fields.filter(matchesSearch).map((field) => (
        <FieldRow
          key={field.id}
          field={field}
          asset={asset}
          deliverable={deliverable}
          columns={columns}
          columnPositions={columnPositions}
          languages={languages}
          bgColor={bgColor}
          onVariableHover={onVariableHover}
        />
      ))}
      
      {/* Add Field Row */}
      <tr className={bgColor}>
        <StickyCell
          column={columns[0]}
          position={columnPositions[columns[0].id]}
          className={bgColor}
        >
          {addingField ? (
            <input
              type="text"
              placeholder="Field name"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              onBlur={handleAddField}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddField();
                if (e.key === 'Escape') {
                  setNewFieldName('');
                  setAddingField(false);
                }
              }}
              className="ml-10 text-sm px-2 py-1 border border-purple-500 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setAddingField(true)}
              className="flex items-center text-xs text-purple-600 hover:text-purple-700 ml-10 py-0.5"
            >
              <PlusIcon className="w-3 h-3 mr-1" />
              Add field
            </button>
          )}
        </StickyCell>
        {columns.slice(1).map(column => (
          <StickyCell
            key={column.id}
            column={column}
            position={columnPositions[column.id]}
            className={bgColor}
          />
        ))}
      </tr>
    </>
  );
}