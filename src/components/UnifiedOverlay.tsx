import { useState, useEffect } from 'react';
import { XIcon, SettingsIcon, PackageIcon, LanguagesIcon, FileTextIcon } from 'lucide-react';
import { SettingsOverlay } from './SettingsOverlay';
import { LanguageOverlay } from './LanguageOverlay';
import { SkuVariantsOverlay } from './SkuVariantsOverlay';
import { TranslationsOverlay } from './TranslationsOverlay';

interface UnifiedOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'settings' | 'variants' | 'languages' | 'translations';
}

export function UnifiedOverlay({ isOpen, onClose, defaultTab = 'settings' }: UnifiedOverlayProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Update active tab when defaultTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'settings', label: 'Project Settings', icon: SettingsIcon },
    { id: 'variants', label: 'SKU Variants', icon: PackageIcon },
    { id: 'languages', label: 'Languages', icon: LanguagesIcon },
    { id: 'translations', label: 'Translations', icon: FileTextIcon },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[85vh] flex flex-col">
          {/* Header with Tabs */}
          <div className="border-b">
            <div className="flex items-center justify-between px-6 pt-6">
              <div className="flex items-center space-x-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'text-purple-600 border-purple-600'
                          : 'text-gray-600 border-transparent hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'settings' && <SettingsContent />}
            {activeTab === 'variants' && <VariantsContent />}
            {activeTab === 'languages' && <LanguagesContent />}
            {activeTab === 'translations' && <TranslationsContent />}
          </div>
        </div>
      </div>
    </>
  );
}

// Extract content from existing overlays
function SettingsContent() {
  return <SettingsOverlay isOpen={true} onClose={() => {}} isEmbedded={true} />;
}

function VariantsContent() {
  return <SkuVariantsOverlay isOpen={true} onClose={() => {}} isEmbedded={true} />;
}

function LanguagesContent() {
  return <LanguageOverlay isOpen={true} onClose={() => {}} isEmbedded={true} />;
}

function TranslationsContent() {
  return <TranslationsOverlay isOpen={true} onClose={() => {}} isEmbedded={true} />;
}