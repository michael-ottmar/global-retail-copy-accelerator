/**
 * Copy Accelerator Bridge - Figma Plugin
 * Main plugin code that runs in Figma's sandbox
 */

// Plugin UI dimensions
const UI_WIDTH = 440;
const UI_HEIGHT = 640;

// Show plugin UI
figma.showUI(__html__, { 
  width: UI_WIDTH, 
  height: UI_HEIGHT,
  title: 'Copy Accelerator Bridge'
});

// Store for processed data
let processedFrames = [];
let imageExports = new Map();

// Initialize plugin
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'scan-frames':
      await scanFrames();
      break;
      
    case 'export-selected':
      await exportSelected(msg.settings);
      break;
      
    case 'export-all':
      await exportAll(msg.settings);
      break;
      
    case 'send-to-app':
      await sendToApp(msg.url, msg.data);
      break;
      
    case 'copy-to-clipboard':
      await copyToClipboard(msg.data);
      break;
      
    case 'get-selection':
      await getSelection();
      break;
      
    case 'close':
      figma.closePlugin();
      break;
  }
};

// Scan document for frames matching our patterns
async function scanFrames() {
  const frames = [];
  const patterns = ['pdp', 'banner', 'gallery', 'module', 'crm', 'email'];
  
  // Recursive function to find matching frames
  function findFrames(node) {
    if (node.type === 'FRAME' || node.type === 'COMPONENT') {
      const nameLower = node.name.toLowerCase();
      
      // Check if frame name matches any pattern
      if (patterns.some(pattern => nameLower.includes(pattern))) {
        frames.push(extractFrameData(node));
      }
    }
    
    // Recurse through children
    if ('children' in node) {
      node.children.forEach(child => findFrames(child));
    }
  }
  
  // Start scanning from root
  figma.currentPage.children.forEach(node => findFrames(node));
  
  processedFrames = frames;
  
  // Send results to UI
  figma.ui.postMessage({
    type: 'frames-found',
    frames: frames.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      width: f.width,
      height: f.height,
      childrenCount: f.children.length
    }))
  });
}

// Extract comprehensive frame data
function extractFrameData(node) {
  const data = {
    id: node.id,
    name: node.name,
    type: node.type,
    width: node.width,
    height: node.height,
    x: node.x,
    y: node.y,
    children: [],
    opacity: node.opacity
  };
  
  // Extract layout properties (Auto Layout)
  if (node.layoutMode !== 'NONE') {
    data.layoutMode = node.layoutMode;
    data.primaryAxisAlignItems = node.primaryAxisAlignItems;
    data.counterAxisAlignItems = node.counterAxisAlignItems;
    data.paddingLeft = node.paddingLeft;
    data.paddingRight = node.paddingRight;
    data.paddingTop = node.paddingTop;
    data.paddingBottom = node.paddingBottom;
    data.itemSpacing = node.itemSpacing;
  }
  
  // Extract visual properties
  if (node.fills && node.fills !== figma.mixed) {
    data.fills = node.fills;
  }
  
  if (node.strokes) {
    data.strokes = node.strokes;
  }
  
  if (node.effects) {
    data.effects = node.effects;
  }
  
  if (node.cornerRadius && node.cornerRadius !== figma.mixed) {
    data.cornerRadius = node.cornerRadius;
  }
  
  // Extract constraints
  data.constraints = {
    horizontal: node.constraints.horizontal,
    vertical: node.constraints.vertical
  };
  
  // Process children
  if ('children' in node) {
    data.children = node.children.map(child => extractNodeData(child));
  }
  
  return data;
}

// Extract node data (for children)
function extractNodeData(node) {
  const baseData = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible
  };
  
  // Handle different node types
  if (node.type === 'TEXT') {
    const textNode = node;
    baseData.characters = textNode.characters;
    baseData.x = textNode.x;
    baseData.y = textNode.y;
    baseData.width = textNode.width;
    baseData.height = textNode.height;
    
    // Extract text styles
    if (textNode.fontSize !== figma.mixed) {
      baseData.style = {
        fontSize: textNode.fontSize,
        fontName: textNode.fontName !== figma.mixed ? textNode.fontName : null,
        textAlignHorizontal: textNode.textAlignHorizontal,
        textAlignVertical: textNode.textAlignVertical,
        letterSpacing: textNode.letterSpacing !== figma.mixed ? textNode.letterSpacing : null,
        lineHeight: textNode.lineHeight !== figma.mixed ? textNode.lineHeight : null,
        fills: textNode.fills !== figma.mixed ? textNode.fills : null
      };
    }
  } else if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
    const shapeNode = node;
    baseData.x = shapeNode.x;
    baseData.y = shapeNode.y;
    baseData.width = shapeNode.width;
    baseData.height = shapeNode.height;
    baseData.fills = shapeNode.fills !== figma.mixed ? shapeNode.fills : null;
    baseData.strokes = shapeNode.strokes;
    baseData.cornerRadius = 'cornerRadius' in shapeNode && shapeNode.cornerRadius !== figma.mixed 
      ? shapeNode.cornerRadius : null;
  } else if (node.type === 'FRAME' || node.type === 'GROUP') {
    const containerNode = node;
    baseData.x = containerNode.x;
    baseData.y = containerNode.y;
    baseData.width = containerNode.width;
    baseData.height = containerNode.height;
    
    if (node.type === 'FRAME') {
      const frameNode = node;
      baseData.fills = frameNode.fills !== figma.mixed ? frameNode.fills : null;
      baseData.layoutMode = frameNode.layoutMode;
      baseData.itemSpacing = frameNode.itemSpacing;
      baseData.paddingLeft = frameNode.paddingLeft;
      baseData.paddingRight = frameNode.paddingRight;
      baseData.paddingTop = frameNode.paddingTop;
      baseData.paddingBottom = frameNode.paddingBottom;
    }
    
    // Recursively process children
    if ('children' in containerNode) {
      baseData.children = containerNode.children.map(child => extractNodeData(child));
    }
  }
  
  return baseData;
}

