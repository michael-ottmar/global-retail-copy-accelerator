import { create } from 'zustand';
import type { Project, Asset, Field, Translation, Language, FieldType, ProjectSettings, SkuVariant } from '../types';
import { getSampleContent } from '../utils/sampleContent';

interface Store {
  // Project data
  project: Project | null;
  translations: Translation[];
  
  // UI state
  currentView: 'table' | 'mockup' | 'word';
  selectedLanguage: string;
  selectedDeliverable: string | null;
  selectedVariant: string | null;
  searchQuery: string;
  addingLanguage: boolean;
  lastSaved: Date | null;
  showVariableColumn: boolean;
  
  // Section toggles (enabled by default)
  sectionToggles: {
    pdp: boolean;
    banners: boolean;
    crm: boolean;
  };
  
  // Undo/Redo
  history: Translation[][];
  historyIndex: number;
  
  // Actions
  setProject: (project: Project) => void;
  setTranslations: (translations: Translation[]) => void;
  updateTranslation: (fieldId: string, languageCode: string, value: string) => void;
  setCurrentView: (view: 'table' | 'mockup' | 'word') => void;
  setSelectedLanguage: (language: string) => void;
  setSelectedDeliverable: (deliverableId: string | null) => void;
  setSelectedVariant: (variantId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setAddingLanguage: (adding: boolean) => void;
  setShowVariableColumn: (show: boolean) => void;
  toggleSection: (section: 'pdp' | 'banners' | 'crm') => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Deliverable management
  addAsset: (deliverableId: string, assetType: string) => void;
  removeAsset: (assetId: string) => void;
  removeField: (assetId: string, fieldId: string) => void;
  addCustomField: (assetId: string, fieldName: string) => void;
  updateAssetName: (assetId: string, name: string) => void;
  updateFieldName: (assetId: string, fieldId: string, name: string) => void;
  duplicateAsset: (deliverableId: string, assetId: string) => void;
  reorderAsset: (deliverableId: string, fromAssetId: string, toAssetId: string) => void;
  reorderField: (assetId: string, fromFieldId: string, toFieldId: string) => void;
  
  // Language management
  addLanguage: (languageCode: string, name?: string, flag?: string) => void;
  removeLanguage: (languageCode: string) => void;
  
  // Project settings
  updateProjectName: (name: string) => void;
  updateProjectSettings: (settings: ProjectSettings) => void;
  
  // SKU Variants
  updateSkuVariants: (variants: SkuVariant[]) => void;
  
  // Sample data
  fillSampleContent: () => void;
  clearAllTranslations: () => void;
}

export const useStore = create<Store>((set, get) => ({
  // Initial state
  project: null,
  translations: [],
  currentView: 'table',
  selectedLanguage: 'all',
  selectedDeliverable: null,
  selectedVariant: null,
  searchQuery: '',
  addingLanguage: false,
  lastSaved: null,
  showVariableColumn: false,
  sectionToggles: {
    pdp: true,
    banners: true,
    crm: true
  },
  history: [[]],
  historyIndex: 0,
  
  // Actions
  setProject: (project) => set({ project }),
  setTranslations: (translations) => set({ translations }),
  
  updateTranslation: (fieldId, languageCode, value) => set((state) => {
    const newTranslations = state.translations.map(t => 
      t.fieldId === fieldId && t.languageCode === languageCode
        ? { ...t, value, status: value ? ('in_progress' as const) : ('empty' as const), lastModified: new Date() }
        : t
    );
    
    // Add to history for undo/redo
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newTranslations);
    
    return {
      translations: newTranslations,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      lastSaved: new Date()
    };
  }),
  
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),
  setSelectedDeliverable: (deliverableId) => set({ selectedDeliverable: deliverableId }),
  setSelectedVariant: (variantId) => set({ selectedVariant: variantId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setAddingLanguage: (adding) => set({ addingLanguage: adding }),
  setShowVariableColumn: (show) => set({ showVariableColumn: show }),
  
  toggleSection: (section) => set((state) => ({
    sectionToggles: {
      ...state.sectionToggles,
      [section]: !state.sectionToggles[section]
    }
  })),
  
  // Undo/Redo
  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      return {
        translations: state.history[state.historyIndex - 1],
        historyIndex: state.historyIndex - 1
      };
    }
    return state;
  }),
  
  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      return {
        translations: state.history[state.historyIndex + 1],
        historyIndex: state.historyIndex + 1
      };
    }
    return state;
  }),
  
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
  
  addAsset: (deliverableId, assetType) => set((state) => {
    if (!state.project) return state;
    
    const deliverable = state.project.deliverables.find(d => d.id === deliverableId);
    if (!deliverable) return state;
    
    const newAsset: Asset = {
      id: `${Date.now()}`,
      name: assetType === 'gallery' ? `Gallery Image ${deliverable.assets.filter(a => a.type === 'gallery').length + 1}` : 
            assetType === 'module' ? `Module ${deliverable.assets.filter(a => a.type === 'module').length + 1}` : 
            assetType,
      type: assetType as any,
      fields: getDefaultFields(assetType),
      order: deliverable.assets.length,
    };
    
    return {
      project: {
        ...state.project,
        deliverables: state.project.deliverables.map(d => {
          if (d.id !== deliverableId) return d;
          
          // For gallery images, insert after the last gallery image
          if (assetType === 'gallery') {
            let lastGalleryIndex = -1;
            for (let i = d.assets.length - 1; i >= 0; i--) {
              if (d.assets[i].type === 'gallery') {
                lastGalleryIndex = i;
                break;
              }
            }
            if (lastGalleryIndex !== -1) {
              const newAssets = [...d.assets];
              newAssets.splice(lastGalleryIndex + 1, 0, newAsset);
              return { ...d, assets: newAssets };
            }
          }
          
          // For other types or if no gallery images exist, add at the end
          return { ...d, assets: [...d.assets, newAsset] };
        })
      }
    };
  }),
  
  removeAsset: (assetId) => set((state) => {
    if (!state.project) return state;
    
    return {
      project: {
        ...state.project,
        deliverables: state.project.deliverables.map(d => ({
          ...d,
          assets: d.assets.filter(a => a.id !== assetId)
        }))
      }
    };
  }),
  
  addCustomField: (assetId, fieldName) => set((state) => {
    if (!state.project) return state;
    
    const newField: Field = {
      id: `${Date.now()}`,
      name: fieldName,
      type: 'custom',
      customName: fieldName
    };
    
    return {
      project: {
        ...state.project,
        deliverables: state.project.deliverables.map(d => ({
          ...d,
          assets: d.assets.map(a => 
            a.id === assetId 
              ? { ...a, fields: [...a.fields, newField] }
              : a
          )
        }))
      }
    };
  }),
  
  removeField: (assetId, fieldId) => set((state) => {
    if (!state.project) return state;
    
    return {
      project: {
        ...state.project,
        deliverables: state.project.deliverables.map(d => ({
          ...d,
          assets: d.assets.map(a => 
            a.id === assetId 
              ? { ...a, fields: a.fields.filter(f => f.id !== fieldId) }
              : a
          )
        }))
      }
    };
  }),
  
  updateAssetName: (assetId, name) => set((state) => {
    if (!state.project) return state;
    
    return {
      project: {
        ...state.project,
        deliverables: state.project.deliverables.map(d => ({
          ...d,
          assets: d.assets.map(a => 
            a.id === assetId 
              ? { ...a, name }
              : a
          )
        }))
      }
    };
  }),
  
  updateFieldName: (assetId, fieldId, name) => set((state) => {
    if (!state.project) return state;
    
    return {
      project: {
        ...state.project,
        deliverables: state.project.deliverables.map(d => ({
          ...d,
          assets: d.assets.map(a => 
            a.id === assetId 
              ? { 
                  ...a, 
                  fields: a.fields.map(f => 
                    f.id === fieldId 
                      ? { ...f, customName: name }
                      : f
                  )
                }
              : a
          )
        }))
      }
    };
  }),
  
  duplicateAsset: (deliverableId, assetId) => set((state) => {
    if (!state.project) return state;
    
    const deliverable = state.project.deliverables.find(d => d.id === deliverableId);
    const assetToDuplicate = deliverable?.assets.find(a => a.id === assetId);
    
    if (!assetToDuplicate) return state;
    
    const newAsset: Asset = {
      ...assetToDuplicate,
      id: `${Date.now()}`,
      name: `${assetToDuplicate.name} Copy`,
      fields: assetToDuplicate.fields.map(field => ({
        ...field,
        id: `${Date.now()}-${field.id}`
      }))
    };
    
    // Also create translations for the new fields
    const newTranslations: Translation[] = [];
    newAsset.fields.forEach(field => {
      state.project!.languages.forEach(language => {
        newTranslations.push({
          fieldId: field.id,
          languageCode: language.code,
          value: '',
          status: 'empty' as const
        });
      });
    });
    
    return {
      project: {
        ...state.project,
        deliverables: state.project.deliverables.map(d => {
          if (d.id !== deliverableId) return d;
          
          // Find the index of the asset to duplicate
          const assetIndex = d.assets.findIndex(a => a.id === assetId);
          if (assetIndex === -1) return d;
          
          // Insert the new asset right after the original
          const newAssets = [...d.assets];
          newAssets.splice(assetIndex + 1, 0, newAsset);
          
          return { ...d, assets: newAssets };
        })
      },
      translations: [...state.translations, ...newTranslations]
    };
  }),
  
  reorderAsset: (deliverableId, fromAssetId, toAssetId) => set((state) => {
    if (!state.project) return state;
    
    return {
      project: {
        ...state.project,
        deliverables: state.project.deliverables.map(d => {
          if (d.id !== deliverableId) return d;
          
          const assets = [...d.assets];
          const fromIndex = assets.findIndex(a => a.id === fromAssetId);
          const toIndex = assets.findIndex(a => a.id === toAssetId);
          
          if (fromIndex === -1 || toIndex === -1) return d;
          
          const [movedAsset] = assets.splice(fromIndex, 1);
          assets.splice(toIndex, 0, movedAsset);
          
          return { ...d, assets };
        })
      }
    };
  }),
  
  reorderField: (assetId, fromFieldId, toFieldId) => set((state) => {
    if (!state.project) return state;
    
    return {
      project: {
        ...state.project,
        deliverables: state.project.deliverables.map(d => ({
          ...d,
          assets: d.assets.map(a => {
            if (a.id !== assetId) return a;
            
            const fields = [...a.fields];
            const fromIndex = fields.findIndex(f => f.id === fromFieldId);
            const toIndex = fields.findIndex(f => f.id === toFieldId);
            
            if (fromIndex === -1 || toIndex === -1) return a;
            
            const [movedField] = fields.splice(fromIndex, 1);
            fields.splice(toIndex, 0, movedField);
            
            return { ...a, fields };
          })
        }))
      }
    };
  }),
  
  addLanguage: (languageCode: string, name?: string, flag?: string) => set((state) => {
    if (!state.project) return state;
    
    // Check if language already exists
    if (state.project.languages.some(l => l.code === languageCode)) {
      return state;
    }
    
    const newLanguage: Language = {
      code: languageCode,
      name: name || languageCode.toUpperCase(),
      flag: flag || '🌐'
    };
    
    // Create empty translations for all fields in the new language
    const newTranslations: Translation[] = [];
    state.project.deliverables.forEach(deliverable => {
      deliverable.assets.forEach(asset => {
        asset.fields.forEach(field => {
          newTranslations.push({
            fieldId: field.id,
            languageCode: languageCode,
            value: '',
            status: 'empty'
          });
        });
      });
    });
    
    return {
      project: {
        ...state.project,
        languages: [...state.project.languages, newLanguage]
      },
      translations: [...state.translations, ...newTranslations]
    };
  }),
  
  removeLanguage: (languageCode: string) => set((state) => {
    if (!state.project || languageCode === 'en') return state; // Can't remove English
    
    return {
      project: {
        ...state.project,
        languages: state.project.languages.filter(l => l.code !== languageCode)
      },
      translations: state.translations.filter(t => t.languageCode !== languageCode)
    };
  }),
  
  updateProjectName: (name) => set((state) => {
    if (!state.project) return state;
    return {
      project: {
        ...state.project,
        name,
        updatedAt: new Date()
      }
    };
  }),
  
  updateProjectSettings: (settings) => set((state) => {
    if (!state.project) return state;
    return {
      project: {
        ...state.project,
        settings: {
          ...state.project.settings,
          ...settings
        },
        updatedAt: new Date()
      }
    };
  }),
  
  updateSkuVariants: (variants) => set((state) => {
    if (!state.project) return state;
    return {
      project: {
        ...state.project,
        skuVariants: variants,
        updatedAt: new Date()
      }
    };
  }),
  
  fillSampleContent: () => set((state) => {
    if (!state.project) return state;
    
    const sampleContent = getSampleContent();
    const updatedTranslations = state.translations.map(t => {
      if (t.languageCode === 'en') {
        const content = sampleContent[t.fieldId];
        if (content) {
          return { ...t, value: content, status: 'completed' as const };
        }
      }
      return t;
    });
    
    return { translations: updatedTranslations };
  }),
  
  clearAllTranslations: () => set((state) => ({
    translations: state.translations.map(t => ({
      ...t,
      value: '',
      status: 'empty' as const
    }))
  })),
}));

// Helper function to get default fields for asset types
function getDefaultFields(assetType: string): Field[] {
  const baseFields = [
    { id: '1', name: 'Headline', type: 'headline' as FieldType },
    { id: '2', name: 'Body', type: 'body' as FieldType },
    { id: '3', name: 'Legal', type: 'legal' as FieldType },
    { id: '4', name: 'Feature', type: 'feature' as FieldType },
  ];
  
  if (assetType === 'banner') {
    return [...baseFields, { id: '5', name: 'CTA', type: 'cta' as FieldType }];
  }
  
  if (assetType === 'productDetails') {
    return [
      { id: '1', name: 'Product Name', type: 'productName' as FieldType },
      { id: '2', name: 'Product Details', type: 'productDetails' as FieldType },
      { id: '3', name: 'Bullet 1', type: 'bullet' as FieldType },
      { id: '4', name: 'Bullet 2', type: 'bullet' as FieldType },
      { id: '5', name: 'Bullet 3', type: 'bullet' as FieldType },
      { id: '6', name: 'Bullet 4', type: 'bullet' as FieldType },
    ];
  }
  
  return baseFields;
}