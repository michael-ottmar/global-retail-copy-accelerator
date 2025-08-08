/**
 * MCP Figma Client
 * Connects to local MCP server at http://127.0.0.1:3845/mcp
 * Only works when running locally with MCP server active
 */

// MCP Figma Client - connects to local MCP server

const MCP_SERVER_URL = 'http://127.0.0.1:3845/mcp';

interface MCPRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id: number;
}

interface MCPResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: number;
}

class MCPFigmaClient {
  private requestId = 1;
  private isAvailable: boolean | null = null;

  /**
   * Check if MCP server is running locally
   */
  async checkAvailability(): Promise<boolean> {
    if (this.isAvailable !== null) return this.isAvailable;

    try {
      // Try to ping the MCP server
      const response = await fetch(MCP_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'ping',
          id: this.requestId++,
        }),
      });

      this.isAvailable = response.ok;
      return this.isAvailable;
    } catch (error) {
      console.log('MCP server not available at', MCP_SERVER_URL);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Call MCP method
   */
  private async callMCP(method: string, params?: any): Promise<any> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: this.requestId++,
    };

    try {
      const response = await fetch(MCP_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`MCP server error: ${response.statusText}`);
      }

      const data: MCPResponse = await response.json();

      if (data.error) {
        throw new Error(`MCP error: ${data.error.message}`);
      }

      return data.result;
    } catch (error) {
      console.error('MCP call failed:', error);
      throw error;
    }
  }

  /**
   * Get Figma file via MCP
   */
  async getFile(fileKey: string): Promise<any> {
    const available = await this.checkAvailability();
    if (!available) {
      throw new Error('MCP server not available. Make sure it\'s running at ' + MCP_SERVER_URL);
    }

    // Try different method names based on common MCP implementations
    const methodsToTry = [
      'figma.getFile',
      'getFile',
      'figma/getFile',
      'tools/figma.getFile'
    ];

    for (const method of methodsToTry) {
      try {
        console.log(`Trying MCP method: ${method}`);
        const result = await this.callMCP(method, { fileKey });
        console.log('MCP call successful with method:', method);
        return result;
      } catch (error) {
        console.log(`Method ${method} failed, trying next...`);
      }
    }

    throw new Error('Could not find correct MCP method. Check MCP server documentation.');
  }

  /**
   * Get file nodes via MCP
   */
  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<any> {
    const available = await this.checkAvailability();
    if (!available) {
      throw new Error('MCP server not available');
    }

    const methodsToTry = [
      'figma.getFileNodes',
      'getFileNodes',
      'figma/getFileNodes',
      'tools/figma.getFileNodes'
    ];

    for (const method of methodsToTry) {
      try {
        const result = await this.callMCP(method, { fileKey, nodeIds });
        return result;
      } catch (error) {
        // Try next method
      }
    }

    throw new Error('Could not find correct MCP method for getFileNodes');
  }

  /**
   * List available MCP tools (for debugging)
   */
  async listTools(): Promise<any> {
    const available = await this.checkAvailability();
    if (!available) {
      throw new Error('MCP server not available');
    }

    try {
      // Common MCP method to list available tools
      return await this.callMCP('tools/list', {});
    } catch (error) {
      console.error('Could not list MCP tools:', error);
      return null;
    }
  }
}

export const mcpFigmaClient = new MCPFigmaClient();