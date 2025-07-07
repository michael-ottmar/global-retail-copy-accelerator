import { useState, useCallback } from 'react';
import { useStore } from '../../../store';

interface DragItem {
  type: 'asset' | 'field';
  assetId: string;
  fieldId?: string;
  deliverableId: string;
}

export function useDragAndDrop() {
  const { reorderAsset, reorderField } = useStore();
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverItem, setDragOverItem] = useState<DragItem | null>(null);
  
  const handleDragStart = useCallback((item: DragItem) => {
    setDraggedItem(item);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent, item: DragItem) => {
    e.preventDefault();
    if (draggedItem?.type === item.type) {
      setDragOverItem(item);
    }
  }, [draggedItem]);
  
  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent, dropItem: DragItem) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.type !== dropItem.type) return;
    
    if (draggedItem.type === 'asset' && dropItem.type === 'asset') {
      reorderAsset(
        draggedItem.deliverableId,
        draggedItem.assetId,
        dropItem.assetId
      );
    } else if (draggedItem.type === 'field' && dropItem.type === 'field' && draggedItem.fieldId && dropItem.fieldId) {
      reorderField(
        draggedItem.assetId,
        draggedItem.fieldId,
        dropItem.fieldId
      );
    }
    
    handleDragEnd();
  }, [draggedItem, reorderAsset, reorderField, handleDragEnd]);
  
  const isDragging = useCallback((item: DragItem) => {
    return draggedItem?.assetId === item.assetId && 
           draggedItem?.fieldId === item.fieldId;
  }, [draggedItem]);
  
  const isDragOver = useCallback((item: DragItem) => {
    return dragOverItem?.assetId === item.assetId && 
           dragOverItem?.fieldId === item.fieldId;
  }, [dragOverItem]);
  
  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    isDragging,
    isDragOver,
    draggedItem
  };
}