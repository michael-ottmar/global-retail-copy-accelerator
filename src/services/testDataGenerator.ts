/**
 * Test Data Generator
 * Creates realistic Figma-like data for testing without any API access
 */

import type { FigmaNode } from '../components/DesignView/types';

export function generateTestFile(type: 'pdp' | 'banner' | 'email' | 'all' = 'all') {
  const frames: FigmaNode[] = [];
  
  if (type === 'pdp' || type === 'all') {
    frames.push(
      createPDPGalleryFrame('PDP_Gallery_Image_1', 0, 0),
      createPDPGalleryFrame('PDP_Gallery_Image_2', 650, 0),
      createPDPDetailsFrame('PDP_Product_Details', 0, 450)
    );
  }
  
  if (type === 'banner' || type === 'all') {
    frames.push(
      createBannerFrame('Banner_Hero_Desktop', 0, 900, 1440, 400),
      createBannerFrame('Banner_Hero_Mobile', 1500, 900, 375, 600),
      createBannerFrame('Banner_Promo_Square', 0, 1350, 600, 600)
    );
  }
  
  if (type === 'email' || type === 'all') {
    frames.push(
      createEmailFrame('CRM_Email_Header', 0, 2000),
      createEmailFrame('CRM_Email_Body', 0, 2300)
    );
  }
  
  return {
    name: `Test File - ${new Date().toLocaleDateString()}`,
    lastModified: new Date().toISOString(),
    version: "1.0.0",
    document: {
      id: "0:0",
      name: "Document",
      type: "FRAME" as const,
      absoluteBoundingBox: { x: 0, y: 0, width: 1920, height: 3000 },
      constraints: { horizontal: "LEFT" as const, vertical: "TOP" as const },
      children: frames
    }
  };
}

function createPDPGalleryFrame(name: string, x: number, y: number): FigmaNode {
  return {
    id: `frame-${name}`,
    name,
    type: "FRAME",
    absoluteBoundingBox: { x, y, width: 600, height: 400 },
    constraints: { horizontal: "LEFT", vertical: "TOP" },
    layoutMode: "VERTICAL",
    primaryAxisAlignItems: "MIN",
    counterAxisAlignItems: "MIN",
    paddingLeft: 32,
    paddingRight: 32,
    paddingTop: 32,
    paddingBottom: 32,
    itemSpacing: 16,
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 1 } }],
    effects: [
      {
        type: "DROP_SHADOW",
        color: { r: 0, g: 0, b: 0, a: 0.1 },
        offset: { x: 0, y: 2 },
        radius: 8
      }
    ],
    cornerRadius: 8,
    children: [
      {
        id: `${name}-headline`,
        name: "headline",
        type: "TEXT",
        absoluteBoundingBox: { x: x + 32, y: y + 32, width: 536, height: 40 },
        constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP" },
        characters: "Premium Product Title Goes Here",
        style: {
          fontFamily: "Inter",
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: -0.5,
          lineHeight: { unit: "PIXELS", value: 40 },
          textAlignHorizontal: "LEFT",
          textAlignVertical: "TOP"
        },
        fills: [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1, a: 1 } }]
      },
      {
        id: `${name}-body`,
        name: "body",
        type: "TEXT",
        absoluteBoundingBox: { x: x + 32, y: y + 88, width: 536, height: 80 },
        constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP" },
        characters: "Experience the perfect blend of innovation and elegance. This product description showcases key benefits and features that matter most to customers.",
        style: {
          fontFamily: "Inter",
          fontWeight: 400,
          fontSize: 16,
          letterSpacing: 0,
          lineHeight: { unit: "PIXELS", value: 26 },
          textAlignHorizontal: "LEFT",
          textAlignVertical: "TOP"
        },
        fills: [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3, a: 1 } }]
      },
      {
        id: `${name}-feature`,
        name: "feature",
        type: "TEXT",
        absoluteBoundingBox: { x: x + 32, y: y + 184, width: 536, height: 60 },
        constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP" },
        characters: "• Advanced technology\n• Premium materials\n• 2-year warranty",
        style: {
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 14,
          letterSpacing: 0,
          lineHeight: { unit: "PIXELS", value: 20 },
          textAlignHorizontal: "LEFT",
          textAlignVertical: "TOP"
        },
        fills: [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2, a: 1 } }]
      },
      {
        id: `${name}-legal`,
        name: "legal",
        type: "TEXT",
        absoluteBoundingBox: { x: x + 32, y: y + 260, width: 536, height: 30 },
        constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP" },
        characters: "*Terms and conditions apply. See website for details.",
        style: {
          fontFamily: "Inter",
          fontWeight: 400,
          fontSize: 11,
          letterSpacing: 0,
          lineHeight: { unit: "PIXELS", value: 15 },
          textAlignHorizontal: "LEFT",
          textAlignVertical: "TOP"
        },
        fills: [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5, a: 1 } }]
      }
    ]
  };
}

