import type { Project, Deliverable, Asset, Field, Language } from '../types';

export function createSampleProject(): Project {
  const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  ];

  const pdpDeliverable: Deliverable = {
    id: 'pdp-1',
    name: 'PDP',
    type: 'pdp',
    order: 1,
    assets: [
      {
        id: 'pd-1',
        name: 'Product Details',
        type: 'productDetails',
        order: 0,
        fields: [
          { id: 'pd-f1', name: 'Product Name', type: 'productName' },
          { id: 'pd-f2', name: 'Product Details', type: 'productDetails' },
          { id: 'pd-f3', name: 'Bullet 1', type: 'bullet' },
          { id: 'pd-f4', name: 'Bullet 2', type: 'bullet' },
          { id: 'pd-f5', name: 'Bullet 3', type: 'bullet' },
          { id: 'pd-f6', name: 'Bullet 4', type: 'bullet' },
        ],
      },
      ...createGalleryImages(5),
      ...createModules(3),
    ],
  };

  const bannerDeliverable: Deliverable = {
    id: 'banner-1',
    name: 'Banners',
    type: 'banner',
    order: 2,
    assets: [
      {
        id: 'banner-a',
        name: 'Banner A',
        type: 'banner',
        order: 0,
        fields: createBannerFields('a'),
      },
      {
        id: 'banner-b',
        name: 'Banner B',
        type: 'banner',
        order: 1,
        fields: createBannerFields('b'),
      },
      {
        id: 'banner-c',
        name: 'Banner C',
        type: 'banner',
        order: 2,
        fields: createBannerFields('c'),
      },
    ],
  };

  const crmDeliverable: Deliverable = {
    id: 'crm-1',
    name: 'CRM',
    type: 'crm',
    order: 3,
    assets: createModules(2, 'crm'),
  };

  return {
    id: 'project-1',
    name: 'Sample Retail Project',
    deliverables: [pdpDeliverable, bannerDeliverable, crmDeliverable],
    languages,
    sourceLanguage: 'en',
    createdAt: new Date(),
    updatedAt: new Date(),
    skuVariants: [
      { id: '1', name: 'Standard', isBase: true, order: 0 },
      { id: '2', name: 'Deluxe', isBase: false, order: 1 }
    ],
  };
}

function createGalleryImages(count: number): Asset[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `gallery-${i + 1}`,
    name: `Gallery Image ${i + 1}`,
    type: 'gallery' as const,
    order: i + 1,
    fields: createStandardFields(`g${i + 1}`),
  }));
}

function createModules(count: number, prefix = 'pdp'): Asset[] {
  const modules: Asset[] = [];
  for (let i = 0; i < count; i++) {
    // Add regular module
    modules.push({
      id: `${prefix}-module-${i + 1}`,
      name: `Module ${i + 1}`,
      type: 'module' as const,
      order: modules.length + 6, // After gallery images
      fields: createStandardFields(`${prefix}-m${i + 1}`),
    });
    
    // Add carousel variants for module 3
    if (i === 2 && prefix === 'pdp') {
      ['a', 'b', 'c'].forEach((letter) => {
        modules.push({
          id: `${prefix}-module-3${letter}`,
          name: `Module 3${letter}`,
          type: 'module' as const,
          order: modules.length + 6,
          fields: createStandardFields(`${prefix}-m3${letter}`),
        });
      });
    }
  }
  return modules;
}

function createStandardFields(prefix: string): Field[] {
  return [
    { id: `${prefix}-f1`, name: 'Headline', type: 'headline' },
    { id: `${prefix}-f2`, name: 'Body', type: 'body' },
    { id: `${prefix}-f3`, name: 'Legal', type: 'legal' },
    { id: `${prefix}-f4`, name: 'Feature', type: 'feature' },
  ];
}

function createBannerFields(variant: string): Field[] {
  return [
    { id: `banner-${variant}-f1`, name: 'Headline', type: 'headline' },
    { id: `banner-${variant}-f2`, name: 'Body', type: 'body' },
    { id: `banner-${variant}-f3`, name: 'Legal', type: 'legal' },
    { id: `banner-${variant}-f4`, name: 'Feature', type: 'feature' },
    { id: `banner-${variant}-f5`, name: 'CTA', type: 'cta' },
  ];
}