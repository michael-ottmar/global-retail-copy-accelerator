// Secure token management - memory only, never persisted
class SecureTokenManager {
  private token: string | null = null;
  private allowedFiles: Set<string> = new Set();
  private sessionId: string;
  
  constructor() {
    // Generate unique session ID (dies on refresh)
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  setToken(token: string, allowedFileKeys?: string[]) {
    // Store in memory only
    this.token = token;
    
    // Optionally restrict to specific files
    if (allowedFileKeys) {
      this.allowedFiles = new Set(allowedFileKeys);
    }
    
    // Set a timeout to auto-clear token after 30 minutes
    setTimeout(() => {
      this.clearToken();
      console.log('Token auto-cleared for security');
    }, 30 * 60 * 1000);
  }
  
  getToken(): string | null {
    return this.token;
  }
  
  isFileAllowed(fileKey: string): boolean {
    // If no whitelist, allow all (user's responsibility)
    if (this.allowedFiles.size === 0) return true;
    return this.allowedFiles.has(fileKey);
  }
  
  clearToken() {
    this.token = null;
    this.allowedFiles.clear();
  }
  
  hasToken(): boolean {
    return this.token !== null;
  }
  
  // Create secure headers for API calls
  createSecureHeaders(fileKey: string): HeadersInit | null {
    if (!this.token) return null;
    
    if (!this.isFileAllowed(fileKey)) {
      console.error(`File ${fileKey} not in allowed list`);
      return null;
    }
    
    return {
      'Content-Type': 'application/json',
      'X-Session-ID': this.sessionId,
      // Send token in header, not URL
      'Authorization': `Bearer ${this.token}`
    };
  }
}

export const tokenManager = new SecureTokenManager();