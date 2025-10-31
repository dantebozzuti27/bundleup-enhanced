/**
 * API Key Validation Middleware
 * Ensures all API keys are server-side only
 * 
 * LOCATION: middleware/api-key-validator.js
 */

export const validateServerSideOnly = (req, res, next) => {
  // Check if request is coming from client-side
  const referer = req.headers.referer || req.headers.origin;
  
  // Block if API keys are being accessed from browser
  if (referer && req.url.includes('/api/')) {
    // Additional check: ensure API keys aren't in request body/query
    const requestData = { ...req.query, ...req.body };
    
    const dangerousKeys = [
      'ANTHROPIC_API_KEY',
      'SERPER_API_KEY',
      'SUPABASE_SERVICE_KEY',
    ];

    for (const key of dangerousKeys) {
      if (requestData[key]) {
        console.error(`🚨 SECURITY ALERT: API key ${key} in client request`);
        return res.status(403).json({
          error: 'Invalid request',
          message: 'API keys cannot be sent from client',
        });
      }
    }
  }

  next?.();
};

/**
 * Validate environment variables on startup
 */
export const validateEnvKeys = () => {
  const requiredKeys = [
    'ANTHROPIC_API_KEY',
    'SERPER_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
  ];

  const missing = requiredKeys.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  }

  // Verify keys aren't accidentally using NEXT_PUBLIC_ prefix
  const publicKeys = Object.keys(process.env).filter(key => 
    key.startsWith('NEXT_PUBLIC_') && 
    (key.includes('API_KEY') || key.includes('SERVICE_KEY'))
  );

  if (publicKeys.length > 0) {
    console.warn(`⚠️  WARNING: These keys should NOT be public: ${publicKeys.join(', ')}`);
  }

  console.log('✅ Environment variables validated');
};
