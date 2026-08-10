const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dairy_hub_jwt_key_2026_production_style';

/**
 * Authenticate JWT token and attach user context with permissions & tenant ID
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token missing or invalid format.' }
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: { code: 'TOKEN_EXPIRED', message: 'Session expired. Please log in again.' }
        });
      }
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Malformed or invalid authentication token.' }
      });
    }

    // Attempt to verify user in MySQL database
    let dbUser = null;
    let permissions = [];
    let roles = [];

    try {
      const userRows = await db.query(
        'SELECT id, organization_id, email, first_name, last_name, status FROM users WHERE id = ?',
        [decoded.userId]
      );
      if (userRows && userRows.length > 0) {
        dbUser = userRows[0];

        // Fetch user permissions
        const permRows = await db.query(
          `SELECT DISTINCT p.code 
           FROM permissions p
           JOIN role_permissions rp ON p.id = rp.permission_id
           JOIN user_roles ur ON rp.role_id = ur.role_id
           WHERE ur.user_id = ?`,
          [dbUser.id]
        );
        permissions = permRows.map(r => r.code);

        // Fetch user roles
        const roleRows = await db.query(
          `SELECT r.code, r.name
           FROM roles r
           JOIN user_roles ur ON r.id = ur.role_id
           WHERE ur.user_id = ?`,
          [dbUser.id]
        );
        roles = roleRows.map(r => r.code);
      }
    } catch (err) {
      console.warn(`[Auth Middleware DB fallback]: Database query unavailable, decoding token claims.`);
    }

    // Fallback to token payload if DB query is unreachable or in fast mode
    const userContext = {
      id: dbUser ? dbUser.id : decoded.userId,
      email: dbUser ? dbUser.email : decoded.email,
      organization_id: dbUser ? dbUser.organization_id : decoded.organizationId,
      first_name: dbUser ? dbUser.first_name : decoded.firstName,
      last_name: dbUser ? dbUser.last_name : decoded.lastName,
      status: dbUser ? dbUser.status : 'ACTIVE',
      roles: roles.length > 0 ? roles : (decoded.roles || []),
      permissions: permissions.length > 0 ? permissions : (decoded.permissions || [])
    };

    if (userContext.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_DISABLED', message: 'Account is inactive or locked.' }
      });
    }

    req.user = userContext;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Internal server error during authentication.' }
    });
  }
}

module.exports = { authenticate };
