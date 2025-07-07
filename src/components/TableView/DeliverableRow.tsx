import { ChevronDownIcon, ChevronRightIcon, PlusIcon } from 'lucide-react';
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
}

export function DeliverableRow({
  deliverable,
  columns,
  columnPositions,
  languages,
  isExpanded,
  onToggle,
  searchQuery,
  onVariableHover
}: DeliverableRowProps) {
  const { addAsset } = useStore();

  return (
    <>
      {/* Deliverable Header Row */}
      <tr className="bg-gray-100 hover:bg-gray-200 transition-colors">
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
                <button 
                  onClick={onToggle}
                  className="flex items-center w-full text-left text-sm font-semibold text-gray-900 hover:text-gray-700"
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                  )}
                  {deliverable.name.toUpperCase()}
                </button>
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
          {deliverable.assets.map((asset, assetIndex) => (
            <AssetRow
              key={asset.id}
              asset={asset}
              deliverable={deliverable}
              columns={columns}
              columnPositions={columnPositions}
              languages={languages}
              assetIndex={assetIndex}
              searchQuery={searchQuery}
              onVariableHover={onVariableHover}
            />
          ))}
          
          {/* Add Asset Button Row */}
          <tr className="hover:bg-gray-50 transition-colors">
            <StickyCell
              column={columns[0]}
              position={columnPositions[columns[0].id]}
            >
              <button
                onClick={() => addAsset(deliverable.id, deliverable.type === 'pdp' ? 'module' : 'module')}
                className="flex items-center text-sm text-purple-600 hover:text-purple-700 ml-6 py-1"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add {deliverable.type === 'pdp' ? 'Module' : 'Asset'}
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