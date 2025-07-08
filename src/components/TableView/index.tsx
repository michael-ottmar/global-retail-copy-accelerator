import { useEffect, useRef } from 'react';
import { useStore } from '../../store';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { useTableScroll } from './hooks/useTableScroll';
import { useColumnMeasurements } from './hooks/useColumnMeasurements';
import type { ColumnConfig } from './types';
import './TableView.css';

export function TableView() {
  const { 
    project, 
    selectedLanguage,
    showVariableColumn,
    searchQuery,
    selectedDeliverable,
    currentView
  } = useStore();
  
  const containerRef = useRef<HTMLDivElement>(null!);
  
  // Calculate variable column width based on content
  const calculateVariableColumnWidth = () => {
    if (!project) return 200;
    let maxLength = 0;
    
    project.deliverables.forEach(deliverable => {
      deliverable.assets.forEach(asset => {
        asset.fields.forEach(field => {
          const varName = `${deliverable.name.toLowerCase()}/${asset.name.toLowerCase()}/${(field.customName || field.name).toLowerCase()}`.replace(/\s+/g, '_');
          maxLength = Math.max(maxLength, varName.length);
        });
      });
    });
    
    // 8px per character + 32px padding (16px each side)
    return Math.min(Math.max(maxLength * 8 + 32, 150), 400);
  };
  
  // Define column configuration
  const columns: ColumnConfig[] = [
    { id: 'hierarchy', width: 350, sticky: true, label: 'Deliverable / Asset / Field' },
    ...(showVariableColumn ? [{ id: 'variable', width: calculateVariableColumnWidth(), sticky: true, label: 'Variable' }] : []),
    { id: 'en', width: 300, sticky: true, label: 'English (Source)', isSource: true },
    ...(project?.languages
      .filter(lang => lang.code !== 'en')
      .map(lang => ({
        id: lang.code,
        width: 300,
        sticky: selectedLanguage === lang.code && selectedLanguage !== 'all',
        label: lang.name,
        isSelected: selectedLanguage === lang.code && selectedLanguage !== 'all'
      })) || [])
  ];
  
  // Measure actual column widths and positions
  const { columnPositions, updateMeasurements } = useColumnMeasurements(columns);
  
  // Handle smooth scrolling to selected language
  useTableScroll(containerRef as React.RefObject<HTMLDivElement>, selectedLanguage === 'all' ? '' : selectedLanguage, columnPositions);
  
  useEffect(() => {
    updateMeasurements();
  }, [showVariableColumn, selectedLanguage, updateMeasurements]);
  
  if (!project || currentView !== 'table') return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Table Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-white"
        style={{ 
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch' 
        }}
      >
        <table className="w-full border-collapse">
          <TableHeader 
            columns={columns} 
            columnPositions={columnPositions}
            languages={project.languages}
          />
          <TableBody
            columns={columns}
            columnPositions={columnPositions}
            deliverables={selectedDeliverable 
              ? project.deliverables.filter(d => d.id === selectedDeliverable)
              : project.deliverables
            }
            languages={project.languages}
            searchQuery={searchQuery}
            onVariableHover={() => {}}
          />
        </table>
      </div>
    </div>
  );
}