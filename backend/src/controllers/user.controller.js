const db = require('../config/db');

class UserController {
  async getUsers(req, res, next) {
    try {
      const users = await db.query(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.status, u.created_at,
                (SELECT GROUP_CONCAT(r.name SEPARATOR ', ') FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = u.id) as roles_list
         FROM users u
         WHERE u.organization_id = ?
         ORDER BY u.created_at DESC`,
        [req.user.organization_id]
      );
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const { status } = req.body;
      const userId = req.params.id;

      await db.query('UPDATE users SET status = ? WHERE id = ? AND organization_id = ?', [status, userId, req.user.organization_id]);
      
      res.status(200).json({ success: true, message: `User status updated to ${status}.` });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
