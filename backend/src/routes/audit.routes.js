const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission, enforceTenantScope } = require('../middleware/rbac.middleware');

router.use(authenticate);
router.use(enforceTenantScope());

router.get('/', requirePermission('audit.read'), auditController.getAuditLogs);

module.exports = router;
