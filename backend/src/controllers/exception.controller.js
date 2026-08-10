const exceptionService = require('../services/exception.service');

class ExceptionController {
  async getExceptions(req, res, next) {
    try {
      const items = await exceptionService.getExceptions(req.user.organization_id, req.query);
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  async resolveException(req, res, next) {
    try {
      const result = await exceptionService.resolveException(
        req.params.id,
        req.user.organization_id,
        req.user,
        req.body
      );
      res.status(200).json({ success: true, data: result, message: 'Exception resolved.' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExceptionController();
