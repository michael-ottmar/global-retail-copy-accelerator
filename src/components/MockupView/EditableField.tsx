import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';

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
  placeholder = 'Click to edit...',
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
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setLocalValue(value);
      setIsEditing(false);
    }
  };
  
  if (isEditing) {
    return multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className={`px-2 py-1 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none w-full ${className}`}
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
        className={`px-2 py-1 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 w-full ${className}`}
      />
    );
  }
  
  const statusClasses = translation?.status === 'completed' ? 'text-green-600' : 
                       translation?.status === 'in_progress' ? 'text-yellow-600' : 
                       'text-gray-400';
  
  return (
    <span
      onClick={handleEdit}
      className={`cursor-text hover:bg-gray-100 px-2 py-1 rounded transition-colors inline-block min-w-0 break-words ${
        value ? className : `${className} ${statusClasses} italic`
      }`}
      title="Click to edit"
    >
      {value || placeholder}
    </span>
  );
}