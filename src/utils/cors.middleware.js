// middleware/cors.middleware.js
const cors = require('cors');

// Get allowed origins from environment variables or use default
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation: Origin not allowed'));
    }
  },
  
  // Only allow specific HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  // Allow only specific headers
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  
  // Allow credentials to be sent with requests (cookies, auth headers)
  credentials: true,
  
  // How long the results of a preflight request can be cached
  maxAge: 86400, // 24 hours
  
  // Success status code for preflight requests
  optionsSuccessStatus: 200,
  
  // Expose these headers to the browser
  exposedHeaders: ['Content-Length', 'X-Rate-Limit']
};

// Export middleware
module.exports = cors(corsOptions);