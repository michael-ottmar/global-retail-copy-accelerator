import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { CheckIcon, XIcon } from 'lucide-react';

interface EditableFieldProps {
  fieldId: string;
  languageCode: string;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export function EditableField({ 
  fieldId, 
  languageCode, 
  className = '',
  placeholder = '[Empty]',
  multiline = false
}: EditableFieldProps) {
  const { translations, updateTranslation } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  const translation = translations.find(
    t => t.fieldId === fieldId && t.languageCode === languageCode
  );
  const value = translation?.value || '';
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const handleEdit = () => {
    setLocalValue(value);
    setIsEditing(true);
  };
  
  const handleSave = () => {
    updateTranslation(fieldId, languageCode, localValue);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  if (isEditing) {
    return (
      <div className="relative inline-flex items-center gap-1">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={`px-2 py-1 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
            rows={3}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={`px-2 py-1 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
          />
        )}
        <div className="absolute -right-20 flex gap-1">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleSave}
            className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
            title="Save"
          >
            <CheckIcon className="w-3 h-3" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleCancel}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
            title="Cancel"
          >
            <XIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }
  
  const statusClasses = translation?.status === 'completed' ? 'text-green-600' : 
                       translation?.status === 'in_progress' ? 'text-yellow-600' : 
                       'text-gray-400';
  
  return (
    <span
      onClick={handleEdit}
      className={`cursor-text hover:bg-gray-100 px-2 py-1 rounded transition-colors inline-block ${
        value ? className : `${className} ${statusClasses} italic`
      }`}
      title="Click to edit"
    >
      {value || placeholder}
    </span>
  );
}