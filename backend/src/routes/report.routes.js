const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission, enforceTenantScope } = require('../middleware/rbac.middleware');

router.use(authenticate);
router.use(enforceTenantScope());

router.get('/dashboard-stats', requirePermission('cases.read'), reportController.getDashboardStats);
router.get('/analytics', requirePermission('cases.read'), reportController.getAnalytics);
router.get('/export', requirePermission('reports.export'), reportController.exportReport);

module.exports = router;
