const db = require('../config/db');

class AuditService {
  async getAuditLogs(organizationId, filters = {}) {
    const page = Math.max(1, parseInt(filters.page || 1, 10));
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit || 20, 10)));
    const offset = (page - 1) * limit;

    const conditions = ['a.organization_id = ?'];
    const params = [organizationId];

    if (filters.action) {
      conditions.push('a.action = ?');
      params.push(filters.action);
    }
    if (filters.actor_id) {
      conditions.push('a.actor_id = ?');
      params.push(filters.actor_id);
    }
    if (filters.entity_type) {
      conditions.push('a.entity_type = ?');
      params.push(filters.entity_type);
    }

    const whereClause = conditions.join(' AND ');

    const countRes = await db.query(`SELECT COUNT(*) as total FROM audit_logs a WHERE ${whereClause}`, params);
    const total = countRes[0] ? parseInt(countRes[0].total, 10) : 0;

    const sql = `
      SELECT a.* FROM audit_logs a
      WHERE ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const items = await db.query(sql, [...params, limit, offset]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }
}

module.exports = new AuditService();
