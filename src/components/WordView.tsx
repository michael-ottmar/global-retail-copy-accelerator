import { useState } from 'react';
import { useStore } from '../store';
import { EditableField } from './MockupView/EditableField';
import { PlusIcon, Trash2Icon, CopyIcon } from 'lucide-react';

export function WordView() {
  const { 
    project, 
    selectedLanguage, 
    addAsset, 
    removeAsset, 
    duplicateAsset, 
    updateAssetName,
    updateFieldName,
    addCustomField,
    removeField,
    sectionToggles 
  } = useStore();
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [assetName, setAssetName] = useState('');
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldName, setFieldName] = useState('');

  if (!project) return null;
  
  // Use English as default when "all languages" is selected
  const currentLanguage = selectedLanguage === 'all' ? 'en' : selectedLanguage;

  const pdp = project.deliverables.find(d => d.type === 'pdp');
  const banners = project.deliverables.find(d => d.type === 'banner');
  const crm = project.deliverables.find(d => d.type === 'crm');

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100">
      <div className="flex-1 overflow-auto">
        {/* Document Container */}
        <div className="max-w-4xl mx-auto my-8 bg-white shadow-lg">
          {/* Document Page */}
          <div className="min-h-[11in] px-[1in] py-[1in]">
            {/* Document Title */}
            <h1 className="text-3xl font-bold mb-8 text-center">{project.name}</h1>
            
            {/* Table of Contents */}
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-4">Table of Contents</h2>
              <ul className="list-decimal list-inside space-y-1 text-blue-600">
                {sectionToggles.pdp && <li><a href="#pdp" className="hover:underline">Product Detail Page (PDP)</a></li>}
                {sectionToggles.banners && <li><a href="#banners" className="hover:underline">Banners</a></li>}
                {sectionToggles.crm && <li><a href="#crm" className="hover:underline">CRM</a></li>}
              </ul>
            </div>

            {/* PDP Section */}
            {pdp && sectionToggles.pdp && (
              <section id="pdp" className="mb-12">
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-gray-300">
                  Product Detail Page (PDP)
                </h2>
                
                {/* Product Details */}
                {pdp.assets.filter(a => a.type === 'productDetails').map(asset => (
                  <div key={asset.id} className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">Product Information</h3>
                    {asset.fields.map(field => (
                      <div key={field.id} className="mb-4">
                        <span className="font-medium text-gray-700">
                          {field.customName || field.name}:
                        </span>{' '}
                        <EditableField
                          fieldId={field.id}
                          languageCode={currentLanguage}
                          className="inline"
                        />
                      </div>
                    ))}
                  </div>
                ))}

                {/* Gallery Images */}
                {pdp.assets.filter(a => a.type === 'gallery').length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">Gallery Images</h3>
                    {pdp.assets.filter(a => a.type === 'gallery').map((asset) => (
                      <div key={asset.id} className="mb-6 ml-4 group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">
                              {editingAssetId === asset.id ? (
                                <input
                                  type="text"
                                  value={assetName}
                                  onChange={(e) => setAssetName(e.target.value)}
                                  onBlur={() => {
                                    updateAssetName(asset.id, assetName);
                                    setEditingAssetId(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updateAssetName(asset.id, assetName);
                                      setEditingAssetId(null);
                                    } else if (e.key === 'Escape') {
                                      setAssetName(asset.name);
                                      setEditingAssetId(null);
                                    }
                                  }}
                                  className="px-1 py-0.5 border border-purple-500 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  autoFocus
                                />
                              ) : (
                                <span 
                                  className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                                  onClick={() => {
                                    setAssetName(asset.name);
                                    setEditingAssetId(asset.id);
                                  }}
                                >
                                  {asset.name}
                                </span>
                              )}
                            </h4>
                            {asset.fields.map(field => (
                              <div key={field.id} className="mb-2 ml-4">
                                <span className="text-sm text-gray-600">
                                  {field.customName || field.name}:
                                </span>{' '}
                                <EditableField
                                  fieldId={field.id}
                                  languageCode={currentLanguage}
                                  className="text-sm"
                                />
                              </div>
                            ))}
                          </div>
                          {/* Hover actions */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              onClick={() => pdp && duplicateAsset(pdp.id, asset.id)}
                              className="p-1 text-gray-600 hover:text-gray-800"
                              title="Duplicate"
                            >
                              <CopyIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeAsset(asset.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2Icon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => addAsset(pdp.id, 'gallery')}
                      className="text-sm text-purple-600 hover:text-purple-700 ml-4"
                    >
                      <PlusIcon className="w-4 h-4 inline mr-1" />
                      Add Gallery Image
                    </button>
                  </div>
                )}

                {/* Content Modules */}
                {pdp.assets.filter(a => a.type === 'module').length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">Content Modules</h3>
                    {pdp.assets.filter(a => a.type === 'module').map(asset => (
                      <div key={asset.id} className="mb-6 ml-4 group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">
                              {editingAssetId === asset.id ? (
                                <input
                                  type="text"
                                  value={assetName}
                                  onChange={(e) => setAssetName(e.target.value)}
                                  onBlur={() => {
                                    updateAssetName(asset.id, assetName);
                                    setEditingAssetId(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updateAssetName(asset.id, assetName);
                                      setEditingAssetId(null);
                                    } else if (e.key === 'Escape') {
                                      setAssetName(asset.name);
                                      setEditingAssetId(null);
                                    }
                                  }}
                                  className="px-1 py-0.5 border border-purple-500 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  autoFocus
                                />
                              ) : (
                                <span 
                                  className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                                  onClick={() => {
                                    setAssetName(asset.name);
                                    setEditingAssetId(asset.id);
                                  }}
                                >
                                  {asset.name}
                                </span>
                              )}
                            </h4>
                            {asset.fields.map(field => (
                              <div key={field.id} className="mb-2 ml-4 group/field">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <span className="text-sm text-gray-600">
                                      {editingFieldId === field.id ? (
                                        <input
                                          type="text"
                                          value={fieldName}
                                          onChange={(e) => setFieldName(e.target.value)}
                                          onBlur={() => {
                                            updateFieldName(asset.id, field.id, fieldName);
                                            setEditingFieldId(null);
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              updateFieldName(asset.id, field.id, fieldName);
                                              setEditingFieldId(null);
                                            } else if (e.key === 'Escape') {
                                              setFieldName(field.customName || field.name);
                                              setEditingFieldId(null);
                                            }
                                          }}
                                          className="px-1 py-0.5 border border-purple-500 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                                          autoFocus
                                        />
                                      ) : (
                                        <span 
                                          className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                                          onClick={() => {
                                            setFieldName(field.customName || field.name);
                                            setEditingFieldId(field.id);
                                          }}
                                        >
                                          {field.customName || field.name}:
                                        </span>
                                      )}
                                    </span>{' '}
                                    <EditableField
                                      fieldId={field.id}
                                      languageCode={currentLanguage}
                                      className="text-sm"
                                    />
                                  </div>
                                  <button
                                    onClick={() => removeField(asset.id, field.id)}
                                    className="opacity-0 group-hover/field:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700"
                                    title="Delete field"
                                  >
                                    <Trash2Icon className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const fieldName = prompt('Enter field name:');
                                if (fieldName) addCustomField(asset.id, fieldName);
                              }}
                              className="text-xs text-purple-600 hover:text-purple-700 ml-4"
                            >
                              <PlusIcon className="w-3 h-3 inline mr-1" />
                              Add field
                            </button>
                          </div>
                          {/* Hover actions */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              onClick={() => pdp && duplicateAsset(pdp.id, asset.id)}
                              className="p-1 text-gray-600 hover:text-gray-800"
                              title="Duplicate"
                            >
                              <CopyIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeAsset(asset.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2Icon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => addAsset(pdp.id, 'module')}
                      className="text-sm text-purple-600 hover:text-purple-700 ml-4"
                    >
                      <PlusIcon className="w-4 h-4 inline mr-1" />
                      Add Module
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Banners Section */}
            {banners && sectionToggles.banners && (
              <section id="banners" className="mb-12">
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-gray-300">
                  Banners
                </h2>
                {banners.assets.map(asset => (
                  <div key={asset.id} className="mb-6 ml-4 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">
                          {editingAssetId === asset.id ? (
                            <input
                              type="text"
                              value={assetName}
                              onChange={(e) => setAssetName(e.target.value)}
                              onBlur={() => {
                                updateAssetName(asset.id, assetName);
                                setEditingAssetId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateAssetName(asset.id, assetName);
                                  setEditingAssetId(null);
                                } else if (e.key === 'Escape') {
                                  setAssetName(asset.name);
                                  setEditingAssetId(null);
                                }
                              }}
                              className="px-1 py-0.5 border border-purple-500 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              autoFocus
                            />
                          ) : (
                            <span 
                              className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                              onClick={() => {
                                setAssetName(asset.name);
                                setEditingAssetId(asset.id);
                              }}
                            >
                              {asset.name}
                            </span>
                          )}
                        </h3>
                        {asset.fields.map(field => (
                          <div key={field.id} className="mb-2 ml-4 group/field">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <span className="text-sm text-gray-600">
                                  {editingFieldId === field.id ? (
                                    <input
                                      type="text"
                                      value={fieldName}
                                      onChange={(e) => setFieldName(e.target.value)}
                                      onBlur={() => {
                                        updateFieldName(asset.id, field.id, fieldName);
                                        setEditingFieldId(null);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          updateFieldName(asset.id, field.id, fieldName);
                                          setEditingFieldId(null);
                                        } else if (e.key === 'Escape') {
                                          setFieldName(field.customName || field.name);
                                          setEditingFieldId(null);
                                        }
                                      }}
                                      className="px-1 py-0.5 border border-purple-500 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                                      autoFocus
                                    />
                                  ) : (
                                    <span 
                                      className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                                      onClick={() => {
                                        setFieldName(field.customName || field.name);
                                        setEditingFieldId(field.id);
                                      }}
                                    >
                                      {field.customName || field.name}:
                                    </span>
                                  )}
                                </span>{' '}
                                <EditableField
                                  fieldId={field.id}
                                  languageCode={currentLanguage}
                                  className="text-sm"
                                />
                              </div>
                              <button
                                onClick={() => removeField(asset.id, field.id)}
                                className="opacity-0 group-hover/field:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700"
                                title="Delete field"
                              >
                                <Trash2Icon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const fieldName = prompt('Enter field name:');
                            if (fieldName) addCustomField(asset.id, fieldName);
                          }}
                          className="text-xs text-purple-600 hover:text-purple-700 ml-4"
                        >
                          <PlusIcon className="w-3 h-3 inline mr-1" />
                          Add field
                        </button>
                      </div>
                      {/* Hover actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => duplicateAsset(banners.id, asset.id)}
                          className="p-1 text-gray-600 hover:text-gray-800"
                          title="Duplicate"
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeAsset(asset.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addAsset(banners.id, 'banner')}
                  className="text-sm text-purple-600 hover:text-purple-700 ml-4"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Add Banner
                </button>
              </section>
            )}

            {/* CRM Section */}
            {crm && sectionToggles.crm && (
              <section id="crm" className="mb-12">
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-gray-300">
                  CRM
                </h2>
                {crm.assets.map(asset => (
                  <div key={asset.id} className="mb-6 ml-4 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">
                          {editingAssetId === asset.id ? (
                            <input
                              type="text"
                              value={assetName}
                              onChange={(e) => setAssetName(e.target.value)}
                              onBlur={() => {
                                updateAssetName(asset.id, assetName);
                                setEditingAssetId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateAssetName(asset.id, assetName);
                                  setEditingAssetId(null);
                                } else if (e.key === 'Escape') {
                                  setAssetName(asset.name);
                                  setEditingAssetId(null);
                                }
                              }}
                              className="px-1 py-0.5 border border-purple-500 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              autoFocus
                            />
                          ) : (
                            <span 
                              className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                              onClick={() => {
                                setAssetName(asset.name);
                                setEditingAssetId(asset.id);
                              }}
                            >
                              {asset.name}
                            </span>
                          )}
                        </h3>
                        {asset.fields.map(field => (
                          <div key={field.id} className="mb-2 ml-4 group/field">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <span className="text-sm text-gray-600">
                                  {editingFieldId === field.id ? (
                                    <input
                                      type="text"
                                      value={fieldName}
                                      onChange={(e) => setFieldName(e.target.value)}
                                      onBlur={() => {
                                        updateFieldName(asset.id, field.id, fieldName);
                                        setEditingFieldId(null);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          updateFieldName(asset.id, field.id, fieldName);
                                          setEditingFieldId(null);
                                        } else if (e.key === 'Escape') {
                                          setFieldName(field.customName || field.name);
                                          setEditingFieldId(null);
                                        }
                                      }}
                                      className="px-1 py-0.5 border border-purple-500 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                                      autoFocus
                                    />
                                  ) : (
                                    <span 
                                      className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                                      onClick={() => {
                                        setFieldName(field.customName || field.name);
                                        setEditingFieldId(field.id);
                                      }}
                                    >
                                      {field.customName || field.name}:
                                    </span>
                                  )}
                                </span>{' '}
                                <EditableField
                                  fieldId={field.id}
                                  languageCode={currentLanguage}
                                  className="text-sm"
                                />
                              </div>
                              <button
                                onClick={() => removeField(asset.id, field.id)}
                                className="opacity-0 group-hover/field:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700"
                                title="Delete field"
                              >
                                <Trash2Icon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const fieldName = prompt('Enter field name:');
                            if (fieldName) addCustomField(asset.id, fieldName);
                          }}
                          className="text-xs text-purple-600 hover:text-purple-700 ml-4"
                        >
                          <PlusIcon className="w-3 h-3 inline mr-1" />
                          Add field
                        </button>
                      </div>
                      {/* Hover actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => duplicateAsset(crm.id, asset.id)}
                          className="p-1 text-gray-600 hover:text-gray-800"
                          title="Duplicate"
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeAsset(asset.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addAsset(crm.id, 'module')}
                  className="text-sm text-purple-600 hover:text-purple-700 ml-4"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Add Module
                </button>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}