// Export selected frames
async function exportSelected(settings) {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Please select at least one frame to export'
    });
    return;
  }
  
  const frames = [];
  
  for (const node of selection) {
    if (node.type === 'FRAME' || node.type === 'COMPONENT') {
      const frameData = extractFrameData(node);
      frames.push(frameData);
      
      // Export images if requested
      if (settings.includeImages) {
        await exportImages(node, settings);
      }
    }
  }
  
  // Prepare export data
  const exportData = {
    timestamp: Date.now(),
    fileName: figma.root.name,
    frames,
    images: settings.includeImages ? Object.fromEntries(imageExports) : {}
  };
  
  figma.ui.postMessage({
    type: 'export-ready',
    data: exportData
  });
}

// Export all matching frames
async function exportAll(settings) {
  if (processedFrames.length === 0) {
    await scanFrames();
  }
  
  const exportData = {
    timestamp: Date.now(),
    fileName: figma.root.name,
    frames: processedFrames,
    images: {}
  };
  
  // Export images for all frames if requested
  if (settings.includeImages) {
    for (const frameData of processedFrames) {
      const node = figma.getNodeById(frameData.id);
      if (node) {
        await exportImages(node, settings);
      }
    }
    exportData.images = Object.fromEntries(imageExports);
  }
  
  figma.ui.postMessage({
    type: 'export-ready',
    data: exportData
  });
}

// Export images from a frame
async function exportImages(node, settings) {
  try {
    // Export the frame itself as an image
    const bytes = await node.exportAsync({
      format: settings.imageFormat,
      scale: settings.imageScale
    });
    
    // Convert to base64
    const base64 = figma.base64Encode(bytes);
    imageExports.set(node.id, `data:image/${settings.imageFormat.toLowerCase()};base64,${base64}`);
    
    // Also export individual image fills if present
    async function findAndExportImages(searchNode) {
      if ('fills' in searchNode && searchNode.fills !== figma.mixed) {
        const fills = searchNode.fills;
        for (const fill of fills) {
          if (fill.type === 'IMAGE') {
            // Export nodes with image fills
            const imageBytes = await searchNode.exportAsync({
              format: settings.imageFormat,
              scale: settings.imageScale
            });
            const imageBase64 = figma.base64Encode(imageBytes);
            imageExports.set(searchNode.id, `data:image/${settings.imageFormat.toLowerCase()};base64,${imageBase64}`);
          }
        }
      }
      
      // Recurse through children
      if ('children' in searchNode) {
        for (const child of searchNode.children) {
          await findAndExportImages(child);
        }
      }
    }
    
    await findAndExportImages(node);
    
  } catch (error) {
    console.error('Error exporting images:', error);
    figma.ui.postMessage({
      type: 'error',
      message: `Failed to export images: ${error}`
    });
  }
}

// Get current selection info
async function getSelection() {
  const selection = figma.currentPage.selection;
  
  figma.ui.postMessage({
    type: 'selection-info',
    count: selection.length,
    nodes: selection.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type
    }))
  });
}

// Send data to web app
async function sendToApp(url, data) {
  // This will be handled by the UI since plugins can't make direct network requests
  figma.ui.postMessage({
    type: 'send-to-app',
    url,
    data
  });
}

// Copy data to clipboard
async function copyToClipboard(data) {
  // This will be handled by the UI
  figma.ui.postMessage({
    type: 'copy-to-clipboard',
    data: JSON.stringify(data, null, 2)
  });
}

// Listen for selection changes
figma.on('selectionchange', () => {
  getSelection();
});

// Initial selection check
getSelection();