const db = require('../config/db');

class ExceptionService {
  async getExceptions(organizationId, filters = {}) {
    const conditions = ['e.organization_id = ?'];
    const params = [organizationId];

    if (filters.status) {
      conditions.push('e.status = ?');
      params.push(filters.status);
    }
    if (filters.severity) {
      conditions.push('e.severity = ?');
      params.push(filters.severity);
    }
    if (filters.exception_type) {
      conditions.push('e.exception_type = ?');
      params.push(filters.exception_type);
    }

    const whereClause = conditions.join(' AND ');
    return await db.query(
      `SELECT e.*, c.case_number, c.title as case_title, d.original_filename
       FROM exceptions e
       JOIN cases c ON e.case_id = c.id
       LEFT JOIN documents d ON e.document_id = d.id
       WHERE ${whereClause}
       ORDER BY e.created_at DESC`,
      params
    );
  }

  async resolveException(exceptionId, organizationId, user, resolutionData) {
    const { resolution_reason, action = 'RESOLVED' } = resolutionData;

    if (!resolution_reason) {
      const err = new Error('Mandatory resolution_reason is required to resolve exception.');
      err.statusCode = 422;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    return await db.transaction(async (conn) => {
      const [rows] = await conn.query(
        'SELECT * FROM exceptions WHERE id = ? AND organization_id = ? FOR UPDATE',
        [exceptionId, organizationId]
      );

      if (!rows || rows.length === 0) {
        const err = new Error('Exception record not found.');
        err.statusCode = 404;
        throw err;
      }

      const exc = rows[0];

      await conn.query(
        `UPDATE exceptions 
         SET status = ?, resolved_by = ?, resolution_reason = ?, resolved_at = NOW() 
         WHERE id = ?`,
        [action, user.id, resolution_reason, exceptionId]
      );

      // Audit Log
      await conn.query(
        `INSERT INTO audit_logs (id, organization_id, actor_id, actor_email, actor_role, action, entity_type, entity_id, reason, outcome)
         VALUES (UUID(), ?, ?, ?, ?, 'EXCEPTION_RESOLVED', 'EXCEPTION', ?, ?, 'SUCCESS')`,
        [organizationId, user.id, user.email, user.roles[0] || 'Reviewer', exceptionId, resolution_reason]
      );

      return { exception_id: exceptionId, status: action, resolved_by: user.id };
    });
  }
}

module.exports = new ExceptionService();
