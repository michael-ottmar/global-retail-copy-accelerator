import { useState, useEffect } from 'react';
import { XIcon, PlusIcon } from 'lucide-react';
import { useStore } from '../store';
import { standardLanguages, type LanguageOption } from '../utils/languageCodes';

interface LanguageOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanguageOverlay({ isOpen, onClose }: LanguageOverlayProps) {
  const { project, addLanguage, removeLanguage } = useStore();
  const [selectedLanguages, setSelectedLanguages] = useState<Set<string>>(new Set());
  const [customMarketCode, setCustomMarketCode] = useState('');
  const [customLanguageName, setCustomLanguageName] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Initialize selected languages from project
  useEffect(() => {
    if (project) {
      const codes = new Set(project.languages.map(lang => lang.code));
      setSelectedLanguages(codes);
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleToggleLanguage = (languageOption: LanguageOption) => {
    const newSelected = new Set(selectedLanguages);
    
    if (newSelected.has(languageOption.code)) {
      newSelected.delete(languageOption.code);
    } else {
      newSelected.add(languageOption.code);
    }
    
    setSelectedLanguages(newSelected);
  };

  const handleAddCustomLanguage = () => {
    if (customMarketCode && customLanguageName) {
      const customCode = `${customLanguageName.toLowerCase()}-${customMarketCode.toUpperCase()}`;
      const newSelected = new Set(selectedLanguages);
      newSelected.add(customCode);
      setSelectedLanguages(newSelected);
      
      // Reset form
      setCustomMarketCode('');
      setCustomLanguageName('');
      setShowCustomForm(false);
    }
  };

  const handleSave = () => {
    if (!project) return;

    // Get current language codes
    const currentCodes = new Set(project.languages.map(lang => lang.code));
    
    // Add new languages
    selectedLanguages.forEach(code => {
      if (!currentCodes.has(code)) {
        // Find in standard languages
        const standardLang = standardLanguages.find(lang => lang.code === code);
        if (standardLang) {
          addLanguage(code, standardLang.name, standardLang.flag);
        } else {
          // Handle custom language
          const [lang] = code.split('-');
          addLanguage(code, lang.charAt(0).toUpperCase() + lang.slice(1), '🌐');
        }
      }
    });
    
    // Remove unselected languages
    currentCodes.forEach(code => {
      if (!selectedLanguages.has(code) && code !== 'en') { // Don't allow removing English
        removeLanguage(code);
      }
    });
    
    onClose();
  };

  // Group languages by region
  const languagesByRegion = standardLanguages.reduce((acc, lang) => {
    const region = lang.region.includes('United') ? 'Americas' :
                   ['China', 'Japan', 'Korea', 'India', 'Thailand', 'Vietnam', 'Indonesia', 'Malaysia', 'Philippines', 'Australia', 'New Zealand', 'Singapore', 'Taiwan', 'Hong Kong'].some(country => lang.region.includes(country)) ? 'Asia-Pacific' :
                   ['Saudi', 'Arab', 'Egypt', 'Morocco', 'Israel', 'Iran', 'Pakistan', 'South Africa', 'Kenya', 'Ethiopia'].some(country => lang.region.includes(country)) ? 'Middle East & Africa' :
                   'Europe';
    
    if (!acc[region]) acc[region] = [];
    acc[region].push(lang);
    return acc;
  }, {} as Record<string, LanguageOption[]>);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Manage Languages</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-gray-600 mb-6">
              Select the languages you want to include in your project. English (en-US) is required and cannot be removed.
            </p>

            {/* Language List by Region */}
            <div className="space-y-8">
              {Object.entries(languagesByRegion).map(([region, languages]) => (
                <div key={region}>
                  <h3 className="text-lg font-medium mb-3">{region}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {languages.map(lang => (
                      <label
                        key={lang.code}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedLanguages.has(lang.code)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${lang.code === 'en-US' ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedLanguages.has(lang.code)}
                          onChange={() => handleToggleLanguage(lang)}
                          disabled={lang.code === 'en-US'}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                          selectedLanguages.has(lang.code)
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedLanguages.has(lang.code) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 10">
                              <path d="M10.28.28L3.989 6.575 1.695 4.28A1 1 0 00.28 5.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28.28z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm">
                          {lang.code} - {lang.flag} {lang.name}
                          {lang.region && <span className="text-gray-500"> ({lang.region})</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Language Section */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-medium mb-3">Custom Language</h3>
              
              {!showCustomForm ? (
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="flex items-center text-purple-600 hover:text-purple-700"
                >
                  <PlusIcon className="w-5 h-5 mr-1" />
                  Add custom language code
                </button>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language Code
                      </label>
                      <input
                        type="text"
                        value={customLanguageName}
                        onChange={(e) => setCustomLanguageName(e.target.value.toLowerCase())}
                        placeholder="en, es, fr, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        maxLength={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Market Code
                      </label>
                      <input
                        type="text"
                        value={customMarketCode}
                        onChange={(e) => setCustomMarketCode(e.target.value.toUpperCase())}
                        placeholder="US, GB, FR, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        maxLength={2}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowCustomForm(false);
                        setCustomMarketCode('');
                        setCustomLanguageName('');
                      }}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCustomLanguage}
                      disabled={!customMarketCode || !customLanguageName}
                      className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Language
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              {selectedLanguages.size} language{selectedLanguages.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-500 text-white hover:bg-purple-600 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}