import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, Table, TableRow, TableCell, WidthType, Packer } from 'docx';
import type { Project, Translation } from '../types';
import { saveAs } from 'file-saver';

interface ExportOptions {
  sectionToggles: {
    pdp: boolean;
    banners: boolean;
    crm: boolean;
  };
}

export async function exportToWord(
  project: Project,
  translations: Translation[],
  languageCode: string,
  options: ExportOptions
) {
  const sections = [];

  // Title page
  sections.push({
    properties: {},
    children: [
      new Paragraph({
        text: project.name,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: `Language: ${languageCode === 'all' ? 'English' : languageCode.toUpperCase()}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),
      new Paragraph({
        text: `Generated: ${new Date().toLocaleDateString()}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 1200 },
      }),
    ],
  });

  // Table of Contents
  const tocChildren = [
    new Paragraph({
      text: "Table of Contents",
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
    }),
  ];

  if (options.sectionToggles.pdp) {
    tocChildren.push(
      new Paragraph({
        text: "1. Product Detail Page (PDP)",
        spacing: { before: 200, after: 200 },
        indent: { left: 720 }, // 0.5 inch indent
      })
    );
  }
  
  if (options.sectionToggles.banners) {
    tocChildren.push(
      new Paragraph({
        text: "2. Banners",
        spacing: { before: 200, after: 200 },
        indent: { left: 720 },
      })
    );
  }
  
  if (options.sectionToggles.crm) {
    tocChildren.push(
      new Paragraph({
        text: "3. CRM",
        spacing: { before: 200, after: 200 },
        indent: { left: 720 },
      })
    );
  }

  sections[0].children.push(...tocChildren);
  sections[0].children.push(new PageBreak());

  const currentLanguage = languageCode === 'all' ? 'en' : languageCode;

  // Helper function to get translation value
  const getTranslation = (fieldId: string): string => {
    const translation = translations.find(
      t => t.fieldId === fieldId && t.languageCode === currentLanguage
    );
    return translation?.value || '[Empty]';
  };

  // PDP Section
  const pdp = project.deliverables.find(d => d.type === 'pdp');
  if (pdp && options.sectionToggles.pdp) {
    const pdpChildren = [
      new Paragraph({
        text: "Product Detail Page (PDP)",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 400 },
      }),
    ];

    // Product Details
    const productDetails = pdp.assets.filter(a => a.type === 'productDetails');
    if (productDetails.length > 0) {
      pdpChildren.push(
        new Paragraph({
          text: "Product Information",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        })
      );

      productDetails.forEach(asset => {
        asset.fields.forEach(field => {
          pdpChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${field.customName || field.name}: `,
                  bold: true,
                }),
                new TextRun({
                  text: getTranslation(field.id),
                }),
              ],
              spacing: { before: 120, after: 120 },
            })
          );
        });
      });
    }

    // Gallery Images
    const galleryImages = pdp.assets.filter(a => a.type === 'gallery');
    if (galleryImages.length > 0) {
      pdpChildren.push(
        new Paragraph({
          text: "Gallery Images",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        })
      );

      galleryImages.forEach((asset, index) => {
        pdpChildren.push(
          new Paragraph({
            text: asset.name,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 120 },
          })
        );

        asset.fields.forEach(field => {
          pdpChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${field.customName || field.name}: `,
                  size: 20,
                }),
                new TextRun({
                  text: getTranslation(field.id),
                  size: 20,
                }),
              ],
              indent: { left: 720 },
              spacing: { before: 60, after: 60 },
            })
          );
        });
      });
    }

    // Content Modules
    const modules = pdp.assets.filter(a => a.type === 'module');
    if (modules.length > 0) {
      pdpChildren.push(
        new Paragraph({
          text: "Content Modules",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        })
      );

      modules.forEach(module => {
        pdpChildren.push(
          new Paragraph({
            text: module.name,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 120 },
          })
        );

        module.fields.forEach(field => {
          // Apply different formatting based on field type
          let fontSize = 24; // 12pt default
          let bold = false;
          let spacing = { before: 60, after: 60 };

          if (field.type === 'headline') {
            fontSize = 28; // 14pt
            bold = true;
            spacing = { before: 120, after: 120 };
          } else if (field.type === 'legal') {
            fontSize = 20; // 10pt
            spacing = { before: 40, after: 40 };
          }

          pdpChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${field.customName || field.name}: `,
                  size: fontSize,
                  bold: true,
                }),
                new TextRun({
                  text: getTranslation(field.id),
                  size: fontSize,
                  bold: bold,
                }),
              ],
              indent: { left: 720 },
              spacing,
            })
          );
        });
      });
    }

    sections.push({
      properties: {},
      children: pdpChildren,
    });
  }

  // Banners Section
  const banners = project.deliverables.find(d => d.type === 'banner');
  if (banners && options.sectionToggles.banners) {
    const bannerChildren = [
      new Paragraph({
        text: "Banners",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 400 },
        pageBreakBefore: true,
      }),
    ];

    banners.assets.forEach(banner => {
      bannerChildren.push(
        new Paragraph({
          text: banner.name,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        })
      );

      banner.fields.forEach(field => {
        bannerChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${field.customName || field.name}: `,
                bold: true,
              }),
              new TextRun({
                text: getTranslation(field.id),
              }),
            ],
            indent: { left: 720 },
            spacing: { before: 60, after: 60 },
          })
        );
      });
    });

    sections.push({
      properties: {},
      children: bannerChildren,
    });
  }

  // CRM Section
  const crm = project.deliverables.find(d => d.type === 'crm');
  if (crm && options.sectionToggles.crm) {
    const crmChildren = [
      new Paragraph({
        text: "CRM",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 400 },
        pageBreakBefore: true,
      }),
    ];

    crm.assets.forEach(module => {
      crmChildren.push(
        new Paragraph({
          text: module.name,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        })
      );

      module.fields.forEach(field => {
        crmChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${field.customName || field.name}: `,
                bold: true,
              }),
              new TextRun({
                text: getTranslation(field.id),
              }),
            ],
            indent: { left: 720 },
            spacing: { before: 60, after: 60 },
          })
        );
      });
    });

    sections.push({
      properties: {},
      children: crmChildren,
    });
  }

  // Create document
  const doc = new Document({
    sections,
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 24, // 12pt
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
            },
          },
        },
      },
    },
  });

  // Generate and save the document
  const blob = await Packer.toBlob(doc);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${project.name.replace(/\s+/g, '-')}_${languageCode}_${timestamp}.docx`;
  saveAs(blob, filename);
}