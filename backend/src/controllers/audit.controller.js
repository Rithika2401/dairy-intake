const auditService = require('../services/audit.service');

class AuditController {
  async getAuditLogs(req, res, next) {
    try {
      const result = await auditService.getAuditLogs(req.user.organization_id, req.query);
      res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditController();
