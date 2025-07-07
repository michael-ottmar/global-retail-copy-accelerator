import { useState, useEffect, useRef } from 'react';
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
  const [currentVariable, setCurrentVariable] = useState<string>('');
  
  // Define column configuration
  const columns: ColumnConfig[] = [
    { id: 'hierarchy', width: 350, sticky: true, label: 'Deliverable / Asset / Field' },
    ...(showVariableColumn ? [{ id: 'variable', width: 200, sticky: true, label: 'Variable' }] : []),
    { id: 'en', width: 300, sticky: true, label: 'English (Source)', isSource: true },
    ...(selectedLanguage !== 'en' ? [{
      id: selectedLanguage,
      width: 300,
      sticky: true,
      label: project?.languages.find(l => l.code === selectedLanguage)?.name || '',
      isSelected: true
    }] : []),
    ...(project?.languages
      .filter(lang => lang.code !== 'en' && lang.code !== selectedLanguage)
      .map(lang => ({
        id: lang.code,
        width: 300,
        sticky: false,
        label: lang.name
      })) || [])
  ];
  
  // Measure actual column widths and positions
  const { columnPositions, updateMeasurements } = useColumnMeasurements(columns);
  
  // Handle smooth scrolling to selected language
  useTableScroll(containerRef as React.RefObject<HTMLDivElement>, selectedLanguage, columnPositions);
  
  useEffect(() => {
    updateMeasurements();
  }, [showVariableColumn, selectedLanguage, updateMeasurements]);
  
  if (!project || currentView !== 'table') return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Variable Display Bar */}
      {currentVariable && (
        <div className="bg-white border-b border-gray-200 px-4 py-2 shadow-sm">
          <span className="text-sm text-gray-500">Variable:</span>
          <code className="ml-2 text-sm font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
            {currentVariable}
          </code>
        </div>
      )}
      
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
            onVariableHover={setCurrentVariable}
          />
        </table>
      </div>
    </div>
  );
}