// Simple Figma API proxy to bypass CORS
export default async function handler(req, res) {
  const { fileKey, nodeIds, token } = req.query;
  
  if (!fileKey || !token) {
    return res.status(400).json({ error: 'Missing fileKey or token' });
  }
  
  try {
    const endpoint = nodeIds 
      ? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeIds}`
      : `https://api.figma.com/v1/files/${fileKey}`;
    
    const figmaResponse = await fetch(endpoint, {
      headers: {
        'X-Figma-Token': token,
      },
    });
    
    if (!figmaResponse.ok) {
      throw new Error(`Figma API error: ${figmaResponse.statusText}`);
    }
    
    const data = await figmaResponse.json();
    
    // Handle images - Figma image URLs also need proxying
    if (data.document) {
      await processImages(data.document, token);
    }
    
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Process images in the document tree
async function processImages(node, token) {
  if (node.fills) {
    for (const fill of node.fills) {
      if (fill.type === 'IMAGE' && fill.imageRef) {
        // Figma images need to be fetched separately
        // You can either proxy them or convert to base64
        fill.imageUrl = `https://api.figma.com/v1/images/${fill.imageRef}`;
      }
    }
  }
  
  if (node.children) {
    for (const child of node.children) {
      await processImages(child, token);
    }
  }
}