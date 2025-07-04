import { create } from 'zustand';
import type { Project, Asset, Field, Translation, Language, FieldType } from '../types';
import { getSampleContent } from '../utils/sampleContent';

interface Store {
  // Project data
  project: Project | null;
  translations: Translation[];
  
  // UI state
  currentView: 'table' | 'preview';
  selectedLanguage: string;
  selectedDeliverable: string | null;
  
  // Actions
  setProject: (project: Project) => void;
  setTranslations: (translations: Translation[]) => void;
  updateTranslation: (fieldId: string, languageCode: string, value: string) => void;
  setCurrentView: (view: 'table' | 'preview') => void;
  setSelectedLanguage: (language: string) => void;
  setSelectedDeliverable: (deliverableId: string | null) => void;
  
  // Deliverable management
  addAsset: (deliverableId: string, assetType: string) => void;
  removeAsset: (assetId: string) => void;
  addCustomField: (assetId: string, fieldName: string) => void;
  
  // Language management
  addLanguage: (languageCode: string) => void;
  
  // Sample data
  fillSampleContent: () => void;
  clearAllTranslations: () => void;
}

export const useStore = create<Store>((set) => ({
  // Initial state
  project: null,
  translations: [],
  currentView: 'table',
  selectedLanguage: 'en',
  selectedDeliverable: null,
  
  // Actions
  setProject: (project) => set({ project }),
  setTranslations: (translations) => set({ translations }),
  
  updateTranslation: (fieldId, languageCode, value) => set((state) => ({
    translations: state.translations.map(t => 
      t.fieldId === fieldId && t.languageCode === languageCode
        ? { ...t, value, status: value ? 'in_progress' : 'empty', lastModified: new Date() }
        : t
    )
  })),
  
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),
  setSelectedDeliverable: (deliverableId) => set({ selectedDeliverable: deliverableId }),
  
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
        deliverables: state.project.deliverables.map(d => 
          d.id === deliverableId 
            ? { ...d, assets: [...d.assets, newAsset] }
            : d
        )
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
  
  addLanguage: (languageCode: string) => set((state) => {
    if (!state.project) return state;
    
    // Check if language already exists
    if (state.project.languages.some(l => l.code === languageCode)) {
      return state;
    }
    
    const newLanguage: Language = {
      code: languageCode,
      name: languageCode.toUpperCase(),
      flag: '🌐'
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