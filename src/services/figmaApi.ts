import { FigmaNode } from '../components/DesignView/types';

// For development, we'll use a proxy or CORS-enabled endpoint
// In production, this should go through your backend
const FIGMA_API_BASE = 'https://api.figma.com/v1';

interface FigmaFile {
  document: FigmaNode;
  components: Record<string, any>;
  name: string;
  lastModified: string;
  version: string;
}

class FigmaApiService {
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
    // Store in localStorage for persistence
    localStorage.setItem('figma_access_token', token);
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('figma_access_token');
    }
    return this.accessToken;
  }

  async getFile(fileKey: string): Promise<FigmaFile> {
    const token = this.getAccessToken();
    
    if (!token) {
      throw new Error('No Figma access token. Please add your token in settings.');
    }

    try {
      const response = await fetch(`${FIGMA_API_BASE}/files/${fileKey}`, {
        headers: {
          'X-Figma-Token': token,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Invalid Figma access token or no access to file');
        }
        throw new Error(`Figma API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // CORS issue - need to use proxy in production
      console.error('Figma API error:', error);
      
      // For now, return mock data for testing
      return getMockFigmaFile();
    }
  }

  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<any> {
    const token = this.getAccessToken();
    
    if (!token) {
      throw new Error('No Figma access token');
    }

    try {
      const ids = nodeIds.join(',');
      const response = await fetch(
        `${FIGMA_API_BASE}/files/${fileKey}/nodes?ids=${ids}`,
        {
          headers: {
            'X-Figma-Token': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Figma API error:', error);
      throw error;
    }
  }
}

// Mock data for testing without API
function getMockFigmaFile(): FigmaFile {
  return {
    name: "Test Figma File",
    lastModified: new Date().toISOString(),
    version: "1.0.0",
    components: {},
    document: {
      id: "0:0",
      name: "Document",
      type: "FRAME",
      absoluteBoundingBox: { x: 0, y: 0, width: 1920, height: 1080 },
      constraints: { horizontal: "LEFT", vertical: "TOP" },
      children: [
        {
          id: "1:1",
          name: "PDP_Gallery_Image_1",
          type: "FRAME",
          absoluteBoundingBox: { x: 100, y: 100, width: 600, height: 400 },
          constraints: { horizontal: "LEFT", vertical: "TOP" },
          layoutMode: "VERTICAL",
          itemSpacing: 16,
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 24,
          paddingBottom: 24,
          primaryAxisAlignItems: "MIN",
          counterAxisAlignItems: "CENTER",
          fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 1 } }],
          children: [
            {
              id: "1:2",
              name: "headline",
              type: "TEXT",
              absoluteBoundingBox: { x: 124, y: 124, width: 552, height: 32 },
              constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP" },
              characters: "Premium Wireless Headphones",
              style: {
                fontFamily: "Inter",
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: 0,
                lineHeight: { unit: "PIXELS", value: 32 },
                textAlignHorizontal: "LEFT",
                textAlignVertical: "TOP"
              },
              fills: [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1, a: 1 } }]
            },
            {
              id: "1:3",
              name: "body",
              type: "TEXT",
              absoluteBoundingBox: { x: 124, y: 172, width: 552, height: 60 },
              constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP" },
              characters: "Experience crystal-clear audio with our latest noise-canceling technology. Designed for comfort during extended listening sessions.",
              style: {
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: 16,
                letterSpacing: 0,
                lineHeight: { unit: "PIXELS", value: 20 },
                textAlignHorizontal: "LEFT",
                textAlignVertical: "TOP"
              },
              fills: [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3, a: 1 } }]
            },
            {
              id: "1:4",
              name: "feature",
              type: "TEXT",
              absoluteBoundingBox: { x: 124, y: 248, width: 552, height: 20 },
              constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP" },
              characters: "• 40-hour battery life • Active noise cancellation",
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
              id: "1:5",
              name: "legal",
              type: "TEXT",
              absoluteBoundingBox: { x: 124, y: 284, width: 552, height: 16 },
              constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP" },
              characters: "*Battery life varies by use and settings",
              style: {
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: 12,
                letterSpacing: 0,
                lineHeight: { unit: "PIXELS", value: 16 },
                textAlignHorizontal: "LEFT",
                textAlignVertical: "TOP"
              },
              fills: [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5, a: 1 } }]
            }
          ]
        },
        {
          id: "2:1",
          name: "Banner_Hero_1",
          type: "FRAME",
          absoluteBoundingBox: { x: 750, y: 100, width: 800, height: 200 },
          constraints: { horizontal: "LEFT", vertical: "TOP" },
          layoutMode: "HORIZONTAL",
          itemSpacing: 24,
          paddingLeft: 32,
          paddingRight: 32,
          paddingTop: 32,
          paddingBottom: 32,
          primaryAxisAlignItems: "CENTER",
          counterAxisAlignItems: "CENTER",
          fills: [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 1, a: 1 } }],
          children: [
            {
              id: "2:2",
              name: "headline",
              type: "TEXT",
              absoluteBoundingBox: { x: 782, y: 150, width: 300, height: 40 },
              constraints: { horizontal: "LEFT", vertical: "CENTER" },
              characters: "Summer Sale",
              style: {
                fontFamily: "Inter",
                fontWeight: 800,
                fontSize: 32,
                letterSpacing: -0.5,
                lineHeight: { unit: "PIXELS", value: 40 },
                textAlignHorizontal: "LEFT",
                textAlignVertical: "CENTER"
              },
              fills: [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.8, a: 1 } }]
            },
            {
              id: "2:3",
              name: "cta",
              type: "TEXT",
              absoluteBoundingBox: { x: 1106, y: 160, width: 120, height: 20 },
              constraints: { horizontal: "LEFT", vertical: "CENTER" },
              characters: "Shop Now →",
              style: {
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: 0,
                lineHeight: { unit: "PIXELS", value: 20 },
                textAlignHorizontal: "CENTER",
                textAlignVertical: "CENTER"
              },
              fills: [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.8, a: 1 } }]
            }
          ]
        }
      ]
    }
  };
}

export const figmaApi = new FigmaApiService();