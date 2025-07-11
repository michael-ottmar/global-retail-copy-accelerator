import { useStore } from '../store';
import { 
  ArrowLeftIcon, 
  TableIcon, 
  EyeIcon, 
  DownloadIcon, 
  SettingsIcon, 
  SparklesIcon,
  SearchIcon,
  RefreshCwIcon,
  CheckIcon,
  UndoIcon,
  RedoIcon,
  FileTextIcon,
  ChevronDownIcon,
  PlusIcon,
  LanguagesIcon,
  PackageIcon,
  ToggleLeftIcon
} from 'lucide-react';
import { exportToFigmaJSON, downloadJSON } from '../utils/exportJson';
import { exportToWord } from '../utils/exportWord';
import { exportToHtml } from '../utils/exportHtml';
import { useState, useEffect } from 'react';
import { SettingsOverlay } from './SettingsOverlay';
import { LanguageOverlay } from './LanguageOverlay';
import { SkuVariantsOverlay } from './SkuVariantsOverlay';

export function Header() {
  const { 
    currentView, 
    setCurrentView, 
    selectedLanguage, 
    setSelectedLanguage, 
    project, 
    translations,
    searchQuery,
    setSearchQuery,
    selectedDeliverable,
    setSelectedDeliverable,
    selectedVariant,
    setSelectedVariant,
    lastSaved,
    undo,
    redo,
    canUndo,
    canRedo,
    showVariableColumn,
    setShowVariableColumn,
    sectionToggles
  } = useStore();
  
  const [showAutoSaved, setShowAutoSaved] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showSkuVariants, setShowSkuVariants] = useState(false);

  useEffect(() => {
    if (lastSaved) {
      setShowAutoSaved(true);
      const timer = setTimeout(() => setShowAutoSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && !(event.target as HTMLElement).closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportMenu]);

  const handleExportJSON = () => {
    if (!project) return;
    
    const jsonContent = exportToFigmaJSON(project, translations, sectionToggles);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadJSON(jsonContent, `${project.name.replace(/\s+/g, '-')}_${timestamp}.json`);
  };

  const completedTranslations = translations.filter(t => t.value && t.languageCode !== 'en').length;
  const totalTranslations = translations.filter(t => t.languageCode !== 'en').length;
  const totalVariables = project?.deliverables.reduce((acc, d) => 
    acc + d.assets.reduce((assetAcc, a) => assetAcc + a.fields.length, 0), 0
  ) || 0;

  return (
    <>
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-1 hover:bg-gray-100 rounded">
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-medium text-gray-900">
              {project?.name || 'Untitled Project'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setCurrentView('table')}
                className={`flex items-center px-3 py-1.5 text-sm font-medium transition-colors ${
                  currentView === 'table'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4" />
                <span className="ml-1.5">Table</span>
              </button>
              <button
                onClick={() => setCurrentView('mockup')}
                className={`flex items-center px-3 py-1.5 text-sm font-medium transition-colors ${
                  currentView === 'mockup'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <EyeIcon className="w-4 h-4" />
                <span className="ml-1.5">Mockup</span>
              </button>
              <button
                onClick={() => setCurrentView('word')}
                className={`flex items-center px-3 py-1.5 text-sm font-medium transition-colors ${
                  currentView === 'word'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileTextIcon className="w-4 h-4" />
                <span className="ml-1.5">Word</span>
              </button>
            </div>

            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>

            <div className="relative export-menu-container">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 flex items-center"
              >
                <DownloadIcon className="w-4 h-4 mr-1.5" />
                Export
                <ChevronDownIcon className="w-4 h-4 ml-1" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      handleExportJSON();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    Export as JSON
                  </button>
                  <button
                    onClick={async () => {
                      if (project) {
                        await exportToWord(project, translations, selectedLanguage, { sectionToggles });
                        setShowExportMenu(false);
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    Export as Word (.docx)
                  </button>
                  <button
                    onClick={() => {
                      if (project) {
                        exportToHtml(project, translations, selectedLanguage, { sectionToggles });
                        setShowExportMenu(false);
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    Export as HTML
                  </button>
                </div>
              )}
            </div>

            <button className="px-3 py-1.5 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-lg flex items-center">
              <SparklesIcon className="w-4 h-4 mr-1.5" />
              AI Assistant
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Toolbar - Show in all views */}
      {(currentView === 'table' || currentView === 'mockup' || currentView === 'word') && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* SKU Variant Selector - Only show if 2+ variants */}
              {project?.skuVariants && project.skuVariants.length >= 2 && (
                <select
                  value={selectedVariant || project.skuVariants.find(v => v.isBase)?.id || ''}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {project.skuVariants
                    .sort((a, b) => a.order - b.order)
                    .map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name} {variant.isBase ? '(Base)' : ''}
                      </option>
                    ))}
                </select>
              )}
              
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All languages</option>
                {project?.languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.code.toUpperCase()}
                  </option>
                ))}
              </select>

              {/* Deliverables Filter */}
              <select
                value={selectedDeliverable || ''}
                onChange={(e) => setSelectedDeliverable(e.target.value || null)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Deliverables</option>
                {project?.deliverables.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
                />
              </div>

              {/* Find & Replace */}
              <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600" title="Find & Replace">
                <RefreshCwIcon className="w-4 h-4" />
              </button>

              {/* Undo/Redo */}
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => undo()}
                  disabled={!canUndo()}
                  className={`p-1.5 rounded-lg ${canUndo() ? 'hover:bg-gray-200 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
                  title="Undo (Cmd+Z)"
                >
                  <UndoIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => redo()}
                  disabled={!canRedo()}
                  className={`p-1.5 rounded-lg ${canRedo() ? 'hover:bg-gray-200 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
                  title="Redo (Cmd+Shift+Z)"
                >
                  <RedoIcon className="w-4 h-4" />
                </button>
              </div>

            </div>

            <div className="flex items-center space-x-3 text-sm text-gray-600">
              {/* SKU Variants Button */}
              <button
                onClick={() => setShowSkuVariants(true)}
                className="flex items-center hover:text-gray-800 transition-colors cursor-pointer"
              >
                <PackageIcon className="w-4 h-4 mr-1.5" />
                <span>{project?.skuVariants?.length || 0} SKU Variants</span>
              </button>
              <span className="text-gray-400">•</span>
              
              {/* Language Management Button */}
              <button
                onClick={() => setShowLanguages(true)}
                className="flex items-center hover:text-gray-800 transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center mr-1.5 hover:border-gray-600">
                  <PlusIcon className="w-3 h-3" />
                </div>
                <span>{project?.languages.length} languages</span>
              </button>
              <span className="text-gray-400">•</span>
              
              {/* Translations Button */}
              <button
                onClick={() => {/* TODO: Show translations overlay */}}
                className="flex items-center hover:text-gray-800 transition-colors cursor-pointer"
              >
                <LanguagesIcon className="w-4 h-4 mr-1.5" />
                {showAutoSaved ? (
                  <span className="text-green-600 flex items-center">
                    <CheckIcon className="w-3 h-3 mr-1" />
                    Auto-saved
                  </span>
                ) : (
                  <span>{completedTranslations}/{totalTranslations} translations</span>
                )}
              </button>
              
              {/* Variable Toggle - Only in table view */}
              {currentView === 'table' && (
                <>
                  <span className="text-gray-400">•</span>
                  <button
                    onClick={() => setShowVariableColumn(!showVariableColumn)}
                    className="flex items-center hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    <ToggleLeftIcon className={`w-4 h-4 mr-1.5 ${showVariableColumn ? 'text-purple-600' : ''}`} />
                    <span>{totalVariables} variables</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Overlay */}
      <SettingsOverlay 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      
      {/* Language Overlay */}
      <LanguageOverlay
        isOpen={showLanguages}
        onClose={() => setShowLanguages(false)}
      />
      
      {/* SKU Variants Overlay */}
      <SkuVariantsOverlay
        isOpen={showSkuVariants}
        onClose={() => setShowSkuVariants(false)}
      />
    </>
  );
}