import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, Trash2Icon, EditIcon } from 'lucide-react';
import type { Deliverable, Asset } from '../types';

export function TableView() {
  const { 
    project, 
    translations, 
    selectedLanguage, 
    updateTranslation,
    searchQuery,
    selectedDeliverable,
    undo,
    redo,
    canUndo,
    canRedo,
    showVariableColumn
  } = useStore();
  
  const [expandedDeliverables, setExpandedDeliverables] = useState<Set<string>>(new Set(['pdp-1']));
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editingFieldName, setEditingFieldName] = useState<string | null>(null);
  const [currentVariable, setCurrentVariable] = useState<string>('');

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo()) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  if (!project) return null;

  // Filter deliverables based on selection
  const filteredDeliverables = selectedDeliverable 
    ? project.deliverables.filter(d => d.id === selectedDeliverable)
    : project.deliverables;

  // Filter based on search query
  const matchesSearch = (field: any, asset: Asset, deliverable: Deliverable) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const fieldName = (field.customName || field.name).toLowerCase();
    const assetName = asset.name.toLowerCase();
    const deliverableName = deliverable.name.toLowerCase();
    return fieldName.includes(query) || assetName.includes(query) || deliverableName.includes(query);
  };

  const toggleDeliverable = (deliverableId: string) => {
    const newExpanded = new Set(expandedDeliverables);
    if (newExpanded.has(deliverableId)) {
      newExpanded.delete(deliverableId);
    } else {
      newExpanded.add(deliverableId);
    }
    setExpandedDeliverables(newExpanded);
  };

  const getTranslation = (fieldId: string, languageCode: string) => {
    return translations.find(t => t.fieldId === fieldId && t.languageCode === languageCode);
  };

  const handleCellClick = (fieldId: string, languageCode: string) => {
    setEditingCell(`${fieldId}-${languageCode}`);
  };

  const handleCellBlur = (fieldId: string, languageCode: string, value: string) => {
    updateTranslation(fieldId, languageCode, value);
    setEditingCell(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'ai_generated': return 'bg-purple-500';
      default: return 'bg-gray-300';
    }
  };


  const getVariableName = (deliverable: Deliverable, asset: Asset, field: any) => {
    return `${deliverable.name.toLowerCase()}/${asset.name.toLowerCase()}/${(field.customName || field.name).toLowerCase()}`.replace(/\s+/g, '_');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Current Variable Display */}
      {currentVariable && (
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 text-sm text-gray-600">
          <span className="font-medium">Variable:</span> {currentVariable}
        </div>
      )}
      
      {/* Table Container */}
      <div className="flex-1 bg-white overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-30 bg-gray-50 border-b border-r border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider" style={{ width: '280px' }}>
                  Deliverable / Asset / Field
                </th>
                {showVariableColumn && (
                  <th className="sticky z-20 bg-gray-100 border-b border-r border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider" style={{ left: '280px', width: '200px' }}>
                    Variable
                  </th>
                )}
                <th className={`sticky z-20 bg-blue-50 border-b border-r border-gray-200 px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider min-w-[300px]`} style={{ left: showVariableColumn ? '480px' : '280px' }}>
                  English (Source)
                </th>
                {project.languages
                  .filter(lang => lang.code !== 'en')
                  .map((lang, index) => {
                    const isSelected = lang.code === selectedLanguage;
                    const leftPosition = showVariableColumn ? 780 + (index * 300) : 580 + (index * 300);
                    return (
                      <th
                        key={lang.code}
                        className={`${
                          isSelected 
                            ? 'sticky z-20 bg-purple-50 border-b border-r border-gray-200' 
                            : 'bg-gray-50 border-b border-gray-200'
                        } px-4 py-3 text-left text-xs font-medium ${
                          isSelected ? 'text-purple-700' : 'text-gray-500'
                        } uppercase tracking-wider min-w-[300px]`}
                        style={isSelected ? { left: `${showVariableColumn ? '780px' : '580px'}` } : {}}
                      >
                        {lang.flag} {lang.name}
                      </th>
                    );
                  })}
              </tr>
            </thead>
            <tbody>
              {filteredDeliverables.map((deliverable) => (
                <DeliverableSection
                  key={deliverable.id}
                  deliverable={deliverable}
                  expanded={expandedDeliverables.has(deliverable.id)}
                  onToggle={() => toggleDeliverable(deliverable.id)}
                  getTranslation={getTranslation}
                  handleCellClick={handleCellClick}
                  handleCellBlur={handleCellBlur}
                  editingCell={editingCell}
                  getStatusColor={getStatusColor}
                  languages={project.languages}
                  selectedLanguage={selectedLanguage}
                  setCurrentVariable={setCurrentVariable}
                  matchesSearch={matchesSearch}
                  getVariableName={getVariableName}
                  editingFieldName={editingFieldName}
                  setEditingFieldName={setEditingFieldName}
                  showVariableColumn={showVariableColumn}
                />
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}

interface DeliverableSectionProps {
  deliverable: Deliverable;
  expanded: boolean;
  onToggle: () => void;
  getTranslation: (fieldId: string, languageCode: string) => any;
  handleCellClick: (fieldId: string, languageCode: string) => void;
  handleCellBlur: (fieldId: string, languageCode: string, value: string) => void;
  editingCell: string | null;
  getStatusColor: (status: string) => string;
  languages: any[];
  selectedLanguage: string;
  setCurrentVariable: (variable: string) => void;
  matchesSearch: (field: any, asset: Asset, deliverable: Deliverable) => boolean;
  getVariableName: (deliverable: Deliverable, asset: Asset, field: any) => string;
  editingFieldName: string | null;
  setEditingFieldName: (id: string | null) => void;
  showVariableColumn: boolean;
}

function DeliverableSection({
  deliverable,
  expanded,
  onToggle,
  getTranslation,
  handleCellClick,
  handleCellBlur,
  editingCell,
  getStatusColor,
  languages,
  selectedLanguage,
  setCurrentVariable,
  matchesSearch,
  getVariableName,
  editingFieldName,
  setEditingFieldName,
  showVariableColumn,
}: DeliverableSectionProps) {
  const { addAsset } = useStore();

  return (
    <>
      {/* Deliverable Header */}
      <tr className="bg-gray-100">
        <td className="sticky left-0 z-10 bg-gray-100 border-r border-gray-200 px-4 py-3">
          <button onClick={onToggle} className="flex items-center text-sm font-semibold text-gray-900">
            {expanded ? <ChevronDownIcon className="w-4 h-4 mr-2" /> : <ChevronRightIcon className="w-4 h-4 mr-2" />}
            {deliverable.name.toUpperCase()}
          </button>
        </td>
        {showVariableColumn && (
          <td className="sticky z-10 bg-gray-100 border-r border-gray-200" style={{ left: '280px' }}></td>
        )}
        <td className={`sticky z-10 bg-gray-100 border-r border-gray-200`} style={{ left: showVariableColumn ? '480px' : '280px' }}></td>
        <td colSpan={languages.length - (showVariableColumn ? 2 : 1)} className="bg-gray-100"></td>
      </tr>
      
      {expanded && (
        <>
          {deliverable.assets.map((asset, assetIndex) => (
            <AssetSection
              key={asset.id}
              asset={asset}
              assetIndex={assetIndex}
              deliverable={deliverable}
              getTranslation={getTranslation}
              handleCellClick={handleCellClick}
              handleCellBlur={handleCellBlur}
              editingCell={editingCell}
              getStatusColor={getStatusColor}
              languages={languages}
              selectedLanguage={selectedLanguage}
              setCurrentVariable={setCurrentVariable}
              getVariableName={getVariableName}
              editingFieldName={editingFieldName}
              setEditingFieldName={setEditingFieldName}
              matchesSearch={matchesSearch}
              showVariableColumn={showVariableColumn}
            />
          ))}
          
          {/* Add Asset Button */}
          <tr>
            <td className="sticky left-0 z-10 bg-white border-r border-gray-200 px-4 py-2">
              <button
                onClick={() => addAsset(deliverable.id, deliverable.type === 'pdp' ? 'module' : 'module')}
                className="flex items-center text-sm text-purple-600 hover:text-purple-700 ml-6"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add {deliverable.type === 'pdp' ? 'Module' : 'Asset'}
              </button>
            </td>
            <td colSpan={languages.length + (showVariableColumn ? 2 : 1)}></td>
          </tr>
        </>
      )}
    </>
  );
}

interface AssetSectionProps {
  asset: Asset;
  assetIndex: number;
  deliverable: Deliverable;
  getTranslation: (fieldId: string, languageCode: string) => any;
  handleCellClick: (fieldId: string, languageCode: string) => void;
  handleCellBlur: (fieldId: string, languageCode: string, value: string) => void;
  editingCell: string | null;
  getStatusColor: (status: string) => string;
  languages: any[];
  selectedLanguage: string;
  setCurrentVariable: (variable: string) => void;
  matchesSearch: (field: any, asset: Asset, deliverable: Deliverable) => boolean;
  getVariableName: (deliverable: Deliverable, asset: Asset, field: any) => string;
  editingFieldName: string | null;
  setEditingFieldName: (id: string | null) => void;
  showVariableColumn: boolean;
}

function AssetSection({
  asset,
  assetIndex,
  deliverable,
  getTranslation,
  handleCellClick,
  handleCellBlur,
  editingCell,
  getStatusColor,
  languages,
  selectedLanguage,
  setCurrentVariable,
  matchesSearch,
  getVariableName,
  editingFieldName,
  setEditingFieldName,
  showVariableColumn,
}: AssetSectionProps) {
  const { removeAsset, addCustomField } = useStore();
  const [addingField, setAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  
  const bgColor = assetIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50';
  
  const handleAddField = () => {
    if (newFieldName) {
      addCustomField(asset.id, newFieldName);
      setNewFieldName('');
      setAddingField(false);
    }
  };

  return (
    <>
      {/* Asset Header */}
      <tr className={bgColor}>
        <td className={`sticky left-0 z-10 ${bgColor} border-r border-gray-200 px-4 py-2`}>
          <div className="flex items-center justify-between group">
            <span className="text-sm font-medium text-gray-700 ml-6">{asset.name}</span>
            <button
              onClick={() => removeAsset(asset.id)}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
            >
              <Trash2Icon className="w-3 h-3" />
            </button>
          </div>
        </td>
        {showVariableColumn && (
          <td className={`sticky z-10 ${bgColor} border-r border-gray-200`} style={{ left: '280px' }}></td>
        )}
        <td className={`sticky z-10 ${bgColor} border-r border-gray-200`} style={{ left: showVariableColumn ? '480px' : '280px' }}></td>
        <td colSpan={languages.length - (showVariableColumn ? 2 : 1)} className={bgColor}></td>
      </tr>
      
      {/* Fields */}
      {asset.fields.filter(field => matchesSearch(field, asset, deliverable)).map((field) => (
        <tr key={field.id} className={bgColor}>
          <td className={`sticky left-0 z-10 ${bgColor} border-r border-gray-200 px-4 py-1`}>
            <div className="flex items-center justify-between group ml-10">
              {editingFieldName === field.id && field.type === 'custom' ? (
                <input
                  type="text"
                  value={field.customName}
                  onChange={() => {/* TODO: Update field name */}}
                  onBlur={() => setEditingFieldName(null)}
                  className="text-sm px-1 py-0.5 border border-purple-500 rounded"
                  autoFocus
                />
              ) : (
                <span className="text-sm text-gray-600">
                  {field.customName || field.name}
                </span>
              )}
              {field.type === 'custom' && (
                <button
                  onClick={() => setEditingFieldName(field.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
                >
                  <EditIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          </td>
          {showVariableColumn && (
            <td className={`sticky z-10 ${bgColor} border-r border-gray-200 px-4 py-1 text-sm text-gray-500`} style={{ left: '280px' }}>
              <code className="font-mono text-xs">{getVariableName(deliverable, asset, field)}</code>
            </td>
          )}
          {languages.map((lang, index) => {
            const translation = getTranslation(field.id, lang.code);
            const cellKey = `${field.id}-${lang.code}`;
            const isEditing = editingCell === cellKey;
            const isSource = lang.code === 'en';
            const isSelected = lang.code === selectedLanguage && !isSource;
            const variableName = getVariableName(deliverable, asset, field);
            
            let leftPosition;
            if (isSource) {
              leftPosition = showVariableColumn ? '480px' : '280px';
            } else if (isSelected) {
              leftPosition = showVariableColumn ? '780px' : '580px';
            }
            
            return (
              <td
                key={lang.code}
                className={`relative ${
                  isSource ? `sticky z-10 bg-blue-50 border-r border-gray-200` : 
                  isSelected ? `sticky z-10 bg-purple-50 border-r border-gray-200` : 
                  bgColor
                }`}
                style={isSource || isSelected ? { left: leftPosition } : {}}
                onFocus={() => setCurrentVariable(variableName)}
                onClick={() => setCurrentVariable(variableName)}
              >
                <div className="flex items-center px-4 py-1">
                  <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${getStatusColor(translation?.status || 'empty')}`} />
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-purple-500 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      defaultValue={translation?.value || ''}
                      onBlur={(e) => handleCellBlur(field.id, lang.code, e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="flex-1 min-h-[28px] cursor-pointer hover:bg-gray-100/50 rounded px-2 py-1 text-sm"
                      onClick={() => handleCellClick(field.id, lang.code)}
                    >
                      {translation?.value || ''}
                    </div>
                  )}
                </div>
              </td>
            );
          })}
        </tr>
      ))}
      
      {/* Add Field Row */}
      {addingField ? (
        <tr className={bgColor}>
          <td className={`sticky left-0 z-10 ${bgColor} border-r border-gray-200 px-4 py-1`}>
            <input
              type="text"
              placeholder="Field name"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              onBlur={handleAddField}
              onKeyDown={(e) => e.key === 'Enter' && handleAddField()}
              className="ml-10 text-sm px-2 py-1 border border-purple-500 rounded focus:outline-none"
              autoFocus
            />
          </td>
          {showVariableColumn && (
            <td className={`sticky z-10 ${bgColor} border-r border-gray-200`} style={{ left: '280px' }}></td>
          )}
          <td className={`sticky z-10 ${bgColor} border-r border-gray-200`} style={{ left: showVariableColumn ? '480px' : '280px' }}></td>
          <td colSpan={languages.length - (showVariableColumn ? 2 : 1)} className={bgColor}></td>
        </tr>
      ) : (
        <tr className={bgColor}>
          <td className={`sticky left-0 z-10 ${bgColor} border-r border-gray-200 px-4 py-1`}>
            <button
              onClick={() => setAddingField(true)}
              className="flex items-center text-xs text-purple-600 hover:text-purple-700 ml-10"
            >
              <PlusIcon className="w-3 h-3 mr-1" />
              Add field
            </button>
          </td>
          {showVariableColumn && (
            <td className={`sticky z-10 ${bgColor} border-r border-gray-200`} style={{ left: '280px' }}></td>
          )}
          <td className={`sticky z-10 ${bgColor} border-r border-gray-200`} style={{ left: showVariableColumn ? '480px' : '280px' }}></td>
          <td colSpan={languages.length - (showVariableColumn ? 2 : 1)} className={bgColor}></td>
        </tr>
      )}
    </>
  );
}