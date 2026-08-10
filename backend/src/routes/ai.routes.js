const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission, enforceTenantScope } = require('../middleware/rbac.middleware');
const { handleIdempotency } = require('../middleware/idempotency.middleware');

router.use(authenticate);
router.use(enforceTenantScope());

router.post('/process', requirePermission('ai.run'), handleIdempotency, aiController.processDocument);
router.get('/grounded-summary/:caseId', requirePermission('ai.review'), aiController.getGroundedSummary);
router.post('/override/:caseId', requirePermission('cases.override'), handleIdempotency, aiController.overrideField);

module.exports = router;
