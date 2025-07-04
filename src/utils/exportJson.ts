import type { Project, Translation } from '../types';

export function exportToFigmaJSON(project: Project, translations: Translation[]): string {
  const figmaVariables: any = {
    version: '1.0',
    name: project.name,
    variables: {},
    collections: {}
  };

  // Create a collection for each language
  project.languages.forEach(lang => {
    figmaVariables.collections[lang.code] = {
      name: lang.name,
      modes: {}
    };
  });

  // Process each deliverable
  project.deliverables.forEach(deliverable => {
    deliverable.assets.forEach(asset => {
      asset.fields.forEach(field => {
        // Create variable key based on the hierarchy
        const variableKey = createVariableKey(deliverable, asset, field);
        
        // Create the variable if it doesn't exist
        if (!figmaVariables.variables[variableKey]) {
          figmaVariables.variables[variableKey] = {
            name: variableKey,
            type: 'string',
            values: {}
          };
        }

        // Add translations for each language
        project.languages.forEach(lang => {
          const translation = translations.find(
            t => t.fieldId === field.id && t.languageCode === lang.code
          );
          
          figmaVariables.variables[variableKey].values[lang.code] = 
            translation?.value || '';
        });
      });
    });
  });

  return JSON.stringify(figmaVariables, null, 2);
}

function createVariableKey(deliverable: any, asset: any, field: any): string {
  // Create a hierarchical key structure
  const parts = [
    deliverable.name.toLowerCase().replace(/\s+/g, '_'),
    asset.name.toLowerCase().replace(/\s+/g, '_'),
    (field.customName || field.name).toLowerCase().replace(/\s+/g, '_')
  ];
  
  return parts.join('/');
}

export function downloadJSON(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Word Export Architecture (Phase 2)
 * 
 * Approach 1: Client-side generation using docx.js
 * - Use the 'docx' npm package to generate Word documents in the browser
 * - Create structured documents with:
 *   - Title page with project name and export date
 *   - Table of contents
 *   - Sections for each deliverable type (PDP, Banners, CRM)
 *   - Tables showing source and target language side by side
 *   - Styling to match brand guidelines
 * 
 * Approach 2: Server-side generation (if we add a backend)
 * - Use a template-based approach with docxtemplater
 * - Pre-designed Word templates with placeholders
 * - Better formatting control and corporate template support
 * 
 * Export options:
 * - One document per language
 * - One document with all languages
 * - Separate documents per deliverable type
 * - Include/exclude empty translations
 * - Include/exclude field metadata (variable names)
 * 
 * Implementation plan:
 * 1. Add docx dependency
 * 2. Create WordExporter class
 * 3. Define document structure and styling
 * 4. Generate sections dynamically based on project structure
 * 5. Add export options UI in a modal
 * 6. Support batch export for multiple languages
 */

// Stub for future Word export
export async function exportToWord(
  _project: Project, 
  _translations: Translation[], 
  _options: {
    languages: string[];
    includeEmpty: boolean;
    documentPerLanguage: boolean;
  }
): Promise<Blob[]> {
  // TODO: Implement Word export
  throw new Error('Word export not yet implemented');
}