# Local MCP Figma Testing Instructions

Since you have MCP Figma server running locally, here's how to test it:

## Step 1: Test MCP Connection in Claude Desktop

In your Claude Desktop app (where MCP is configured), try this:

```javascript
// Test with a public Figma file or your test file
const FILE_KEY = "YOUR_FILE_KEY_HERE";

// If your MCP server is running, this should work:
const result = await mcp__figma__getFile(FILE_KEY);

// Or try these variations based on your MCP config:
// const result = await mcp.figma.getFile(FILE_KEY);
// const result = await figma.getFile(FILE_KEY);

console.log(JSON.stringify(result, null, 2));
```

## Step 2: Get Your Test File Ready

For testing, you'll need a Figma file with this structure:
```
Document
├── PDP_Gallery_Image_1 (Frame)
│   ├── headline (Text)
│   ├── body (Text)
│   └── legal (Text)
├── Banner_Hero_1 (Frame)
│   ├── headline (Text)
│   └── cta (Text)
```

## Step 3: Export the Data

Once you get the data from MCP, save it to a file:

```javascript
// After getting the result from MCP
const fs = require('fs');
fs.writeFileSync('figma-export.json', JSON.stringify(result, null, 2));
```

Or just copy the output manually.

## Step 4: Import to Web App

1. Go to your app: https://your-app.vercel.app
2. Navigate to Design tab
3. Click "Import" button
4. Paste the JSON data
5. Click Import

## What MCP Commands to Try

Based on typical MCP Figma implementations, try these:

```javascript
// Get entire file
mcp__figma__getFile("FILE_KEY")

// Get specific nodes
mcp__figma__getFileNodes("FILE_KEY", ["NODE_ID"])

// Get images
mcp__figma__getImage("FILE_KEY", "NODE_ID")

// List files (if supported)
mcp__figma__listFiles()
```

## Troubleshooting MCP Connection

If MCP commands aren't working:

1. **Check MCP server is running:**
   ```bash
   ps aux | grep mcp
   ```

2. **Check MCP config file:**
   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. **Restart Claude Desktop** after config changes

4. **Check MCP server logs:**
   Look for errors in the terminal where MCP server is running

## Alternative: Direct Terminal Test

You can also test MCP directly from terminal if you have the MCP CLI:

```bash
# If you have mcp CLI installed
mcp call figma.getFile --file-key YOUR_FILE_KEY

# Or with npx
npx @modelcontextprotocol/cli call figma.getFile --file-key YOUR_FILE_KEY
```

## Expected Output Structure

The MCP should return something like:
```json
{
  "document": {
    "id": "0:0",
    "name": "Document",
    "type": "FRAME",
    "children": [
      {
        "id": "1:1",
        "name": "PDP_Gallery_Image_1",
        "type": "FRAME",
        "absoluteBoundingBox": {...},
        "children": [...]
      }
    ]
  },
  "components": {},
  "name": "Your File Name",
  "lastModified": "2024-01-01T00:00:00Z",
  "version": "..."
}
```

## Share Your Results

Once you get MCP working, share:
1. The command that worked
2. Any error messages
3. The structure of the returned data

This will help us refine the import process!