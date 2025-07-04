import { useState } from 'react';
import { useStore } from '../store';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, Trash2Icon, EditIcon } from 'lucide-react';
import type { Deliverable, Asset } from '../types';

export function TableView() {
  const { 
    project, 
    translations, 
    selectedLanguage, 
    updateTranslation
  } = useStore();
  
  const [expandedDeliverables, setExpandedDeliverables] = useState<Set<string>>(new Set(['pdp-1']));
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [addingLanguage, setAddingLanguage] = useState(false);
  const [newLanguageCode, setNewLanguageCode] = useState('');
  const [editingFieldName, setEditingFieldName] = useState<string | null>(null);
  const [hoveredVariable, setHoveredVariable] = useState<string | null>(null);

  if (!project) return null;

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

  const handleAddLanguage = () => {
    if (newLanguageCode && newLanguageCode.length === 2) {
      useStore.getState().addLanguage(newLanguageCode.toLowerCase());
      setNewLanguageCode('');
      setAddingLanguage(false);
    }
  };

  const getVariableName = (deliverable: Deliverable, asset: Asset, field: any) => {
    return `${deliverable.name.toLowerCase()}/${asset.name.toLowerCase()}/${(field.customName || field.name).toLowerCase()}`.replace(/\s+/g, '_');
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Table Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {translations.filter(t => t.value && t.languageCode !== 'en').length} / {translations.filter(t => t.languageCode !== 'en').length} translations complete
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => useStore.getState().fillSampleContent()}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            Fill Sample Content
          </button>
          <span className="text-gray-300">|</span>
          <button 
            onClick={() => useStore.getState().clearAllTranslations()}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        <div className="h-full overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-30 bg-gray-50 border-b border-r border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-80">
                  Deliverable / Asset / Field
                </th>
                <th className="bg-blue-50 border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider min-w-[300px]">
                  English (Source)
                </th>
                {project.languages
                  .filter(lang => lang.code !== 'en')
                  .map(lang => (
                    <th
                      key={lang.code}
                      className={`border-b border-gray-200 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider min-w-[300px] ${
                        selectedLanguage === lang.code ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {lang.flag} {lang.name}
                    </th>
                  ))}
                {addingLanguage ? (
                  <th className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                    <input
                      type="text"
                      placeholder="Language code (e.g. 'ko')"
                      value={newLanguageCode}
                      onChange={(e) => setNewLanguageCode(e.target.value)}
                      onBlur={handleAddLanguage}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddLanguage()}
                      className="px-2 py-1 text-sm border border-purple-500 rounded focus:outline-none"
                      autoFocus
                    />
                  </th>
                ) : (
                  <th className="bg-gray-50 border-b border-gray-200 px-4 py-3 w-20">
                    <button
                      onClick={() => setAddingLanguage(true)}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {project.deliverables.map((deliverable) => (
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
                  hoveredVariable={hoveredVariable}
                  setHoveredVariable={setHoveredVariable}
                  getVariableName={getVariableName}
                  editingFieldName={editingFieldName}
                  setEditingFieldName={setEditingFieldName}
                />
              ))}
            </tbody>
          </table>
        </div>
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
  hoveredVariable: string | null;
  setHoveredVariable: (id: string | null) => void;
  getVariableName: (deliverable: Deliverable, asset: Asset, field: any) => string;
  editingFieldName: string | null;
  setEditingFieldName: (id: string | null) => void;
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
  hoveredVariable,
  setHoveredVariable,
  getVariableName,
  editingFieldName,
  setEditingFieldName,
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
        <td colSpan={languages.length + 1} className="bg-gray-100"></td>
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
              hoveredVariable={hoveredVariable}
              setHoveredVariable={setHoveredVariable}
              getVariableName={getVariableName}
              editingFieldName={editingFieldName}
              setEditingFieldName={setEditingFieldName}
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
            <td colSpan={languages.length + 1}></td>
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
  hoveredVariable: string | null;
  setHoveredVariable: (id: string | null) => void;
  getVariableName: (deliverable: Deliverable, asset: Asset, field: any) => string;
  editingFieldName: string | null;
  setEditingFieldName: (id: string | null) => void;
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
  hoveredVariable,
  setHoveredVariable,
  getVariableName,
  editingFieldName,
  setEditingFieldName,
}: AssetSectionProps) {
  const { removeAsset, addCustomField } = useStore();
  const [addingField, setAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  
  const bgColor = assetIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50';
  
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
        <td colSpan={languages.length + 1} className={bgColor}></td>
      </tr>
      
      {/* Fields */}
      {asset.fields.map((field) => (
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
          {languages.map((lang) => {
            const translation = getTranslation(field.id, lang.code);
            const cellKey = `${field.id}-${lang.code}`;
            const isEditing = editingCell === cellKey;
            const isSource = lang.code === 'en';
            const variableName = getVariableName(deliverable, asset, field);
            
            return (
              <td
                key={lang.code}
                className={`relative border-gray-100 ${
                  isSource ? 'bg-blue-50/30' : ''
                } ${selectedLanguage === lang.code && !isSource ? 'bg-purple-50/30' : ''}`}
                onMouseEnter={() => setHoveredVariable(cellKey)}
                onMouseLeave={() => setHoveredVariable(null)}
              >
                {/* Variable name tooltip */}
                {hoveredVariable === cellKey && (
                  <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                    {variableName}
                  </div>
                )}
                
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
          <td className={bgColor}></td>
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
          <td colSpan={languages.length + 1} className={bgColor}></td>
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
          <td colSpan={languages.length + 1} className={bgColor}></td>
        </tr>
      )}
    </>
  );
}