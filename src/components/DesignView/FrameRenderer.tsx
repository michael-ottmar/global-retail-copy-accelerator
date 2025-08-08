import { useEffect, useState } from 'react';
import { FigmaNode, ParsedComponent, VariableMapping } from './types';
import { parseFrameToComponents } from './utils/frameParser';
import { generateCSS } from './utils/cssGenerator';

interface FrameRendererProps {
  frame: FigmaNode;
  parsedComponents: ParsedComponent[];
  mode: 'figma' | 'mapped';
  variableMappings?: Map<string, VariableMapping>;
}

export function FrameRenderer({ 
  frame, 
  parsedComponents, 
  mode, 
  variableMappings 
}: FrameRendererProps) {
  const [components, setComponents] = useState<ParsedComponent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Parse the frame and generate components
    const parsed = parseFrameToComponents(frame);
    setComponents(parsed);
    setLoading(false);
  }, [frame]);

  const renderComponent = (component: ParsedComponent): JSX.Element => {
    // Apply CSS styles generated from Figma properties
    const styles = generateCSS(component);
    
    // Get content based on mode
    let content = component.textContent || '';
    
    if (mode === 'mapped' && variableMappings) {
      const mapping = variableMappings.get(component.figmaId);
      if (mapping && mapping.syncStatus === 'mapped') {
        // TODO: Get actual content from translation store
        content = `[${mapping.variablePath}]`;
      }
    }

    if (component.type === 'text') {
      return (
        <div
          key={component.id}
          style={styles}
          className="figma-text-node"
          data-figma-id={component.figmaId}
        >
          {content}
        </div>
      );
    }

    if (component.type === 'image') {
      return (
        <div
          key={component.id}
          style={styles}
          className="figma-image-node"
          data-figma-id={component.figmaId}
        >
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
            Image Placeholder
          </div>
        </div>
      );
    }

    // Container or shape
    return (
      <div
        key={component.id}
        style={styles}
        className="figma-container-node"
        data-figma-id={component.figmaId}
      >
        {component.children.map(child => renderComponent(child))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Parsing frame...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-100 rounded-lg p-4 overflow-auto">
      <div 
        className="bg-white shadow-lg mx-auto"
        style={{
          width: `${frame.absoluteBoundingBox.width}px`,
          height: `${frame.absoluteBoundingBox.height}px`,
          position: 'relative',
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }}
      >
        {components.map(component => renderComponent(component))}
      </div>
    </div>
  );
}