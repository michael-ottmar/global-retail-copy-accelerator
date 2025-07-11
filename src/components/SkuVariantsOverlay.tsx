import { useState, useEffect } from 'react';
import { XIcon, PlusIcon, GripVerticalIcon, Trash2Icon } from 'lucide-react';
import { useStore } from '../store';
import type { SkuVariant } from '../types';

interface SkuVariantsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SkuVariantsOverlay({ isOpen, onClose }: SkuVariantsOverlayProps) {
  const { project, updateSkuVariants, setSelectedVariant } = useStore();
  const [variants, setVariants] = useState<SkuVariant[]>([]);
  const [newVariantName, setNewVariantName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [draggedItem, setDraggedItem] = useState<SkuVariant | null>(null);

  // Initialize variants from project
  useEffect(() => {
    if (project?.skuVariants) {
      setVariants(project.skuVariants);
    } else {
      // Default to single Standard variant
      setVariants([{ id: '1', name: 'Standard', isBase: true, order: 0 }]);
    }
  }, [project?.skuVariants, isOpen]);

  if (!isOpen) return null;

  const handleAddVariant = () => {
    if (newVariantName.trim()) {
      const newVariant: SkuVariant = {
        id: Date.now().toString(),
        name: newVariantName.trim(),
        isBase: false,
        order: variants.length
      };
      setVariants([...variants, newVariant]);
      setNewVariantName('');
      setShowAddForm(false);
    }
  };

  const handleDeleteVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handleDragStart = (e: React.DragEvent, variant: SkuVariant) => {
    setDraggedItem(variant);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetVariant: SkuVariant) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetVariant.id) return;

    const newVariants = [...variants];
    const draggedIndex = newVariants.findIndex(v => v.id === draggedItem.id);
    const targetIndex = newVariants.findIndex(v => v.id === targetVariant.id);

    // Remove dragged item and insert at target position
    newVariants.splice(draggedIndex, 1);
    newVariants.splice(targetIndex, 0, draggedItem);

    // Update order values
    newVariants.forEach((v, index) => {
      v.order = index;
    });

    setVariants(newVariants);
    setDraggedItem(null);
  };

  const handleSave = () => {
    updateSkuVariants(variants);
    // If we have multiple variants and none selected, select the base
    if (variants.length >= 2 && !project?.skuVariants) {
      const baseVariant = variants.find(v => v.isBase);
      if (baseVariant) {
        setSelectedVariant(baseVariant.id);
      }
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Manage SKU Variants</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-gray-600 mb-6">
              Create and manage product variants. The base variant's content can be inherited by other variants.
            </p>

            {/* Variants List */}
            <div className="space-y-3 mb-6">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  draggable={!variant.isBase}
                  onDragStart={(e) => handleDragStart(e, variant)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, variant)}
                  className={`flex items-center p-4 bg-gray-50 rounded-lg border ${
                    variant.isBase ? 'border-purple-300 bg-purple-50' : 'border-gray-200 cursor-move'
                  } group hover:border-gray-300 transition-colors`}
                >
                  {!variant.isBase && (
                    <GripVerticalIcon className="w-5 h-5 text-gray-400 mr-3" />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium">{variant.name}</span>
                      {variant.isBase && (
                        <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                          Base Variant
                        </span>
                      )}
                    </div>
                    {variant.isBase && (
                      <p className="text-sm text-gray-500 mt-1">
                        Other variants can inherit content from this variant
                      </p>
                    )}
                  </div>

                  {!variant.isBase && (
                    <button
                      onClick={() => handleDeleteVariant(variant.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 transition-opacity"
                      title="Delete variant"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Variant */}
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center text-purple-600 hover:text-purple-700"
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                Add variant
              </button>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variant Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddVariant();
                      if (e.key === 'Escape') {
                        setShowAddForm(false);
                        setNewVariantName('');
                      }
                    }}
                    placeholder="e.g., Deluxe, Ultimate"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoFocus
                  />
                  <button
                    onClick={handleAddVariant}
                    disabled={!newVariantName.trim()}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewVariantName('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">How variants work</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• The base variant contains the primary content</li>
                <li>• Other variants can inherit content from the base variant</li>
                <li>• Override specific fields in each variant as needed</li>
                <li>• Drag variants to reorder them</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              {variants.length} variant{variants.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-500 text-white hover:bg-purple-600 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}