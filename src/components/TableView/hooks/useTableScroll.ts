import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { ColumnPosition } from '../types';

export function useTableScroll(
  containerRef: RefObject<HTMLDivElement>,
  selectedLanguage: string,
  columnPositions: Record<string, ColumnPosition>
) {
  useEffect(() => {
    if (!containerRef.current || selectedLanguage === 'en') return;
    
    const selectedColumn = columnPositions[selectedLanguage];
    if (!selectedColumn) return;
    
    // Smooth scroll to show the selected language column
    // with some padding to show context
    const targetScroll = Math.max(0, selectedColumn.left - 100);
    
    containerRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }, [selectedLanguage, columnPositions, containerRef]);
}