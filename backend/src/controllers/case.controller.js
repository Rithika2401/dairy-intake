const caseService = require('../services/case.service');

class CaseController {
  async getCases(req, res, next) {
    try {
      const result = await caseService.getCases(req.user.organization_id, req.query);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getCaseById(req, res, next) {
    try {
      const caseData = await caseService.getCaseById(req.params.id, req.user.organization_id);
      res.status(200).json({
        success: true,
        data: caseData
      });
    } catch (error) {
      next(error);
    }
  }

  async createCase(req, res, next) {
    try {
      const caseData = await caseService.createCase(req.user.organization_id, req.user.id, req.body);
      res.status(201).json({
        success: true,
        data: caseData,
        message: 'Case created successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCase(req, res, next) {
    try {
      const expectedVersion = req.headers['x-case-version'] || req.body.version;
      const updatedCase = await caseService.updateCase(
        req.params.id,
        req.user.organization_id,
        req.user.id,
        req.body,
        expectedVersion
      );
      res.status(200).json({
        success: true,
        data: updatedCase,
        message: 'Case updated successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  async submitDecision(req, res, next) {
    try {
      const result = await caseService.submitDecision(
        req.params.id,
        req.user.organization_id,
        req.user,
        req.body
      );
      res.status(200).json({
        success: true,
        data: result,
        message: `Decision '${result.action}' successfully recorded.`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CaseController();
