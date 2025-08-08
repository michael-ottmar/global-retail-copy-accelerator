import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { FrameSelector } from './FrameSelector';
import { FrameRenderer } from './FrameRenderer';
import { VariableMapper } from './VariableMapper';
import { ImportExport } from './ImportExport';
import type { FigmaNode, ParsedComponent, VariableMapping } from './types';
import { secureFigmaApi } from '../../services/figmaApiSecure';
import { mcpFigmaClient } from '../../services/mcpFigmaClient';
import { KeyIcon, ShieldIcon, AlertTriangleIcon, ServerIcon } from 'lucide-react';

export function DesignView() {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [fileKey, setFileKey] = useState('');
  const [fileName, setFileName] = useState('');
  const [frames, setFrames] = useState<FigmaNode[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<FigmaNode | null>(null);
  const [parsedComponents] = useState<ParsedComponent[]>([]);
  const [variableMappings, setVariableMappings] = useState<Map<string, VariableMapping>>(new Map());
  const [viewMode, setViewMode] = useState<'figma' | 'mapped' | 'split'>('figma');
  const [error, setError] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [allowedFiles, setAllowedFiles] = useState<string>('');
  const [mcpAvailable, setMcpAvailable] = useState<boolean | null>(null);

  const { project } = useStore();

  // Listen for plugin data via postMessage
  useEffect(() => {
    const handlePluginMessage = (event: MessageEvent) => {
      // Security: Only accept from trusted origins
      const trustedOrigins = [
        'https://www.figma.com',
        'https://figma.com',
        'http://localhost:5173',
        window.location.origin
      ];
      
      if (!trustedOrigins.includes(event.origin)) {
        console.warn('Rejected message from untrusted origin:', event.origin);
        return;
      }
      
      // Handle plugin data
      if (event.data?.type === 'figma-plugin-export') {
        console.log('Received data from Figma plugin:', event.data);
        handleImportData(event.data.payload);
      }
    };
    
    window.addEventListener('message', handlePluginMessage);
    return () => window.removeEventListener('message', handlePluginMessage);
  }, []);

  // Check for plugin data from bridge page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('import') === 'plugin') {
      const pluginData = sessionStorage.getItem('figmaPluginData');
      if (pluginData) {
        try {
          const data = JSON.parse(pluginData);
          handleImportData(data);
          sessionStorage.removeItem('figmaPluginData');
          // Remove import param from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          console.error('Failed to parse plugin data:', e);
        }
      }
    }
  }, []);

  // Check for MCP server on component mount
  useEffect(() => {
    const checkMCP = async () => {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const available = await mcpFigmaClient.checkAvailability();
        setMcpAvailable(available);
        if (available) {
          console.log('✅ MCP Figma server detected at http://127.0.0.1:3845/mcp');
        }
      } else {
        setMcpAvailable(false);
      }
    };
    checkMCP();
  }, []);

  const connectToFigma = async () => {
    setConnectionStatus('connecting');
    setError(null);
    
    try {
      let fileData = null;
      
      // Check for test data options
      if (fileKey.toLowerCase().startsWith('test')) {
        // Import test data generator
        const { generateTestFile } = await import('../../services/testDataGenerator');
        
        // Generate specific test type based on key
        if (fileKey === 'test-pdp') {
          fileData = generateTestFile('pdp');
        } else if (fileKey === 'test-banner') {
          fileData = generateTestFile('banner');
        } else if (fileKey === 'test-email') {
          fileData = generateTestFile('email');
        } else {
          fileData = generateTestFile('all');
        }
      } else {
        // Check if we have an access token for real files
        if (!secureFigmaApi.hasToken()) {
          setError('Please add your Figma access token (click key icon) or use "test" for mock data');
          setConnectionStatus('disconnected');
          return;
        }
        
        // Use real API with token
        fileData = await secureFigmaApi.getFile(fileKey);
      }
      
      setFileName(fileData.name || 'Figma File');
      setConnectionStatus('connected');
      
      // Extract frames from the file
      if (fileData?.document) {
        const topFrames = extractFrames(fileData.document);
        setFrames(topFrames);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Figma');
      setConnectionStatus('disconnected');
    }
  };

  const handleImportData = (data: any) => {
    if (data.document) {
      setFileName(data.name || 'Imported File');
      setConnectionStatus('connected');
      const topFrames = extractFrames(data.document);
      setFrames(topFrames);
    }
  };

  const extractFrames = (node: FigmaNode, frames: FigmaNode[] = []): FigmaNode[] => {
    // Look for frames with our naming convention (e.g., "pdp", "banner", etc.)
    if (node.type === 'FRAME' && (
      node.name.toLowerCase().includes('pdp') ||
      node.name.toLowerCase().includes('banner') ||
      node.name.toLowerCase().includes('gallery') ||
      node.name.toLowerCase().includes('module') ||
      node.name.toLowerCase().includes('crm')
    )) {
      frames.push(node);
    }
    
    if (node.children) {
      node.children.forEach(child => extractFrames(child, frames));
    }
    
    return frames;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Design Sandbox</h2>
            <p className="text-sm text-gray-500">
              Figma MCP Integration - Parse and map design assets
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Import/Export */}
            <ImportExport 
              onImport={handleImportData}
              currentData={frames.length > 0 ? { document: { children: frames }, name: fileName } : null}
            />
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('figma')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'figma' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Figma
              </button>
              <button
                onClick={() => setViewMode('mapped')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'mapped' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mapped
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'split' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Split View
              </button>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-4">
              {/* MCP Status (local only) */}
              {mcpAvailable !== null && (
                <div className="flex items-center gap-2">
                  <ServerIcon className={`w-4 h-4 ${mcpAvailable ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-xs text-gray-600">
                    {mcpAvailable ? 'MCP Ready' : 'MCP Offline'}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                  'bg-gray-400'
                }`} />
                <span className="text-sm text-gray-600">
                  {connectionStatus === 'connected' ? fileName : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 
                   'Not connected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Panel */}
      {connectionStatus === 'disconnected' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Connect to Figma</h3>
              <button
                onClick={() => setShowTokenInput(!showTokenInput)}
                className={`p-2 rounded-lg transition-colors ${
                  secureFigmaApi.hasToken() ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                } hover:bg-gray-200`}
                title={secureFigmaApi.hasToken() ? 'Token configured (session only)' : 'Add Figma access token'}
              >
                {secureFigmaApi.hasToken() ? <ShieldIcon className="w-4 h-4" /> : <KeyIcon className="w-4 h-4" />}
              </button>
            </div>
            
            {showTokenInput && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2 mb-3">
                  <ShieldIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Secure Token Setup</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Token stored in memory only • Auto-clears after 30 min • Never saved to disk
                    </p>
                  </div>
                </div>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Figma Access Token
                </label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="figd_..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                />
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restrict to Specific Files (Optional)
                </label>
                <input
                  type="text"
                  value={allowedFiles}
                  onChange={(e) => setAllowedFiles(e.target.value)}
                  placeholder="FILE_KEY1, FILE_KEY2 (comma separated)"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                />
                
                <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangleIcon className="w-4 h-4 text-orange-600 mt-0.5" />
                    <p className="text-xs text-orange-800">
                      <strong>Security Note:</strong> Figma tokens have account-wide access. 
                      Consider creating a separate Figma account with only test files for development.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const fileList = allowedFiles ? 
                        allowedFiles.split(',').map(f => f.trim()).filter(Boolean) : 
                        undefined;
                      secureFigmaApi.setSecureToken(accessToken, fileList);
                      setShowTokenInput(false);
                      setAccessToken(''); // Clear from state immediately
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Use Token (Session Only)
                  </button>
                  <button
                    onClick={() => {
                      setShowTokenInput(false);
                      setAccessToken('');
                      setAllowedFiles('');
                    }}
                    className="px-3 py-1 text-gray-600 text-sm hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <a
                    href="https://www.figma.com/developers/api#access-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-blue-600 text-sm hover:underline ml-auto"
                  >
                    Get Token →
                  </a>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {secureFigmaApi.hasToken() ? 
                  'Token active for this session. Enter a Figma file key.' :
                  'Use test data or add a token for real files.'}
              </p>
              
              {/* Test data options */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-900 mb-2">Test Data Available:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setFileKey('test')}
                    className="text-left px-2 py-1 bg-white rounded border border-blue-200 hover:bg-blue-100"
                  >
                    <strong>test</strong> - All frames
                  </button>
                  <button
                    onClick={() => setFileKey('test-pdp')}
                    className="text-left px-2 py-1 bg-white rounded border border-blue-200 hover:bg-blue-100"
                  >
                    <strong>test-pdp</strong> - PDP frames
                  </button>
                  <button
                    onClick={() => setFileKey('test-banner')}
                    className="text-left px-2 py-1 bg-white rounded border border-blue-200 hover:bg-blue-100"
                  >
                    <strong>test-banner</strong> - Banners
                  </button>
                  <button
                    onClick={() => setFileKey('test-email')}
                    className="text-left px-2 py-1 bg-white rounded border border-blue-200 hover:bg-blue-100"
                  >
                    <strong>test-email</strong> - CRM
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Figma File Key or URL
                </label>
                <input
                  type="text"
                  value={fileKey}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Extract file key from URL if provided
                    const match = value.match(/file\/([a-zA-Z0-9]+)/);
                    setFileKey(match ? match[1] : value);
                  }}
                  placeholder={accessToken ? "e.g., ABC123XYZ" : 'Enter "test" for mock data'}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <button
                onClick={connectToFigma}
                disabled={!fileKey || connectionStatus !== 'disconnected'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {connectionStatus !== 'disconnected' ? 'Connecting...' : 
                 fileKey.toLowerCase() === 'test' ? 'Load Mock Data' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {connectionStatus === 'connected' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Frame Selector */}
          <div className="w-64 bg-white border-r overflow-y-auto">
            <FrameSelector
              frames={frames}
              selectedFrame={selectedFrame}
              onSelectFrame={setSelectedFrame}
            />
          </div>

          {/* Center - Frame Preview */}
          <div className="flex-1 overflow-auto p-6">
            {selectedFrame ? (
              <div className={`h-full ${viewMode === 'split' ? 'grid grid-cols-2 gap-6' : ''}`}>
                {(viewMode === 'figma' || viewMode === 'split') && (
                  <div className={viewMode === 'split' ? 'bg-white rounded-lg shadow-sm border p-4' : ''}>
                    {viewMode === 'split' && (
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Original Figma</h3>
                    )}
                    <FrameRenderer
                      frame={selectedFrame}
                      parsedComponents={parsedComponents}
                      mode="figma"
                    />
                  </div>
                )}
                
                {(viewMode === 'mapped' || viewMode === 'split') && (
                  <div className={viewMode === 'split' ? 'bg-white rounded-lg shadow-sm border p-4' : ''}>
                    {viewMode === 'split' && (
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Mapped Content</h3>
                    )}
                    <FrameRenderer
                      frame={selectedFrame}
                      parsedComponents={parsedComponents}
                      mode="mapped"
                      variableMappings={variableMappings}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Select a frame to begin</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Variable Mapper */}
          {selectedFrame && (
            <div className="w-80 bg-white border-l overflow-y-auto">
              <VariableMapper
                frame={selectedFrame}
                parsedComponents={parsedComponents}
                variableMappings={variableMappings}
                onUpdateMapping={setVariableMappings}
                projectVariables={project?.deliverables || []}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}