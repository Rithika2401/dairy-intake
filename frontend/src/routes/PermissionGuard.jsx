import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PermissionGuard = ({ permission, children }) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default PermissionGuard;
