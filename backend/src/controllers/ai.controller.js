const aiPipelineService = require('../services/aiPipeline.service');

class AIController {
  async processDocument(req, res, next) {
    try {
      const { case_id, document_id } = req.body;
      if (!case_id || !document_id) {
        return res.status(422).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'case_id and document_id are required.' }
        });
      }

      const result = await aiPipelineService.processCaseDocument(case_id, document_id, req.user.organization_id);
      res.status(200).json({
        success: true,
        data: result,
        message: 'AI document extraction pipeline completed.'
      });
    } catch (error) {
      next(error);
    }
  }

  async getGroundedSummary(req, res, next) {
    try {
      const summary = await aiPipelineService.generateGroundedSummary(req.params.caseId, req.user.organization_id);
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  async overrideField(req, res, next) {
    try {
      const result = await aiPipelineService.recordOverride(
        req.params.caseId,
        req.user.organization_id,
        req.user,
        req.body
      );
      res.status(200).json({
        success: true,
        data: result,
        message: 'AI field override recorded and audited.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AIController();
