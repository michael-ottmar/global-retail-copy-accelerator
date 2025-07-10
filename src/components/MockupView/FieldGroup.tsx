import { useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { EditableField } from './EditableField';
import type { Field, Asset } from '../../types';

interface FieldGroupProps {
  fields: Field[];
  asset: Asset;
  currentLanguage: string;
  updateFieldName: (assetId: string, fieldId: string, name: string) => void;
  removeField: (assetId: string, fieldId: string) => void;
  addCustomField: (assetId: string, fieldName: string) => void;
  className?: string;
}

// Get typography classes based on field type
const getFieldTypeClasses = (fieldType: string) => {
  switch (fieldType) {
    case 'headline':
    case 'productName':
      return 'text-xl font-bold text-gray-900';
    case 'body':
    case 'productDetails':
      return 'text-base text-gray-700';
    case 'legal':
      return 'text-xs text-gray-500';
    case 'feature':
    case 'bullet':
      return 'text-base text-gray-700';
    default:
      return 'text-base text-gray-700';
  }
};

export function FieldGroup({
  fields,
  asset,
  currentLanguage,
  updateFieldName,
  removeField,
  addCustomField,
  className = ''
}: FieldGroupProps) {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldName, setFieldName] = useState('');
  const [addingField, setAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');

  return (
    <div className={className}>
      {fields.map((field) => (
        <div key={field.id} className="group/field relative">
          {/* Field label */}
          <span className="text-xs text-gray-500 block mb-1">
            {editingFieldId === field.id ? (
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                onBlur={() => {
                  updateFieldName(asset.id, field.id, fieldName);
                  setEditingFieldId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateFieldName(asset.id, field.id, fieldName);
                    setEditingFieldId(null);
                  } else if (e.key === 'Escape') {
                    setFieldName(field.customName || field.name);
                    setEditingFieldId(null);
                  }
                }}
                className="px-1 py-0.5 border border-purple-500 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs uppercase"
                autoFocus
              />
            ) : (
              <span 
                className="cursor-text hover:bg-gray-200 px-1 py-0.5 rounded inline-flex items-center gap-2"
                onClick={() => {
                  setFieldName(field.customName || field.name);
                  setEditingFieldId(field.id);
                }}
              >
                <span className="uppercase">{field.customName || field.name}</span>
                {/* Delete button inline with label */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(asset.id, field.id);
                  }}
                  className="opacity-0 group-hover/field:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                  title="Delete field"
                >
                  <Trash2Icon className="w-3 h-3" />
                </button>
              </span>
            )}
          </span>
          <div className="break-words overflow-hidden">
            <EditableField
              fieldId={field.id}
              languageCode={currentLanguage}
              className={getFieldTypeClasses(field.type)}
              multiline={field.type === 'body' || field.type === 'legal' || field.type === 'productDetails'}
            />
          </div>
        </div>
      ))}
      
      {/* Add field button */}
      {addingField ? (
        <div className="mt-2">
          <input
            type="text"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            onBlur={() => {
              if (newFieldName.trim()) {
                addCustomField(asset.id, newFieldName.trim());
              }
              setAddingField(false);
              setNewFieldName('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newFieldName.trim()) {
                addCustomField(asset.id, newFieldName.trim());
                setAddingField(false);
                setNewFieldName('');
              } else if (e.key === 'Escape') {
                setAddingField(false);
                setNewFieldName('');
              }
            }}
            placeholder="Field name"
            className="px-2 py-1 border border-purple-500 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => setAddingField(true)}
          className="mt-2 flex items-center text-xs text-purple-600 hover:text-purple-700"
        >
          <PlusIcon className="w-3 h-3 mr-1" />
          Add field
        </button>
      )}
    </div>
  );
}