import { useState } from 'react';
import { useStore } from '../../store';
import { FrameSelector } from './FrameSelector';
import { FrameRenderer } from './FrameRenderer';
import { VariableMapper } from './VariableMapper';
import { ImportExport } from './ImportExport';
import type { FigmaNode, ParsedComponent, VariableMapping } from './types';
import { figmaApi } from '../../services/figmaApi';
import { KeyIcon } from 'lucide-react';

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
  const [accessToken, setAccessToken] = useState(figmaApi.getAccessToken() || '');

  const { project } = useStore();

  const connectToFigma = async () => {
    setConnectionStatus('connecting');
    setError(null);
    
    try {
      // Check if we have an access token
      if (!figmaApi.getAccessToken() && !fileKey.toLowerCase().includes('test')) {
        setError('Please add your Figma access token first (click the key icon)');
        setConnectionStatus('disconnected');
        return;
      }
      
      // Use mock data for testing or real API
      const fileData = await figmaApi.getFile(fileKey);
      
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

      {/* Connection Panel */}
      {connectionStatus === 'disconnected' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Connect to Figma</h3>
              <button
                onClick={() => setShowTokenInput(!showTokenInput)}
                className={`p-2 rounded-lg transition-colors ${
                  accessToken ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                } hover:bg-gray-200`}
                title={accessToken ? 'Token configured' : 'Add Figma access token'}
              >
                <KeyIcon className="w-4 h-4" />
              </button>
            </div>
            
            {showTokenInput && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
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
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      figmaApi.setAccessToken(accessToken);
                      setShowTokenInput(false);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Save Token
                  </button>
                  <a
                    href="https://www.figma.com/developers/api#access-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-blue-600 text-sm hover:underline"
                  >
                    Get Token →
                  </a>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mb-4">
              {accessToken ? 
                'Enter a Figma file key or URL to start parsing frames' :
                'For testing, enter "test" as the file key to use mock data'}
            </p>
            
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