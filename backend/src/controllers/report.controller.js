const reportService = require('../services/report.service');

class ReportController {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await reportService.getDashboardStats(req.user.organization_id);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const analytics = await reportService.getAnalytics(req.user.organization_id);
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  }

  async exportReport(req, res, next) {
    try {
      const reportType = req.query.type || 'cases_summary';
      const csvData = await reportService.generateExport(req.user.organization_id, req.user, reportType);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}_${Date.now()}.csv"`);
      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
