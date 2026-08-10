const db = require('../config/db');

class HealthController {
  async getHealth(req, res) {
    const isDbConnected = await db.checkConnection();
    const isGeminiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');

    const status = isDbConnected ? 'UP' : 'DEGRADED';

    res.status(isDbConnected ? 200 : 503).json({
      success: isDbConnected,
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: isDbConnected ? 'HEALTHY' : 'UNAVAILABLE',
          engine: 'MySQL'
        },
        ai_provider: {
          status: isGeminiConfigured ? 'HEALTHY' : 'UNCONFIGURED',
          provider: 'Google Gemini'
        },
        storage: {
          status: 'HEALTHY',
          driver: 'LocalDiskUploads'
        }
      }
    });
  }
}

module.exports = new HealthController();
