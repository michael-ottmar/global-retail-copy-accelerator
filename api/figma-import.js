/**
 * API endpoint to receive data from Figma plugin
 * This endpoint accepts frame data exported from the Copy Accelerator Bridge plugin
 */

export default function handler(req, res) {
  // Enable CORS for plugin communication
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const data = req.body;
    
    // Validate incoming data
    if (!data || !data.frames) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    // Log received data (in production, this would save to database or state)
    console.log('Received Figma export:', {
      timestamp: data.timestamp,
      fileName: data.fileName,
      frameCount: data.frames.length,
      hasImages: !!data.images && Object.keys(data.images).length > 0
    });
    
    // Process frames
    const processedFrames = data.frames.map(frame => ({
      id: frame.id,
      name: frame.name,
      type: frame.type,
      dimensions: {
        width: frame.width,
        height: frame.height
      },
      textNodes: extractTextNodes(frame),
      imageCount: countImages(frame, data.images)
    }));
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Frames imported successfully',
      processed: {
        frameCount: processedFrames.length,
        textNodeCount: processedFrames.reduce((sum, f) => sum + f.textNodes.length, 0),
        imageCount: Object.keys(data.images || {}).length
      },
      frames: processedFrames
    });
    
  } catch (error) {
    console.error('Error processing Figma import:', error);
    res.status(500).json({ 
      error: 'Failed to process import',
      message: error.message 
    });
  }
}

// Helper function to extract text nodes from frame
function extractTextNodes(node, nodes = []) {
  if (node.type === 'TEXT' && node.characters) {
    nodes.push({
      id: node.id,
      name: node.name,
      text: node.characters,
      style: node.style
    });
  }
  
  if (node.children) {
    node.children.forEach(child => extractTextNodes(child, nodes));
  }
  
  return nodes;
}

// Helper function to count images in frame
function countImages(frame, imageMap) {
  if (!imageMap) return 0;
  
  let count = 0;
  function traverse(node) {
    if (imageMap[node.id]) {
      count++;
    }
    if (node.children) {
      node.children.forEach(child => traverse(child));
    }
  }
  
  traverse(frame);
  return count;
}