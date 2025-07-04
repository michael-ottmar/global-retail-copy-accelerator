# Global Retail Copy Accelerator

A purpose-built translation management system for retail marketing copy with seamless Figma integration.

## Features

- 📊 **Hierarchical Table View** - Organized by deliverables, assets, and fields
- 👁️ **Preview Mode** - Visual Amazon PDP-style preview
- 🎨 **Figma Export** - JSON format ready for Figma Variables import
- 🌐 **Multi-language Support** - Add unlimited languages with 2-letter codes
- ✏️ **Custom Fields** - Add custom field names to any asset
- 📝 **Sample Content** - Pre-filled product content for testing
- 🔄 **Real-time Editing** - Click any cell to edit inline
- 📌 **Smart UI** - Sticky headers, hover tooltips, status indicators

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (State Management)
- Lucide Icons

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Header.tsx       # Navigation and export controls
│   ├── TableView.tsx    # Main translation table
│   └── PreviewView.tsx  # Visual preview mode
├── store/
│   └── index.ts         # Zustand state management
├── types/
│   └── index.ts         # TypeScript type definitions
├── utils/
│   ├── exportJson.ts    # Figma JSON export logic
│   ├── sampleData.ts    # Project structure generator
│   └── sampleContent.ts # Sample English content
└── App.tsx              # Main app component
```

## Usage

1. **Add Languages**: Click the + button in the table header to add new language columns
2. **Edit Content**: Click any cell to edit translations inline
3. **Add Custom Fields**: Click "Add field" under any asset to create custom fields
4. **Export to Figma**: Click "Export JSON" to download Figma-ready variables
5. **Preview Mode**: Toggle between table and visual preview views

## Data Structure

- **PDP** (Product Detail Page)
  - Product Details
  - Gallery Images (1-8)
  - Modules (1-7 with carousel variants)
- **Banners** (A, B, C variants)
- **CRM** (Customer Relationship Management modules)

## Future Enhancements

- Word document export
- AI-powered translation assistance
- Real-time collaboration
- Supabase backend integration
- Offline desktop app

## License

Private - All rights reserved