import type { FigmaNode } from './types';
import { FrameIcon, ChevronRightIcon } from 'lucide-react';

interface FrameSelectorProps {
  frames: FigmaNode[];
  selectedFrame: FigmaNode | null;
  onSelectFrame: (frame: FigmaNode) => void;
}

export function FrameSelector({ frames, selectedFrame, onSelectFrame }: FrameSelectorProps) {
  // Group frames by type based on naming convention
  const groupedFrames = frames.reduce((acc, frame) => {
    const type = frame.name.toLowerCase().includes('pdp') ? 'Product Detail Pages' :
                  frame.name.toLowerCase().includes('banner') ? 'Banners' :
                  frame.name.toLowerCase().includes('gallery') ? 'Gallery Images' :
                  frame.name.toLowerCase().includes('module') ? 'Modules' :
                  frame.name.toLowerCase().includes('crm') ? 'CRM Assets' :
                  'Other';
    
    if (!acc[type]) acc[type] = [];
    acc[type].push(frame);
    return acc;
  }, {} as Record<string, FigmaNode[]>);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900">Frames</h3>
        <p className="text-xs text-gray-500 mt-1">
          {frames.length} frames found with naming patterns
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedFrames).map(([group, groupFrames]) => (
          <div key={group} className="border-b">
            <div className="px-4 py-2 bg-gray-50">
              <h4 className="text-xs font-medium text-gray-700">{group}</h4>
            </div>
            
            <div className="py-1">
              {groupFrames.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => onSelectFrame(frame)}
                  className={`w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    selectedFrame?.id === frame.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FrameIcon className="w-4 h-4 text-gray-400" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {frame.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(frame.absoluteBoundingBox.width)}×{Math.round(frame.absoluteBoundingBox.height)}
                      </div>
                    </div>
                  </div>
                  
                  {selectedFrame?.id === frame.id && (
                    <ChevronRightIcon className="w-4 h-4 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}