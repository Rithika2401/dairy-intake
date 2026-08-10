const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission, enforceTenantScope } = require('../middleware/rbac.middleware');

router.use(authenticate);
router.use(enforceTenantScope());

router.get('/', requirePermission('users.manage'), userController.getUsers);
router.put('/:id/status', requirePermission('users.manage'), userController.toggleUserStatus);

module.exports = router;
