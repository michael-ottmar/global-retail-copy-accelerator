import { useState } from 'react';
import { Upload, Download, Copy, Check } from 'lucide-react';

interface ImportExportProps {
  onImport: (data: any) => void;
  currentData?: any;
}

export function ImportExport({ onImport, currentData }: ImportExportProps) {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleImport = () => {
    try {
      const data = JSON.parse(importText);
      onImport(data);
      setShowImport(false);
      setImportText('');
    } catch (error) {
      alert('Invalid JSON data');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(currentData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `figma-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const dataStr = JSON.stringify(currentData, null, 2);
    await navigator.clipboard.writeText(dataStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowImport(!showImport)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        title="Import JSON data"
      >
        <Upload className="w-4 h-4" />
        Import
      </button>

      {currentData && (
        <>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Export as JSON file"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </>
      )}

      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Import Figma Data</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Paste JSON data exported from Figma or MCP:
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"document": {...}, "components": {...}}'
                className="w-full h-64 px-3 py-2 border rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>To get Figma data:</strong>
              </p>
              <ol className="text-sm text-blue-700 mt-2 list-decimal list-inside">
                <li>Use MCP locally: <code className="bg-blue-100 px-1">mcp__figma__getFile</code></li>
                <li>Or in Figma: Dev Mode → Copy as JSON</li>
                <li>Or use our Figma plugin (coming soon)</li>
              </ol>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImport(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importText}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}