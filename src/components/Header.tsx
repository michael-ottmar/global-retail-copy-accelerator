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
  RedoIcon
} from 'lucide-react';
import { exportToFigmaJSON, downloadJSON } from '../utils/exportJson';
import { useState, useEffect } from 'react';

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
    lastSaved,
    undo,
    redo,
    canUndo,
    canRedo,
    showVariableColumn,
    setShowVariableColumn
  } = useStore();
  
  const [showAutoSaved, setShowAutoSaved] = useState(false);

  useEffect(() => {
    if (lastSaved) {
      setShowAutoSaved(true);
      const timer = setTimeout(() => setShowAutoSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  const handleExportJSON = () => {
    if (!project) return;
    
    const jsonContent = exportToFigmaJSON(project, translations);
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
                onClick={() => setCurrentView('preview')}
                className={`flex items-center px-3 py-1.5 text-sm font-medium transition-colors ${
                  currentView === 'preview'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <EyeIcon className="w-4 h-4" />
                <span className="ml-1.5">Preview</span>
              </button>
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <SettingsIcon className="w-5 h-5" />
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200"
            >
              <DownloadIcon className="w-4 h-4 inline mr-1.5" />
              Export
            </button>

            <button className="px-3 py-1.5 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-lg flex items-center">
              <SparklesIcon className="w-4 h-4 mr-1.5" />
              AI Assistant
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Toolbar - Only show in table view */}
      {currentView === 'table' && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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

              {/* Add Language Button */}
              <button 
                className="text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg"
                onClick={() => useStore.getState().setAddingLanguage(true)}
              >
                Add a language column
              </button>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {/* Variable Toggle */}
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showVariableColumn}
                    onChange={(e) => setShowVariableColumn(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
                <span>{totalVariables} variables</span>
              </div>
              <span>•</span>
              <span>{project?.languages.length} languages</span>
              <span>•</span>
              
              {/* Auto-save indicator */}
              {showAutoSaved ? (
                <span className="text-green-600 flex items-center">
                  <CheckIcon className="w-3 h-3 mr-1" />
                  Auto-saved
                </span>
              ) : (
                <span className="text-gray-500">
                  {completedTranslations}/{totalTranslations} translations
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}