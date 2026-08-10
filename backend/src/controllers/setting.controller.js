const db = require('../config/db');

class SettingController {
  async getSettings(req, res, next) {
    try {
      const settings = await db.query(
        'SELECT * FROM system_settings WHERE organization_id = ?',
        [req.user.organization_id]
      );
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  async updateSetting(req, res, next) {
    try {
      const { setting_key, setting_value } = req.body;
      if (!setting_key || !setting_value) {
        return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'setting_key and setting_value required.' } });
      }

      await db.query(
        `INSERT INTO system_settings (id, organization_id, setting_key, setting_value, updated_by)
         VALUES (UUID(), ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)`,
        [req.user.organization_id, setting_key, JSON.stringify(setting_value), req.user.id]
      );

      // Audit Log
      try {
        await db.query(
          `INSERT INTO audit_logs (id, organization_id, actor_id, actor_email, actor_role, action, entity_type, entity_id, new_value, outcome)
           VALUES (UUID(), ?, ?, ?, ?, 'SYSTEM_SETTING_UPDATED', 'SETTING', ?, ?, 'SUCCESS')`,
          [req.user.organization_id, req.user.id, req.user.email, req.user.roles[0] || 'Admin', setting_key, JSON.stringify(setting_value)]
        );
      } catch (e) {}

      res.status(200).json({ success: true, message: `System setting '${setting_key}' updated.` });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SettingController();
