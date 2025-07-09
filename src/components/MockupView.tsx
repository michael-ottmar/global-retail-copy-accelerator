import { useState } from 'react';
import { useStore } from '../store';
import { PlusIcon, MinusIcon, ChevronLeftIcon, ChevronRightIcon, CopyIcon, Trash2Icon } from 'lucide-react';
import { EditableField } from './MockupView/EditableField';
import { FieldGroup } from './MockupView/FieldGroup';

export function MockupView() {
  const { 
    project, 
    selectedLanguage, 
    addAsset, 
    removeAsset, 
    duplicateAsset, 
    updateAssetName,
    updateFieldName,
    addCustomField,
    removeField 
  } = useStore();
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [assetName, setAssetName] = useState('');

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
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
        {/* PDP Section */}
        {pdp && (
          <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold p-6 border-b border-gray-200">Product Detail Page (PDP)</h2>
            {/* Amazon PDP Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Left Column - Gallery */}
          <div>
            <div className="relative bg-gray-100 rounded-lg p-8 mb-4 group">
              {galleryImages.length > 0 && (
                <>
                  {/* Hover Actions for Gallery */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                    <button
                      onClick={() => pdp && duplicateAsset(pdp.id, galleryImages[currentGalleryIndex].id)}
                      className="p-1.5 bg-white text-gray-600 hover:text-gray-800 rounded shadow-sm hover:shadow"
                      title="Duplicate gallery image"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        removeAsset(galleryImages[currentGalleryIndex].id);
                        if (currentGalleryIndex > 0) {
                          setCurrentGalleryIndex(currentGalleryIndex - 1);
                        }
                      }}
                      className="p-1.5 bg-white text-red-500 hover:text-red-700 rounded shadow-sm hover:shadow"
                      title="Delete gallery image"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="aspect-square bg-white rounded flex items-center justify-center">
                    <div className="text-center p-8">
                      <h3 className="text-lg font-semibold mb-2">
                        {editingAssetId === galleryImages[currentGalleryIndex].id ? (
                          <input
                            type="text"
                            value={assetName}
                            onChange={(e) => setAssetName(e.target.value)}
                            onBlur={() => {
                              updateAssetName(galleryImages[currentGalleryIndex].id, assetName);
                              setEditingAssetId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateAssetName(galleryImages[currentGalleryIndex].id, assetName);
                                setEditingAssetId(null);
                              } else if (e.key === 'Escape') {
                                setAssetName(galleryImages[currentGalleryIndex].name);
                                setEditingAssetId(null);
                              }
                            }}
                            className="px-2 py-1 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="cursor-text hover:bg-gray-200 px-2 py-1 rounded inline-block"
                            onClick={() => {
                              setAssetName(galleryImages[currentGalleryIndex].name);
                              setEditingAssetId(galleryImages[currentGalleryIndex].id);
                            }}
                          >
                            {galleryImages[currentGalleryIndex].name}
                          </span>
                        )}
                      </h3>
                      <FieldGroup
                        fields={galleryImages[currentGalleryIndex].fields}
                        asset={galleryImages[currentGalleryIndex]}
                        currentLanguage={currentLanguage}
                        updateFieldName={updateFieldName}
                        removeField={removeField}
                        addCustomField={addCustomField}
                      />
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
                    languageCode={currentLanguage}
                    placeholder="Product Name"
                    className="text-2xl font-bold"
                  />
                </h1>
                
                <div className="mb-6">
                  <EditableField
                    fieldId={productDetails.fields.find(f => f.type === 'productDetails')?.id || ''}
                    languageCode={currentLanguage}
                    placeholder="Product Details"
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
                            placeholder="Bullet Point"
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
              <div key={module.id} className="bg-gray-50 rounded-lg p-6 relative group">
                {/* Hover Actions */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={() => pdp && duplicateAsset(pdp.id, module.id)}
                    className="p-1.5 bg-white text-gray-600 hover:text-gray-800 rounded shadow-sm hover:shadow"
                    title="Duplicate module"
                  >
                    <CopyIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeAsset(module.id)}
                    className="p-1.5 bg-white text-red-500 hover:text-red-700 rounded shadow-sm hover:shadow"
                    title="Delete module"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Module Name - Editable */}
                <h3 className="font-semibold mb-4">
                  {editingAssetId === module.id ? (
                    <input
                      type="text"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      onBlur={() => {
                        updateAssetName(module.id, assetName);
                        setEditingAssetId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateAssetName(module.id, assetName);
                          setEditingAssetId(null);
                        } else if (e.key === 'Escape') {
                          setAssetName(module.name);
                          setEditingAssetId(null);
                        }
                      }}
                      className="px-2 py-1 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-text hover:bg-gray-200 px-2 py-1 rounded inline-block"
                      onClick={() => {
                        setAssetName(module.name);
                        setEditingAssetId(module.id);
                      }}
                    >
                      {module.name}
                    </span>
                  )}
                </h3>
                <FieldGroup
                  fields={module.fields}
                  asset={module}
                  currentLanguage={currentLanguage}
                  updateFieldName={updateFieldName}
                  removeField={removeField}
                  addCustomField={addCustomField}
                  className="grid grid-cols-2 gap-4"
                />
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
                  <div key={banner.id} className="border border-gray-200 rounded-lg p-4 relative group">
                    {/* Hover Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => duplicateAsset(banners.id, banner.id)}
                        className="p-1 bg-white text-gray-600 hover:text-gray-800 rounded shadow-sm hover:shadow"
                        title="Duplicate banner"
                      >
                        <CopyIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeAsset(banner.id)}
                        className="p-1 bg-white text-red-500 hover:text-red-700 rounded shadow-sm hover:shadow"
                        title="Delete banner"
                      >
                        <Trash2Icon className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Banner Name - Editable */}
                    <h3 className="font-semibold mb-3">
                      {editingAssetId === banner.id ? (
                        <input
                          type="text"
                          value={assetName}
                          onChange={(e) => setAssetName(e.target.value)}
                          onBlur={() => {
                            updateAssetName(banner.id, assetName);
                            setEditingAssetId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateAssetName(banner.id, assetName);
                              setEditingAssetId(null);
                            } else if (e.key === 'Escape') {
                              setAssetName(banner.name);
                              setEditingAssetId(null);
                            }
                          }}
                          className="px-1 py-0.5 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className="cursor-text hover:bg-gray-200 px-1 py-0.5 rounded inline-block"
                          onClick={() => {
                            setAssetName(banner.name);
                            setEditingAssetId(banner.id);
                          }}
                        >
                          {banner.name}
                        </span>
                      )}
                    </h3>
                    <FieldGroup
                      fields={banner.fields}
                      asset={banner}
                      currentLanguage={currentLanguage}
                      updateFieldName={updateFieldName}
                      removeField={removeField}
                      addCustomField={addCustomField}
                      className="space-y-2"
                    />
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
                  <div key={module.id} className="border border-gray-200 rounded-lg p-4 relative group">
                    {/* Hover Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => duplicateAsset(crm.id, module.id)}
                        className="p-1 bg-white text-gray-600 hover:text-gray-800 rounded shadow-sm hover:shadow"
                        title="Duplicate module"
                      >
                        <CopyIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeAsset(module.id)}
                        className="p-1 bg-white text-red-500 hover:text-red-700 rounded shadow-sm hover:shadow"
                        title="Delete module"
                      >
                        <Trash2Icon className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Module Name - Editable */}
                    <h3 className="font-semibold mb-3">
                      {editingAssetId === module.id ? (
                        <input
                          type="text"
                          value={assetName}
                          onChange={(e) => setAssetName(e.target.value)}
                          onBlur={() => {
                            updateAssetName(module.id, assetName);
                            setEditingAssetId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateAssetName(module.id, assetName);
                              setEditingAssetId(null);
                            } else if (e.key === 'Escape') {
                              setAssetName(module.name);
                              setEditingAssetId(null);
                            }
                          }}
                          className="px-1 py-0.5 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className="cursor-text hover:bg-gray-200 px-1 py-0.5 rounded inline-block"
                          onClick={() => {
                            setAssetName(module.name);
                            setEditingAssetId(module.id);
                          }}
                        >
                          {module.name}
                        </span>
                      )}
                    </h3>
                    <FieldGroup
                      fields={module.fields}
                      asset={module}
                      currentLanguage={currentLanguage}
                      updateFieldName={updateFieldName}
                      removeField={removeField}
                      addCustomField={addCustomField}
                      className="grid grid-cols-2 gap-4"
                    />
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
    </div>
  );
}