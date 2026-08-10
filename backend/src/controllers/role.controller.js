const db = require('../config/db');

class RoleController {
  async getRoles(req, res, next) {
    try {
      const roles = await db.query('SELECT * FROM roles ORDER BY name ASC');
      const rolePermissions = await db.query(
        `SELECT rp.role_id, p.code, p.description 
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id`
      );

      const rolesWithPerms = roles.map(r => ({
        ...r,
        permissions: rolePermissions.filter(rp => rp.role_id === r.id).map(rp => rp.code)
      }));

      res.status(200).json({ success: true, data: rolesWithPerms });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoleController();
