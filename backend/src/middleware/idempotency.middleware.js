const idempotencyCache = new Map();

/**
 * Idempotency Key Middleware for write operations (POST, PUT)
 */
function handleIdempotency(req, res, next) {
  const key = req.headers['x-idempotency-key'];
  
  if (!key) {
    return next();
  }

  if (idempotencyCache.has(key)) {
    const cachedResponse = idempotencyCache.get(key);
    console.log(`[Idempotency Hit]: Serving cached response for key ${key}`);
    return res.status(cachedResponse.status).json(cachedResponse.body);
  }

  // Intercept res.json to capture response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyCache.set(key, {
        status: res.statusCode,
        body
      });

      // Cleanup cache after 24 hours
      setTimeout(() => idempotencyCache.delete(key), 24 * 60 * 60 * 1000);
    }
    return originalJson(body);
  };

  next();
}

module.exports = { handleIdempotency };
