const authService = require('../services/auth.service');
const db = require('../config/db');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      // Audit Log for Login Success
      try {
        await db.query(
          `INSERT INTO audit_logs (id, organization_id, actor_id, actor_email, actor_role, action, entity_type, entity_id, ip_address, outcome)
           VALUES (UUID(), ?, ?, ?, ?, 'USER_LOGIN', 'USER', ?, ?, 'SUCCESS')`,
          [result.user.organizationId, result.user.id, result.user.email, result.user.roles[0] || 'User', result.user.id, req.ip || '127.0.0.1']
        );
      } catch (e) {}

      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful.'
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res) {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }

  async getCurrentUser(req, res) {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
