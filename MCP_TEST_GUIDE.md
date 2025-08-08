# MCP Figma Testing Guide

## Quick Test Workflow

### Option 1: Using MCP in Claude Desktop (Easiest)

1. **In Claude Desktop with MCP configured:**
   ```javascript
   // Replace with your test file key
   const fileKey = "YOUR_FILE_KEY";
   
   // Use MCP to fetch the file
   const fileData = await mcp_figma.getFile(fileKey);
   
   // Copy the output
   console.log(JSON.stringify(fileData));
   ```

2. **Copy the JSON output**

3. **In your web app (Vercel or local):**
   - Go to Design tab
   - Click "Import" button
   - Paste the JSON
   - Click Import

### Option 2: Using the Test Script

1. **Set up your Figma token (optional):**
   ```bash
   export FIGMA_ACCESS_TOKEN=your_token_here
   ```

2. **Run the test script:**
   ```bash
   cd global-retail-copy-accelerator
   
   # Edit the script first to add your file key
   nano scripts/test-mcp-figma.js
   # Update: const FILE_KEY = 'YOUR_ACTUAL_FILE_KEY';
   
   # Run it
   node scripts/test-mcp-figma.js
   ```

3. **Import the generated file:**
   ```bash
   # Copy to clipboard (Mac)
   cat figma-export.json | pbcopy
   
   # Or open the file and copy manually
   open figma-export.json
   ```

4. **Paste in web app's Import dialog**

### Option 3: Manual Figma Export

1. **In Figma:**
   - Open your file
   - Switch to Dev Mode
   - Select a frame
   - Right panel → "Copy as JSON"

2. **In web app:**
   - Design tab → Import → Paste

## What to Test

### 1. Frame Detection
After importing, you should see:
- Frames grouped by type (PDP, Banners, etc.)
- Frame names and dimensions
- Nested structure preserved

### 2. Variable Mapping
- Text nodes should appear in the Variable Mapper
- Auto-suggestions based on naming patterns:
  - `PDP_Gallery_Image_1` + `headline` → `pdp/gallery_image_1/headline`
  - `Banner_Hero_1` + `cta` → `banner/banner_hero_1/cta`

### 3. CSS Generation
- Auto-layout → Flexbox conversion
- Padding and spacing preserved
- Constraints mapped correctly

## Test Files Naming Convention

For best results, name your Figma frames like:
```
PDP_Gallery_Image_1
PDP_Gallery_Image_2
Banner_Hero_1
Banner_Promo_1
Module_Feature_1
CRM_Email_Header
```

And text layers within frames:
```
headline
body
legal
feature
cta
```

## Troubleshooting

### "No frames found"
- Check frame naming includes: pdp, banner, gallery, module, or crm
- Frames must be type "FRAME" not "GROUP"

### "Import failed"
- Verify JSON is valid (use jsonlint.com)
- Check console for errors (F12)

### "No MCP connection"
- MCP only works in Claude Desktop app
- Use the web Import feature instead

## Security Notes

- **Never share** the exported JSON if it contains sensitive designs
- **Use test files** for development
- **Clear imports** when done testing (refresh page)

## Quick Test with Mock Data

No Figma file? Just enter "test" as the file key in the Design tab to load mock data with:
- Sample PDP frame with headline, body, feature, legal
- Sample Banner frame with headline and CTA
- Pre-configured for variable mapping tests