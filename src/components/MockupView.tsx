import { useState } from 'react';
import { useStore } from '../store';
import { PlusIcon, MinusIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { EditableField } from './MockupView/EditableField';

export function MockupView() {
  const { project, selectedLanguage, addAsset, removeAsset } = useStore();
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  if (!project) return null;
  
  // Use English as default when "all languages" is selected
  const currentLanguage = selectedLanguage === 'all' ? 'en' : selectedLanguage;

  const pdp = project.deliverables.find(d => d.type === 'pdp');
  const banners = project.deliverables.find(d => d.type === 'banner');
  const crm = project.deliverables.find(d => d.type === 'crm');

  const productDetails = pdp?.assets.find(a => a.type === 'productDetails');
  const galleryImages = pdp?.assets.filter(a => a.type === 'gallery') || [];
  const modules = pdp?.assets.filter(a => a.type === 'module') || [];


  const nextGalleryImage = () => {
    setCurrentGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevGalleryImage = () => {
    setCurrentGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6 space-y-6">
        {/* PDP Section */}
        {pdp && (
          <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold p-6 border-b border-gray-200">Product Detail Page (PDP)</h2>
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
                          <span className="text-sm text-gray-500 block">{field.name}:</span>
                          <EditableField
                            fieldId={field.id}
                            languageCode={currentLanguage}
                            className="text-sm"
                            multiline={field.type === 'body' || field.type === 'legal'}
                          />
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
                  <EditableField
                    fieldId={productDetails.fields.find(f => f.type === 'productName')?.id || ''}
                    languageCode={selectedLanguage}
                    placeholder="[Product Name]"
                    className="text-2xl font-bold"
                  />
                </h1>
                
                <div className="mb-6">
                  <EditableField
                    fieldId={productDetails.fields.find(f => f.type === 'productDetails')?.id || ''}
                    languageCode={selectedLanguage}
                    placeholder="[Product Details]"
                    className="text-gray-700"
                    multiline={true}
                  />
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Key Features:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {productDetails.fields
                      .filter(f => f.type === 'bullet')
                      .map((field) => (
                        <li key={field.id} className="text-gray-700">
                          <EditableField
                            fieldId={field.id}
                            languageCode={currentLanguage}
                            placeholder="[Bullet Point]"
                            className="text-gray-700"
                          />
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
                      <span className="text-sm text-gray-500 block">{field.name}:</span>
                      <EditableField
                        fieldId={field.id}
                        languageCode={selectedLanguage}
                        className="text-sm"
                        multiline={field.type === 'body' || field.type === 'legal'}
                      />
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
        )}
        
        {/* Banners Section */}
        {banners && (
          <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold p-6 border-b border-gray-200">Banners</h2>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.assets.map((banner) => (
                  <div key={banner.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{banner.name}</h3>
                    <div className="space-y-2">
                      {banner.fields.map((field) => (
                        <div key={field.id}>
                          <span className="text-xs text-gray-500 block">{field.name}:</span>
                          <EditableField
                            fieldId={field.id}
                            languageCode={currentLanguage}
                            className="text-sm text-gray-700"
                            multiline={field.type === 'body' || field.type === 'legal'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addAsset(banners.id, 'banner')}
                className="mt-4 flex items-center text-sm text-purple-600 hover:text-purple-700"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Banner
              </button>
            </div>
          </div>
        )}
        
        {/* CRM Section */}
        {crm && (
          <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold p-6 border-b border-gray-200">CRM</h2>
            <div className="p-6">
              <div className="space-y-4">
                {crm.assets.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{module.name}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {module.fields.map((field) => (
                        <div key={field.id}>
                          <span className="text-xs text-gray-500 block">{field.name}:</span>
                          <EditableField
                            fieldId={field.id}
                            languageCode={currentLanguage}
                            className="text-sm text-gray-700"
                            multiline={field.type === 'body' || field.type === 'legal'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addAsset(crm.id, 'module')}
                className="mt-4 flex items-center text-sm text-purple-600 hover:text-purple-700"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Module
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}