import { useState, useCallback, useRef } from 'react';
import type { ColumnConfig, ColumnPosition } from '../types';

export function useColumnMeasurements(columns: ColumnConfig[]) {
  const [columnPositions, setColumnPositions] = useState<Record<string, ColumnPosition>>({});
  const measurementRef = useRef<number | null>(null);
  
  const updateMeasurements = useCallback(() => {
    // Cancel any pending measurement
    if (measurementRef.current) {
      cancelAnimationFrame(measurementRef.current);
    }
    
    // Schedule measurement on next frame
    measurementRef.current = requestAnimationFrame(() => {
      const positions: Record<string, ColumnPosition> = {};
      let currentLeft = 0;
      
      columns.forEach((column) => {
        positions[column.id] = {
          left: currentLeft,
          width: column.width,
          isSticky: column.sticky
        };
        currentLeft += column.width;
      });
      
      setColumnPositions(positions);
      measurementRef.current = null;
    });
  }, [columns]);
  
  return {
    columnPositions,
    updateMeasurements
  };
}