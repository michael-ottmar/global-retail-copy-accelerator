# Copy Accelerator Bridge - Figma Plugin

A secure Figma plugin that exports frames and their content to the Copy Accelerator web application.

## Features

- 🔍 **Smart Frame Detection**: Automatically finds frames with retail patterns (PDP, Banner, Gallery, etc.)
- 🖼️ **Complete Export**: Exports text, styles, layout properties, and images as base64
- 🔒 **Secure**: Only accesses the current file, no account-wide permissions
- 📤 **Direct Integration**: Sends data directly to your web app or copies to clipboard
- ⚡ **Fast**: Batch export multiple frames at once

## Installation

### Development Mode

1. Open Figma Desktop App
2. Go to Menu → Plugins → Development → Import plugin from manifest
3. Select the `manifest.json` file in this directory
4. The plugin will appear in your plugins menu

### For Testing

1. Create a test Figma file with frames named:
   - `PDP_Gallery_Image_1`
   - `Banner_Hero_Desktop`
   - `CRM_Email_Header`
   - Or any frame containing: pdp, banner, gallery, module, crm, email

2. Run the plugin from Plugins menu

## Usage

### 1. Scan Document
- Open the plugin
- Click "Scan Document" to find all matching frames
- The plugin looks for frames with retail-specific naming patterns

### 2. Select Frames
- Check the frames you want to export
- Use "Select All" for batch export
- Selected frames show in the counter

### 3. Configure Export
- **Target URL**: Your Copy Accelerator instance (default: http://localhost:5173)
- **Include Images**: Export frames as base64 images (for pixel-perfect recreation)
- **Include Styles**: Export text styles and visual properties

### 4. Export
- **Export Selected**: Exports only checked frames
- **Export All**: Exports all discovered frames
- **Copy as JSON**: Copies data to clipboard for manual import

## Frame Naming Convention

The plugin detects frames using these keywords:

| Pattern | Use Case | Example |
|---------|----------|---------|
| `pdp` | Product Detail Pages | `PDP_Gallery_Image_1` |
| `banner` | Banner Ads | `Banner_Hero_Desktop` |
| `gallery` | Image Galleries | `Gallery_Thumbnail_01` |
| `module` | Content Modules | `Module_Features` |
| `crm` | Email Templates | `CRM_Welcome_Email` |
| `email` | Email Components | `Email_Header` |

## Data Structure

The plugin exports:

```javascript
{
  timestamp: 1234567890,
  fileName: "Retail Templates",
  frames: [
    {
      id: "frame-id",
      name: "PDP_Gallery_Image_1",
      type: "FRAME",
      width: 600,
      height: 400,
      children: [...],  // Nested components
      // Layout properties
      layoutMode: "VERTICAL",
      padding: {...},
      // Visual properties
      fills: [...],
      effects: [...],
      // Text content
      characters: "Premium Product Title"
    }
  ],
  images: {
    "node-id": "data:image/png;base64,..."
  }
}
```

## Security

✅ **Safe to use with confidential files** because:
- Plugin only accesses the currently open file
- No account-wide permissions required
- Data is sent directly to your specified endpoint
- No data is stored or transmitted to third parties

## Settings

### Image Export
- **Format**: PNG (quality), JPG (size), SVG (vector)
- **Scale**: 1x-4x for different resolutions

### Frame Detection
- Customize pattern keywords in Settings tab
- Add your own naming conventions

## Troubleshooting

### No frames found
- Check frame naming includes keywords (pdp, banner, etc.)
- Try "Scan Document" again
- Adjust pattern keywords in Settings

### Export fails
- Verify web app URL is correct
- Check web app is running
- Use "Copy as JSON" as fallback

### Images not exporting
- Enable "Include Images" in export settings
- Large files may take time to process
- Check console for errors

## Development

### File Structure
```
figma-plugin/
├── manifest.json    # Plugin configuration
├── code.ts         # Main plugin logic (compile to code.js)
├── ui.html         # Plugin UI
└── README.md       # This file
```

### Building
```bash
# Install TypeScript if needed
npm install -g typescript

# Compile TypeScript
tsc code.ts --target es6

# The plugin is now ready to use
```

## Support

For issues or questions:
- Check the web app logs for import errors
- Ensure CORS is properly configured
- Verify frame naming matches patterns

## Version

1.0.0 - Initial release with full frame export capabilities