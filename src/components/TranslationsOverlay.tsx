import { useState } from 'react';
import { useStore } from '../store';
import { SearchIcon, CheckIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';

interface TranslationsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isEmbedded?: boolean;
}

export function TranslationsOverlay({ isOpen, onClose, isEmbedded = false }: TranslationsOverlayProps) {
  const { project, selectedVariant, getEffectiveTranslation } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'empty' | 'in_progress' | 'completed' | 'inherited'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  if (!isOpen || !project) return null;

  const currentVariantId = selectedVariant || project.skuVariants?.find(v => v.isBase)?.id || '1';
  const currentVariant = project.skuVariants?.find(v => v.id === currentVariantId);

  // Get all unique field translations
  const fieldTranslations = project.deliverables.flatMap(deliverable =>
    deliverable.assets.flatMap(asset =>
      asset.fields.map(field => {
        const languageTranslations = project.languages
          .filter(lang => lang.code !== 'en') // Exclude source language
          .map(lang => {
            const translation = getEffectiveTranslation(field.id, lang.code, currentVariantId);
            return {
              fieldId: field.id,
              fieldName: field.customName || field.name,
              assetName: asset.name,
              deliverableName: deliverable.name,
              language: lang,
              translation: translation || { 
                fieldId: field.id, 
                languageCode: lang.code, 
                value: '', 
                status: 'empty' as const 
              },
            };
          });
        return languageTranslations;
      })
    ).flat()
  );

  // Filter translations
  const filteredTranslations = fieldTranslations.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translation.value.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || item.translation.status === selectedStatus;
    const matchesLanguage = selectedLanguage === 'all' || item.language.code === selectedLanguage;

    return matchesSearch && matchesStatus && matchesLanguage;
  });

  // Calculate stats
  const stats = {
    total: fieldTranslations.length,
    completed: fieldTranslations.filter(t => t.translation.status === 'completed').length,
    inProgress: fieldTranslations.filter(t => t.translation.status === 'in_progress').length,
    empty: fieldTranslations.filter(t => t.translation.status === 'empty').length,
    inherited: fieldTranslations.filter(t => t.translation.status === 'inherited').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckIcon className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <ClockIcon className="w-4 h-4 text-yellow-600" />;
      case 'inherited':
        return <AlertCircleIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircleIcon className="w-4 h-4 text-red-500" />;
    }
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-6 border-b space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search translations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="empty">Empty</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="inherited">Inherited</option>
          </select>
          
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Languages</option>
            {project.languages.filter(l => l.code !== 'en').map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm">
          {currentVariant && (
            <span className="text-gray-600">
              Variant: <span className="font-medium">{currentVariant.name}</span>
            </span>
          )}
          <span className="text-gray-600">
            Total: <span className="font-medium">{stats.total}</span>
          </span>
          <span className="text-green-600">
            Completed: <span className="font-medium">{stats.completed}</span>
          </span>
          <span className="text-yellow-600">
            In Progress: <span className="font-medium">{stats.inProgress}</span>
          </span>
          <span className="text-red-600">
            Empty: <span className="font-medium">{stats.empty}</span>
          </span>
          {stats.inherited > 0 && (
            <span className="text-gray-500">
              Inherited: <span className="font-medium">{stats.inherited}</span>
            </span>
          )}
        </div>
      </div>
      
      {/* Translations List */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Field
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Language
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Translation
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTranslations.map((item, index) => (
              <tr key={`${item.fieldId}-${item.language.code}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {item.fieldName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {item.deliverableName} / {item.assetName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {item.language.flag} {item.language.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className={item.translation.status === 'inherited' ? 'italic text-gray-500' : ''}>
                    {item.translation.value || <span className="text-gray-400">Empty</span>}
                  </div>
                  {item.translation.status === 'inherited' && item.translation.inheritedFrom && (
                    <div className="text-xs text-gray-500 mt-1">
                      Inherited from base variant
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(item.translation.status)}
                    <span className="capitalize">{item.translation.status.replace('_', ' ')}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full h-[85vh] flex flex-col">
          {content}
        </div>
      </div>
    </>
  );
}