function createPDPDetailsFrame(name: string, x: number, y: number): FigmaNode {
  return {
    id: `frame-${name}`,
    name,
    type: "FRAME",
    absoluteBoundingBox: { x, y, width: 600, height: 400 },
    constraints: { horizontal: "LEFT", vertical: "TOP" },
    layoutMode: "VERTICAL",
    primaryAxisAlignItems: "MIN",
    counterAxisAlignItems: "MIN",
    paddingLeft: 32,
    paddingRight: 32,
    paddingTop: 32,
    paddingBottom: 32,
    itemSpacing: 24,
    fills: [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.99, a: 1 } }],
    children: [
      {
        id: `${name}-productName`,
        name: "productName",
        type: "TEXT",
        absoluteBoundingBox: { x: x + 32, y: y + 32, width: 536, height: 32 },
        constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP" },
        characters: "Model XR-2000 Professional Series",
        style: {
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 24,
          letterSpacing: -0.3,
          lineHeight: { unit: "PIXELS", value: 32 },
          textAlignHorizontal: "LEFT",
          textAlignVertical: "TOP"
        },
        fills: [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1, a: 1 } }]
      },
      {
        id: `${name}-productDetails`,
        name: "productDetails",
        type: "TEXT",
        absoluteBoundingBox: { x: x + 32, y: y + 88, width: 536, height: 120 },
        constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP" },
        characters: "Technical Specifications:\n• Dimensions: 12\" x 8\" x 4\"\n• Weight: 2.5 lbs\n• Material: Aircraft-grade aluminum\n• Power: 100W continuous",
        style: {
          fontFamily: "Inter",
          fontWeight: 400,
          fontSize: 14,
          letterSpacing: 0,
          lineHeight: { unit: "PIXELS", value: 24 },
          textAlignHorizontal: "LEFT",
          textAlignVertical: "TOP"
        },
        fills: [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3, a: 1 } }]
      }
    ]
  };
}

function createBannerFrame(name: string, x: number, y: number, width: number, height: number): FigmaNode {
  return {
    id: `frame-${name}`,
    name,
    type: "FRAME",
    absoluteBoundingBox: { x, y, width, height },
    constraints: { horizontal: "LEFT", vertical: "TOP" },
    layoutMode: "HORIZONTAL",
    primaryAxisAlignItems: "CENTER",
    counterAxisAlignItems: "CENTER",
    paddingLeft: 60,
    paddingRight: 60,
    paddingTop: 40,
    paddingBottom: 40,
    itemSpacing: 48,
    fills: [
      { 
        type: "SOLID", 
        color: { 
          r: 0.95, 
          g: 0.97, 
          b: 1, 
          a: 1 
        } 
      }
    ],
    children: [
      {
        id: `${name}-headline`,
        name: "headline",
        type: "TEXT",
        absoluteBoundingBox: { x: x + 60, y: y + height/2 - 30, width: width - 300, height: 60 },
        constraints: { horizontal: "SCALE", vertical: "CENTER" },
        characters: "Summer Sale Event",
        style: {
          fontFamily: "Inter",
          fontWeight: 800,
          fontSize: width > 400 ? 48 : 32,
          letterSpacing: -1,
          lineHeight: { unit: "PIXELS", value: 60 },
          textAlignHorizontal: "LEFT",
          textAlignVertical: "CENTER"
        },
        fills: [{ type: "SOLID", color: { r: 0.2, g: 0.3, b: 0.9, a: 1 } }]
      },
      {
        id: `${name}-cta`,
        name: "cta",
        type: "TEXT",
        absoluteBoundingBox: { x: x + width - 180, y: y + height/2 - 20, width: 120, height: 40 },
        constraints: { horizontal: "RIGHT", vertical: "CENTER" },
        characters: "Shop Now →",
        style: {
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: 0,
          lineHeight: { unit: "PIXELS", value: 40 },
          textAlignHorizontal: "CENTER",
          textAlignVertical: "CENTER"
        },
        fills: [{ type: "SOLID", color: { r: 0.2, g: 0.3, b: 0.9, a: 1 } }]
      }
    ]
  };
}

function createEmailFrame(name: string, x: number, y: number): FigmaNode {
  return {
    id: `frame-${name}`,
    name,
    type: "FRAME",
    absoluteBoundingBox: { x, y, width: 600, height: 250 },
    constraints: { horizontal: "LEFT", vertical: "TOP" },
    layoutMode: "VERTICAL",
    primaryAxisAlignItems: "MIN",
    counterAxisAlignItems: "MIN",
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 40,
    paddingBottom: 40,
    itemSpacing: 20,
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 1 } }],
    children: [
      {
        id: `${name}-subject`,
        name: "subject",
        type: "TEXT",
        absoluteBoundingBox: { x: x + 40, y: y + 40, width: 520, height: 30 },
        constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP" },
        characters: "Your Exclusive Offer Inside",
        style: {
          fontFamily: "Inter",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: -0.3,
          lineHeight: { unit: "PIXELS", value: 30 },
          textAlignHorizontal: "LEFT",
          textAlignVertical: "TOP"
        },
        fills: [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1, a: 1 } }]
      },
      {
        id: `${name}-greeting`,
        name: "greeting",
        type: "TEXT",
        absoluteBoundingBox: { x: x + 40, y: y + 90, width: 520, height: 100 },
        constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP" },
        characters: "Hello Valued Customer,\n\nWe're excited to share this special promotion exclusively for our loyal customers.",
        style: {
          fontFamily: "Inter",
          fontWeight: 400,
          fontSize: 16,
          letterSpacing: 0,
          lineHeight: { unit: "PIXELS", value: 25 },
          textAlignHorizontal: "LEFT",
          textAlignVertical: "TOP"
        },
        fills: [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3, a: 1 } }]
      }
    ]
  };
}