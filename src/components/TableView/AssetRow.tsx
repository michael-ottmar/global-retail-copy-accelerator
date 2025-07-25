import { useState } from 'react';
import { Trash2Icon, PlusIcon, GripVerticalIcon, CopyIcon } from 'lucide-react';
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
  dragAndDrop: any;
  opacity?: number;
}

export function AssetRow({
  asset,
  deliverable,
  columns,
  columnPositions,
  languages,
  assetIndex,
  searchQuery,
  onVariableHover,
  dragAndDrop,
  opacity = 1
}: AssetRowProps) {
  const { removeAsset, addCustomField, updateAssetName, duplicateAsset } = useStore();
  const [addingField, setAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [editingAssetName, setEditingAssetName] = useState(false);
  const [assetName, setAssetName] = useState(asset.name);
  
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
      <tr 
        className={`${bgColor} border-t border-gray-100 group hover:bg-gray-100/50 transition-colors ${
          dragAndDrop.isDragging({ type: 'asset', assetId: asset.id, deliverableId: deliverable.id }) ? 'opacity-50' : ''
        } ${
          dragAndDrop.isDragOver({ type: 'asset', assetId: asset.id, deliverableId: deliverable.id }) ? 'border-t-2 border-t-purple-500' : ''
        }`}
        style={{ opacity }}
        draggable
        onDragStart={() => dragAndDrop.handleDragStart({ 
          type: 'asset', 
          assetId: asset.id, 
          deliverableId: deliverable.id 
        })}
        onDragOver={(e) => dragAndDrop.handleDragOver(e, { 
          type: 'asset', 
          assetId: asset.id, 
          deliverableId: deliverable.id 
        })}
        onDrop={(e) => dragAndDrop.handleDrop(e, { 
          type: 'asset', 
          assetId: asset.id, 
          deliverableId: deliverable.id 
        })}
        onDragEnd={dragAndDrop.handleDragEnd}
      >
        <StickyCell
          column={columns[0]}
          position={columnPositions[columns[0].id]}
          className={bgColor}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVerticalIcon className="w-4 h-4 text-gray-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
              {editingAssetName ? (
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  onBlur={() => {
                    updateAssetName(asset.id, assetName);
                    setEditingAssetName(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateAssetName(asset.id, assetName);
                      setEditingAssetName(false);
                    }
                    if (e.key === 'Escape') {
                      setAssetName(asset.name);
                      setEditingAssetName(false);
                    }
                  }}
                  className="text-sm font-bold px-1 py-0.5 border border-purple-500 rounded focus:outline-none"
                  autoFocus
                />
              ) : (
                <span 
                  className="text-sm font-bold text-gray-700 cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                  onClick={() => setEditingAssetName(true)}
                >
                  {asset.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => duplicateAsset?.(deliverable.id, asset.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all duration-200 p-1"
                title="Duplicate asset"
              >
                <CopyIcon className="w-3 h-3" />
              </button>
              <button
                onClick={() => removeAsset(asset.id)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-200 p-1"
                title="Remove asset"
              >
                <Trash2Icon className="w-3 h-3" />
              </button>
            </div>
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
          dragAndDrop={dragAndDrop}
          opacity={opacity}
        />
      ))}
      
      {/* Add Field Row */}
      <tr className={bgColor} style={{ opacity }}>
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