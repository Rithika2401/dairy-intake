const express = require('express');
const router = express.Router();
const validationController = require('../controllers/validation.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission, enforceTenantScope } = require('../middleware/rbac.middleware');

router.use(authenticate);
router.use(enforceTenantScope());

router.post('/run/:caseId', requirePermission('cases.update'), validationController.runValidation);

module.exports = router;
