const express = require('express');
const multer = require('multer');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission, enforceTenantScope } = require('../middleware/rbac.middleware');
const { handleIdempotency } = require('../middleware/idempotency.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '20971520', 10) }
});

router.use(authenticate);
router.use(enforceTenantScope());

router.post('/upload', requirePermission('documents.upload'), upload.single('file'), handleIdempotency, documentController.upload);
router.get('/case/:caseId', requirePermission('documents.read'), documentController.getCaseDocuments);
router.get('/download', requirePermission('documents.read'), documentController.download);

module.exports = router;
