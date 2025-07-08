import React from 'react';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, ToggleLeftIcon, ToggleRightIcon } from 'lucide-react';
import { useStore } from '../../store';
import type { Deliverable, Language } from '../../types';
import type { ColumnConfig, ColumnPosition } from './types';
import { AssetRow } from './AssetRow';
import { StickyCell } from './StickyCell';

interface DeliverableRowProps {
  deliverable: Deliverable;
  columns: ColumnConfig[];
  columnPositions: Record<string, ColumnPosition>;
  languages: Language[];
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery: string;
  onVariableHover: (variable: string) => void;
  dragAndDrop: any;
}

export function DeliverableRow({
  deliverable,
  columns,
  columnPositions,
  languages,
  isExpanded,
  onToggle,
  searchQuery,
  onVariableHover,
  dragAndDrop
}: DeliverableRowProps) {
  const { addAsset, sectionToggles, toggleSection } = useStore();
  
  // Map deliverable type to section key
  const getSectionKey = (type: string): 'pdp' | 'banners' | 'crm' | null => {
    switch (type) {
      case 'pdp': return 'pdp';
      case 'banner': return 'banners';
      case 'crm': return 'crm';
      default: return null;
    }
  };
  
  const sectionKey = getSectionKey(deliverable.type);
  const isEnabled = sectionKey ? sectionToggles[sectionKey] : true;
  const opacity = isEnabled ? 1 : 0.4;

  return (
    <>
      {/* Deliverable Header Row */}
      <tr className="bg-gray-100 hover:bg-gray-200 transition-colors" style={{ opacity }}>
        {columns.map((column, index) => {
          const isFirstColumn = index === 0;
          
          if (isFirstColumn) {
            return (
              <StickyCell
                key={column.id}
                column={column}
                position={columnPositions[column.id]}
                className="bg-gray-100"
              >
                <div className="flex items-center justify-between">
                  <button 
                    onClick={onToggle}
                    className="flex items-center text-left text-sm font-semibold text-gray-900 hover:text-gray-700"
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    )}
                    {deliverable.name.toUpperCase()}
                  </button>
                  {sectionKey && (
                    <button
                      onClick={() => toggleSection(sectionKey)}
                      className="ml-4 p-1 hover:bg-gray-200 rounded transition-colors"
                      title={isEnabled ? 'Disable section' : 'Enable section'}
                    >
                      {isEnabled ? (
                        <ToggleRightIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeftIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </StickyCell>
            );
          }
          
          return (
            <StickyCell
              key={column.id}
              column={column}
              position={columnPositions[column.id]}
              className="bg-gray-100"
            />
          );
        })}
      </tr>
      
      {/* Expanded Content */}
      {isExpanded && (
        <>
          {deliverable.assets.map((asset, assetIndex) => {
            const isLastGalleryImage = asset.type === 'gallery' && 
              (assetIndex === deliverable.assets.length - 1 || 
               deliverable.assets[assetIndex + 1]?.type !== 'gallery');
            
            return (
              <React.Fragment key={asset.id}>
                <AssetRow
                  asset={asset}
                  deliverable={deliverable}
                  columns={columns}
                  columnPositions={columnPositions}
                  languages={languages}
                  assetIndex={assetIndex}
                  searchQuery={searchQuery}
                  onVariableHover={onVariableHover}
                  dragAndDrop={dragAndDrop}
                  opacity={opacity}
                />
                
                {/* Add Gallery Image button after last gallery image */}
                {isLastGalleryImage && deliverable.type === 'pdp' && (
                  <tr className="hover:bg-gray-50 transition-colors" style={{ opacity }}>
                    <StickyCell
                      column={columns[0]}
                      position={columnPositions[columns[0].id]}
                    >
                      <button
                        onClick={() => addAsset(deliverable.id, 'gallery')}
                        className="flex items-center text-sm text-purple-600 hover:text-purple-700 ml-6 py-1"
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add Gallery Image
                      </button>
                    </StickyCell>
                    {columns.slice(1).map(column => (
                      <StickyCell
                        key={column.id}
                        column={column}
                        position={columnPositions[column.id]}
                      />
                    ))}
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          
          {/* Add Asset Button Row */}
          <tr className="hover:bg-gray-50 transition-colors" style={{ opacity }}>
            <StickyCell
              column={columns[0]}
              position={columnPositions[columns[0].id]}
            >
              <button
                onClick={() => addAsset(deliverable.id, deliverable.type === 'pdp' ? 'module' : deliverable.type === 'banner' ? 'banner' : 'gallery')}
                className="flex items-center text-sm text-purple-600 hover:text-purple-700 ml-6 py-1"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add {deliverable.type === 'pdp' ? 'Module' : deliverable.type === 'banner' ? 'Banner' : 'Gallery Image'}
              </button>
            </StickyCell>
            {columns.slice(1).map(column => (
              <StickyCell
                key={column.id}
                column={column}
                position={columnPositions[column.id]}
              />
            ))}
          </tr>
        </>
      )}
    </>
  );
}