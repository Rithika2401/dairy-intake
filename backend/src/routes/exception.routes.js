const express = require('express');
const router = express.Router();
const exceptionController = require('../controllers/exception.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requirePermission, enforceTenantScope } = require('../middleware/rbac.middleware');
const { handleIdempotency } = require('../middleware/idempotency.middleware');

router.use(authenticate);
router.use(enforceTenantScope());

router.get('/', requirePermission('cases.read'), exceptionController.getExceptions);
router.post('/:id/resolve', requirePermission('cases.update'), handleIdempotency, exceptionController.resolveException);

module.exports = router;
