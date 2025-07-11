import type { Project, Translation } from '../types';
import { saveAs } from 'file-saver';

interface ExportOptions {
  sectionToggles: {
    pdp: boolean;
    banners: boolean;
    crm: boolean;
  };
}

export function exportToHtml(
  project: Project,
  translations: Translation[],
  languageCode: string,
  options: ExportOptions
) {
  const currentLanguage = languageCode === 'all' ? 'en' : languageCode;

  // Helper function to get translation value
  const getTranslation = (fieldId: string): string => {
    const translation = translations.find(
      t => t.fieldId === fieldId && t.languageCode === currentLanguage
    );
    return translation?.value || '[Empty]';
  };

  // Escape HTML special characters
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Start building HTML document
  let html = `<!DOCTYPE html>
<html lang="${currentLanguage}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(project.name)}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      font-size: 28px;
      margin-bottom: 20px;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    h2 {
      font-size: 24px;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #444;
    }
    h3 {
      font-size: 20px;
      margin-top: 20px;
      margin-bottom: 10px;
      color: #555;
    }
    .toc {
      background-color: #f5f5f5;
      padding: 20px;
      margin-bottom: 40px;
      border-radius: 5px;
    }
    .toc h2 {
      margin-top: 0;
    }
    .toc ul {
      list-style-type: decimal;
      margin-left: 20px;
    }
    .toc a {
      color: #0066cc;
      text-decoration: none;
    }
    .toc a:hover {
      text-decoration: underline;
    }
    .field {
      margin-bottom: 10px;
      margin-left: 20px;
    }
    .field-name {
      font-weight: bold;
      color: #666;
    }
    .field-value {
      color: #333;
    }
    .module, .asset {
      margin-bottom: 25px;
      padding-left: 20px;
    }
    .page-title {
      text-align: center;
      margin-bottom: 40px;
    }
    .metadata {
      text-align: center;
      color: #666;
      margin-bottom: 20px;
    }
    .section {
      page-break-before: always;
      margin-top: 40px;
    }
    @media print {
      .section {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>`;

  // Title and metadata
  html += `
  <div class="page-title">
    <h1>${escapeHtml(project.name)}</h1>
    <div class="metadata">
      <p>Language: ${currentLanguage.toUpperCase()}</p>
      <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>
  </div>`;

  // Table of Contents
  html += `
  <div class="toc">
    <h2>Table of Contents</h2>
    <ul>`;
  
  if (options.sectionToggles.pdp) {
    html += `<li><a href="#pdp">Product Detail Page (PDP)</a></li>`;
  }
  if (options.sectionToggles.banners) {
    html += `<li><a href="#banners">Banners</a></li>`;
  }
  if (options.sectionToggles.crm) {
    html += `<li><a href="#crm">CRM</a></li>`;
  }
  
  html += `
    </ul>
  </div>`;

  // PDP Section
  const pdp = project.deliverables.find(d => d.type === 'pdp');
  if (pdp && options.sectionToggles.pdp) {
    html += `
    <div class="section" id="pdp">
      <h1>Product Detail Page (PDP)</h1>`;

    // Product Details
    const productDetails = pdp.assets.filter(a => a.type === 'productDetails');
    if (productDetails.length > 0) {
      html += `<h2>Product Information</h2>`;
      productDetails.forEach(asset => {
        asset.fields.forEach(field => {
          html += `
          <div class="field">
            <span class="field-name">${escapeHtml(field.customName || field.name)}:</span>
            <span class="field-value">${escapeHtml(getTranslation(field.id))}</span>
          </div>`;
        });
      });
    }

    // Gallery Images
    const galleryImages = pdp.assets.filter(a => a.type === 'gallery');
    if (galleryImages.length > 0) {
      html += `<h2>Gallery Images</h2>`;
      galleryImages.forEach(asset => {
        html += `
        <div class="asset">
          <h3>${escapeHtml(asset.name)}</h3>`;
        asset.fields.forEach(field => {
          html += `
          <div class="field">
            <span class="field-name">${escapeHtml(field.customName || field.name)}:</span>
            <span class="field-value">${escapeHtml(getTranslation(field.id))}</span>
          </div>`;
        });
        html += `</div>`;
      });
    }

    // Content Modules
    const modules = pdp.assets.filter(a => a.type === 'module');
    if (modules.length > 0) {
      html += `<h2>Content Modules</h2>`;
      modules.forEach(module => {
        html += `
        <div class="module">
          <h3>${escapeHtml(module.name)}</h3>`;
        module.fields.forEach(field => {
          const value = getTranslation(field.id);
          let fieldClass = 'field';
          let style = '';
          
          if (field.type === 'headline') {
            style = 'font-size: 18px; font-weight: bold;';
          } else if (field.type === 'legal') {
            style = 'font-size: 12px; color: #666;';
          }
          
          html += `
          <div class="${fieldClass}" ${style ? `style="${style}"` : ''}>
            <span class="field-name">${escapeHtml(field.customName || field.name)}:</span>
            <span class="field-value">${escapeHtml(value)}</span>
          </div>`;
        });
        html += `</div>`;
      });
    }

    html += `</div>`;
  }

  // Banners Section
  const banners = project.deliverables.find(d => d.type === 'banner');
  if (banners && options.sectionToggles.banners) {
    html += `
    <div class="section" id="banners">
      <h1>Banners</h1>`;
    
    banners.assets.forEach(banner => {
      html += `
      <div class="asset">
        <h2>${escapeHtml(banner.name)}</h2>`;
      banner.fields.forEach(field => {
        html += `
        <div class="field">
          <span class="field-name">${escapeHtml(field.customName || field.name)}:</span>
          <span class="field-value">${escapeHtml(getTranslation(field.id))}</span>
        </div>`;
      });
      html += `</div>`;
    });
    
    html += `</div>`;
  }

  // CRM Section
  const crm = project.deliverables.find(d => d.type === 'crm');
  if (crm && options.sectionToggles.crm) {
    html += `
    <div class="section" id="crm">
      <h1>CRM</h1>`;
    
    crm.assets.forEach(module => {
      html += `
      <div class="module">
        <h2>${escapeHtml(module.name)}</h2>`;
      module.fields.forEach(field => {
        html += `
        <div class="field">
          <span class="field-name">${escapeHtml(field.customName || field.name)}:</span>
          <span class="field-value">${escapeHtml(getTranslation(field.id))}</span>
        </div>`;
      });
      html += `</div>`;
    });
    
    html += `</div>`;
  }

  // Close HTML
  html += `
</body>
</html>`;

  // Create blob and download
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${project.name.replace(/\s+/g, '-')}_${languageCode}_${timestamp}.html`;
  saveAs(blob, filename);
}