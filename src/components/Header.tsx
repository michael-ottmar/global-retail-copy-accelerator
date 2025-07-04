import { useStore } from '../store';
import { TableIcon, EyeIcon, DownloadIcon } from 'lucide-react';
import { exportToFigmaJSON, downloadJSON } from '../utils/exportJson';

export function Header() {
  const { currentView, setCurrentView, selectedLanguage, setSelectedLanguage, project, translations } = useStore();

  const handleExportJSON = () => {
    if (!project) return;
    
    const jsonContent = exportToFigmaJSON(project, translations);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadJSON(jsonContent, `${project.name.replace(/\s+/g, '-')}_${timestamp}.json`);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Global Retail Copy Accelerator
            </h1>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('table')}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4 mr-2" />
                Table View
              </button>
              <button
                onClick={() => setCurrentView('preview')}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Preview View
              </button>
            </div>

            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="block w-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              {project?.languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>

            {/* Export Button */}
            <button
              onClick={handleExportJSON}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export JSON
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}