import type { FigmaNode } from '../components/DesignView/types';
import { tokenManager } from './secureTokenManager';

interface FigmaFile {
  document: FigmaNode;
  components: Record<string, any>;
  name: string;
  lastModified: string;
  version: string;
}

class SecureFigmaApiService {
  async getFile(fileKey: string): Promise<FigmaFile> {
    // Check for test mode first
    if (fileKey.toLowerCase() === 'test') {
      return getMockFigmaFile();
    }
    
    if (!tokenManager.hasToken()) {
      throw new Error('No Figma access token. Please add your token in settings.');
    }
    
    const headers = tokenManager.createSecureHeaders(fileKey);
    if (!headers) {
      throw new Error('File not in allowed list or invalid session');
    }

    try {
      // Use POST to avoid token in URL
      const response = await fetch('/api/figma-proxy-secure', {
        method: 'POST',
        headers,
        body: JSON.stringify({ fileKey })
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Invalid token or no access to file');
        }
        throw new Error(`Figma API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Figma API error:', error);
      
      // Don't fallback to mock data for security errors
      if (error instanceof Error && error.message.includes('token')) {
        throw error;
      }
      
      // Network errors can fall back to mock
      return getMockFigmaFile();
    }
  }
  
  // Secure token setting with optional file restrictions
  setSecureToken(token: string, allowedFiles?: string[]) {
    tokenManager.setToken(token, allowedFiles);
  }
  
  clearToken() {
    tokenManager.clearToken();
  }
  
  hasToken(): boolean {
    return tokenManager.hasToken();
  }
}

// Mock data for testing (same as before)
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
            }
          ]
        }
      ]
    }
  };
}

export const secureFigmaApi = new SecureFigmaApiService();