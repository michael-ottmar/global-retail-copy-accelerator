export type FieldType = 'headline' | 'body' | 'legal' | 'feature' | 'cta' | 'productName' | 'productDetails' | 'bullet' | 'custom';

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  customName?: string;
}

export interface Translation {
  fieldId: string;
  languageCode: string;
  variantId?: string; // Optional for backward compatibility
  value: string;
  status: 'empty' | 'in_progress' | 'completed' | 'ai_generated' | 'inherited';
  inheritedFrom?: string; // variantId this value is inherited from
  lastModified?: Date;
}

export interface Asset {
  id: string;
  name: string;
  type: 'gallery' | 'module' | 'productDetails' | 'banner';
  fields: Field[];
  order: number;
  parentId?: string;
}

export interface Deliverable {
  id: string;
  name: string;
  type: 'pdp' | 'banner' | 'crm';
  assets: Asset[];
  order: number;
}

export interface Language {
  code: string;
  name: string;
  flag?: string;
}

export interface SkuVariant {
  id: string;
  name: string;
  isBase: boolean;
  order: number;
}

export interface ProjectSettings {
  clientName?: string;
  customInstructions?: string;
  referenceFiles?: {
    id: string;
    name: string;
    size: number;
    type: string;
  }[];
}

export interface Project {
  id: string;
  name: string;
  deliverables: Deliverable[];
  languages: Language[];
  sourceLanguage: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: ProjectSettings;
  skuVariants?: SkuVariant[];
}