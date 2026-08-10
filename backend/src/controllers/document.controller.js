const documentService = require('../services/document.service');
const storageDriver = require('../storage/storageDriver');

class DocumentController {
  async upload(req, res, next) {
    try {
      const { case_id, document_type } = req.body;
      const file = req.file;

      if (!case_id) {
        return res.status(422).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'case_id is required.' }
        });
      }

      const result = await documentService.uploadDocument(
        req.user.organization_id,
        req.user.id,
        case_id,
        document_type,
        file
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Document uploaded and registered successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  async getCaseDocuments(req, res, next) {
    try {
      const docs = await documentService.getCaseDocuments(req.params.caseId, req.user.organization_id);
      res.status(200).json({
        success: true,
        data: docs
      });
    } catch (error) {
      next(error);
    }
  }

  async download(req, res, next) {
    try {
      const storageKey = req.query.key;
      if (!storageKey) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Storage key required.' } });
      }

      const filePath = storageDriver.getFilePath(storageKey);
      if (!filePath) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document file not found.' } });
      }

      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();
