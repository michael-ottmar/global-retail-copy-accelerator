// Secure Figma API proxy - DO NOT use tokens in URL!
export default async function handler(req, res) {
  // Only allow POST requests with body
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileKey, nodeIds } = req.body;
  
  // Get token from Authorization header (never from URL!)
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    // Check for environment variable as fallback
    const envToken = process.env.FIGMA_ACCESS_TOKEN;
    if (!envToken) {
      return res.status(401).json({ error: 'No authorization provided' });
    }
    // Use env token if no header token
    token = envToken;
  }
  
  // Option 3: Encrypt tokens per session (Advanced)
  // const encryptedToken = req.body.encryptedToken;
  // const token = decrypt(encryptedToken, req.session.key);
  
  if (!fileKey) {
    return res.status(400).json({ error: 'Missing fileKey' });
  }
  
  // Add rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests' });
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
      // Don't expose token errors to client
      console.error('Figma API error:', figmaResponse.statusText);
      throw new Error('Failed to fetch Figma data');
    }
    
    const data = await figmaResponse.json();
    
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json(data);
  } catch (error) {
    // Log server-side only
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}

// Simple in-memory rate limiting
const requestCounts = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 30;
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip).filter(time => now - time < windowMs);
  requests.push(now);
  requestCounts.set(ip, requests);
  
  return requests.length > maxRequests;
}