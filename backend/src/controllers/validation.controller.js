const validationEngineService = require('../services/validationEngine.service');

class ValidationController {
  async runValidation(req, res, next) {
    try {
      const result = await validationEngineService.runValidation(req.params.caseId, req.user.organization_id);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Deterministic validation engine execution complete.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ValidationController();
