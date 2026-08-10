const express = require('express');
const router = express.Router();
const caseController = require('../controllers/case.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission, enforceTenantScope } = require('../middleware/rbac.middleware');
const { handleIdempotency } = require('../middleware/idempotency.middleware');

router.use(authenticate);
router.use(enforceTenantScope());

router.get('/', requirePermission('cases.read'), caseController.getCases);
router.get('/:id', requirePermission('cases.read'), caseController.getCaseById);
router.post('/', requirePermission('cases.create'), handleIdempotency, caseController.createCase);
router.put('/:id', requirePermission('cases.update'), caseController.updateCase);
router.post('/:id/decision', requirePermission('cases.approve'), handleIdempotency, caseController.submitDecision);

module.exports = router;
