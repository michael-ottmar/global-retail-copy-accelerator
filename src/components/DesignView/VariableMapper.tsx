import { useState, useEffect } from 'react';
import type { FigmaNode, ParsedComponent, VariableMapping } from './types';
import { LinkIcon, UnlinkIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import type { Deliverable } from '../../types';

interface VariableMapperProps {
  frame: FigmaNode;
  parsedComponents: ParsedComponent[];
  variableMappings: Map<string, VariableMapping>;
  onUpdateMapping: (mappings: Map<string, VariableMapping>) => void;
  projectVariables: Deliverable[];
}

export function VariableMapper({ 
  frame, 
  parsedComponents, 
  variableMappings, 
  onUpdateMapping,
  projectVariables 
}: VariableMapperProps) {
  const [textNodes, setTextNodes] = useState<ParsedComponent[]>([]);
  const [suggestions, setSuggestions] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Extract all text nodes from parsed components
    const extractTextNodes = (): ParsedComponent[] => {
      const nodes: ParsedComponent[] = [];
      
      const traverse = (comp: ParsedComponent) => {
        if (comp.type === 'text') {
          nodes.push(comp);
        }
        comp.children.forEach(traverse);
      };
      
      parsedComponents.forEach(traverse);
      return nodes;
    };

    setTextNodes(extractTextNodes());
    
    // Auto-suggest mappings based on naming conventions
    generateSuggestions();
  }, [parsedComponents, frame]);

  const generateSuggestions = () => {
    const newSuggestions = new Map<string, string>();
    
    // Parse frame name to determine deliverable type
    const frameName = frame.name.toLowerCase();
    const deliverableType = frameName.includes('pdp') ? 'pdp' :
                           frameName.includes('banner') ? 'banner' :
                           frameName.includes('gallery') ? 'gallery' :
                           frameName.includes('module') ? 'module' :
                           frameName.includes('crm') ? 'crm' : null;

    if (deliverableType) {
      textNodes.forEach(node => {
        const nodeName = node.name.toLowerCase();
        
        // Try to match with field types
        const fieldType = nodeName.includes('headline') ? 'headline' :
                         nodeName.includes('body') ? 'body' :
                         nodeName.includes('legal') ? 'legal' :
                         nodeName.includes('feature') ? 'feature' :
                         nodeName.includes('cta') ? 'cta' : null;

        if (fieldType) {
          // Generate suggested variable path
          const assetMatch = frameName.match(/(\w+)_(\d+)/); // e.g., "gallery_image_1"
          const assetIdentifier = assetMatch ? assetMatch[0] : deliverableType;
          const suggestedPath = `${deliverableType}/${assetIdentifier}/${fieldType}`;
          newSuggestions.set(node.figmaId, suggestedPath);
        }
      });
    }
    
    setSuggestions(newSuggestions);
  };

  const handleMapVariable = (nodeId: string, variablePath: string) => {
    const node = textNodes.find(n => n.figmaId === nodeId);
    if (!node) return;

    const [deliverable, asset, field] = variablePath.split('/');
    
    const newMapping: VariableMapping = {
      figmaNodeId: nodeId,
      figmaNodeName: node.name,
      figmaTextContent: node.textContent || '',
      variablePath,
      deliverable,
      asset,
      field,
      syncStatus: 'mapped',
      confidence: 1
    };

    const newMappings = new Map(variableMappings);
    newMappings.set(nodeId, newMapping);
    onUpdateMapping(newMappings);
  };

  const handleUnmapVariable = (nodeId: string) => {
    const newMappings = new Map(variableMappings);
    newMappings.delete(nodeId);
    onUpdateMapping(newMappings);
  };

  const handleAutoMap = () => {
    suggestions.forEach((path, nodeId) => {
      if (!variableMappings.has(nodeId)) {
        handleMapVariable(nodeId, path);
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900">Variable Mapping</h3>
        <p className="text-xs text-gray-500 mt-1">
          {textNodes.length} text nodes • {variableMappings.size} mapped
        </p>
        
        {suggestions.size > 0 && (
          <button
            onClick={handleAutoMap}
            className="mt-2 w-full px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
          >
            Auto-map {suggestions.size} suggestions
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {textNodes.map(node => {
          const mapping = variableMappings.get(node.figmaId);
          const suggestion = suggestions.get(node.figmaId);
          
          return (
            <div
              key={node.figmaId}
              className="border rounded-lg p-3 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {node.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    "{node.textContent}"
                  </div>
                </div>
                
                <div className="ml-2">
                  {mapping ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  ) : suggestion ? (
                    <AlertCircleIcon className="w-4 h-4 text-yellow-500" />
                  ) : null}
                </div>
              </div>

              {mapping ? (
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-mono text-green-700">
                      {mapping.variablePath}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUnmapVariable(node.figmaId)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <UnlinkIcon className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestion && (
                    <button
                      onClick={() => handleMapVariable(node.figmaId, suggestion)}
                      className="w-full p-2 bg-yellow-50 rounded flex items-center justify-between hover:bg-yellow-100 transition-colors"
                    >
                      <span className="text-xs text-yellow-700">
                        Suggested: {suggestion}
                      </span>
                      <LinkIcon className="w-3 h-3 text-yellow-600" />
                    </button>
                  )}
                  
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleMapVariable(node.figmaId, e.target.value);
                      }
                    }}
                    className="w-full text-xs border rounded px-2 py-1.5"
                    defaultValue=""
                  >
                    <option value="">Select variable...</option>
                    {projectVariables.map(deliverable => (
                      <optgroup key={deliverable.id} label={deliverable.name}>
                        {deliverable.assets.map(asset => (
                          asset.fields.map(field => (
                            <option 
                              key={`${asset.id}-${field.id}`}
                              value={`${deliverable.id}/${asset.name.toLowerCase().replace(/\s+/g, '_')}/${field.name.toLowerCase()}`}
                            >
                              {asset.name} / {field.name}
                            </option>
                          ))
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}