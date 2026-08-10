/**
 * Server-side RBAC Permission Middleware Generator
 * @param {...string} requiredPermissions One or more permission codes (e.g. 'cases.read', 'cases.approve')
 */
function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = requiredPermissions.every(perm => userPermissions.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required permission: ${requiredPermissions.join(', ')}`
        }
      });
    }

    next();
  };
}

/**
 * Server-side Multi-Tenant Organization Scope Verification Middleware
 * Enforces server-side IDOR/BOLA protection
 */
function enforceTenantScope(targetOrgIdField = 'organization_id') {
  return (req, res, next) => {
    if (!req.user || !req.user.organization_id) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Organization context missing.' }
      });
    }

    // Check if body or query or param contains organization_id and verify match
    const requestOrgId = req.params[targetOrgIdField] || req.query[targetOrgIdField] || req.body[targetOrgIdField];
    if (requestOrgId && requestOrgId !== req.user.organization_id) {
      console.warn(`[IDOR/BOLA Security Alert]: User ${req.user.id} (Org: ${req.user.organization_id}) attempted to access resource in Org ${requestOrgId}`);
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_TENANT_ACCESS',
          message: 'Access denied: You cannot access resources outside your organization.'
        }
      });
    }

    next();
  };
}

module.exports = {
  requirePermission,
  enforceTenantScope
};
