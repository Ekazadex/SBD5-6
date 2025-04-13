const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Initialize Redis client if environment is production
let redisClient;
if (process.env.NODE_ENV === 'production') {
  redisClient = new Redis(process.env.REDIS_URL);
}

// Create different rate limiters for different endpoints
const createRateLimiter = (windowMs, max, message) => {
  const options = {
    windowMs, // Time window in milliseconds
    max, // Max number of requests in time window
    standardHeaders: true, // Send standard rate limit headers
    legacyHeaders: false, // Don't use deprecated headers
    message: { error: message },
    skipSuccessfulRequests: false, // Count all requests
    keyGenerator: (req) => {
      // Use IP address by default, but could use auth token for authenticated routes
      return req.ip;
    }
  };

  // Use Redis store in production for distributed rate limiting
  if (process.env.NODE_ENV === 'production' && redisClient) {
    options.store = new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    });
  }

  return rateLimit(options);
};

// General API limiter
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per windowMs
  'Terlalu banyak permintaan, silakan coba lagi dalam 15 menit.'
);

// Stricter limiter for authentication endpoints
const authLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // 5 requests per hour
  'Terlalu banyak permintaan login, silakan coba lagi dalam 1 jam.'
);

// Public API limiter for endpoints that don't require authentication
const publicApiLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  30, // 30 requests per 5 minutes
  'Terlalu banyak permintaan, silakan coba lagi dalam 5 menit.'
);

module.exports = {
  apiLimiter,
  authLimiter,
  publicApiLimiter
};