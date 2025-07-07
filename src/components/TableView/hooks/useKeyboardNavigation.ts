import { useEffect, useCallback } from 'react';
import { useStore } from '../../../store';

interface NavigationCell {
  fieldId: string;
  languageCode: string;
}

export function useKeyboardNavigation(
  currentCell: NavigationCell | null,
  onNavigate: (cell: NavigationCell) => void
) {
  const { project } = useStore();
  
  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!currentCell || !project) return;
    
    // Get all fields in order
    const allFields: { fieldId: string; deliverableId: string; assetId: string }[] = [];
    project.deliverables.forEach(deliverable => {
      deliverable.assets.forEach(asset => {
        asset.fields.forEach(field => {
          allFields.push({
            fieldId: field.id,
            deliverableId: deliverable.id,
            assetId: asset.id
          });
        });
      });
    });
    
    // Get all language codes
    const languages = project.languages.map(l => l.code);
    
    // Find current position
    const currentFieldIndex = allFields.findIndex(f => f.fieldId === currentCell.fieldId);
    const currentLangIndex = languages.indexOf(currentCell.languageCode);
    
    if (currentFieldIndex === -1 || currentLangIndex === -1) return;
    
    let newFieldIndex = currentFieldIndex;
    let newLangIndex = currentLangIndex;
    
    switch (direction) {
      case 'up':
        newFieldIndex = Math.max(0, currentFieldIndex - 1);
        break;
      case 'down':
        newFieldIndex = Math.min(allFields.length - 1, currentFieldIndex + 1);
        break;
      case 'left':
        newLangIndex = Math.max(0, currentLangIndex - 1);
        break;
      case 'right':
        newLangIndex = Math.min(languages.length - 1, currentLangIndex + 1);
        break;
    }
    
    onNavigate({
      fieldId: allFields[newFieldIndex].fieldId,
      languageCode: languages[newLangIndex]
    });
  }, [currentCell, project, onNavigate]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle navigation when not editing
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigate('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigate('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigate('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigate('right');
          break;
        case 'Enter':
          // Enter key handled by individual cells
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
  
  return { navigate };
}