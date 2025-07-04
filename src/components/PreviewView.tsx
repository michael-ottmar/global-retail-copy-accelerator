import { useState } from 'react';
import { useStore } from '../store';
import { PlusIcon, MinusIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export function PreviewView() {
  const { project, translations, selectedLanguage, addAsset, removeAsset } = useStore();
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  if (!project) return null;

  const pdp = project.deliverables.find(d => d.type === 'pdp');
  if (!pdp) return null;

  const productDetails = pdp.assets.find(a => a.type === 'productDetails');
  const galleryImages = pdp.assets.filter(a => a.type === 'gallery');
  const modules = pdp.assets.filter(a => a.type === 'module');

  const getTranslationValue = (fieldId: string) => {
    const translation = translations.find(t => t.fieldId === fieldId && t.languageCode === selectedLanguage);
    return translation?.value || '';
  };

  const nextGalleryImage = () => {
    setCurrentGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevGalleryImage = () => {
    setCurrentGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Amazon PDP Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Left Column - Gallery */}
          <div>
            <div className="relative bg-gray-100 rounded-lg p-8 mb-4">
              {galleryImages.length > 0 && (
                <>
                  <div className="aspect-square bg-white rounded flex items-center justify-center">
                    <div className="text-center p-8">
                      <h3 className="text-lg font-semibold mb-2">
                        {galleryImages[currentGalleryIndex].name}
                      </h3>
                      {galleryImages[currentGalleryIndex].fields.map((field) => (
                        <div key={field.id} className="mb-2">
                          <span className="text-sm text-gray-500">{field.name}:</span>
                          <p className="text-sm">{getTranslationValue(field.id) || '[Empty]'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Gallery Navigation */}
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={prevGalleryImage}
                      className="p-2 rounded-full bg-white shadow hover:shadow-md"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="flex space-x-2">
                      {galleryImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentGalleryIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentGalleryIndex ? 'bg-purple-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={nextGalleryImage}
                      className="p-2 rounded-full bg-white shadow hover:shadow-md"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
              
              {/* Add/Remove Gallery Images */}
              <div className="mt-4 flex justify-center space-x-2">
                <button
                  onClick={() => addAsset(pdp.id, 'gallery')}
                  className="flex items-center text-sm text-purple-600 hover:text-purple-700"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Gallery Image
                </button>
                {galleryImages.length > 1 && (
                  <button
                    onClick={() => removeAsset(galleryImages[currentGalleryIndex].id)}
                    className="flex items-center text-sm text-red-600 hover:text-red-700"
                  >
                    <MinusIcon className="w-4 h-4 mr-1" />
                    Remove Current
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div>
            {productDetails && (
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-4">
                  {getTranslationValue(productDetails.fields.find(f => f.type === 'productName')?.id || '') || '[Product Name]'}
                </h1>
                
                <div className="mb-6">
                  <p className="text-gray-700">
                    {getTranslationValue(productDetails.fields.find(f => f.type === 'productDetails')?.id || '') || '[Product Details]'}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Key Features:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {productDetails.fields
                      .filter(f => f.type === 'bullet')
                      .map((field) => (
                        <li key={field.id} className="text-gray-700">
                          {getTranslationValue(field.id) || '[Bullet Point]'}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modules Section */}
        <div className="border-t border-gray-200 p-8">
          <h2 className="text-xl font-semibold mb-6">Content Modules</h2>
          <div className="space-y-6">
            {modules.map((module) => (
              <div key={module.id} className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">{module.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {module.fields.map((field) => (
                    <div key={field.id}>
                      <span className="text-sm text-gray-500">{field.name}:</span>
                      <p className="text-sm">{getTranslationValue(field.id) || '[Empty]'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Module Button */}
          <div className="mt-6">
            <button
              onClick={() => addAsset(pdp.id, 'module')}
              className="flex items-center text-sm text-purple-600 hover:text-purple-700"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Module
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}