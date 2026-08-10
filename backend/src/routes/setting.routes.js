const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission, enforceTenantScope } = require('../middleware/rbac.middleware');

router.use(authenticate);
router.use(enforceTenantScope());

router.get('/', requirePermission('settings.manage'), settingController.getSettings);
router.post('/update', requirePermission('settings.manage'), settingController.updateSetting);

module.exports = router;
