import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PermissionGuard from './PermissionGuard';

// Layouts
import MainLayout from '../layouts/MainLayout';

// Pages
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import DocumentIntakePage from '../pages/DocumentIntakePage';
import CaseReviewWorkspacePage from '../pages/CaseReviewWorkspacePage';
import ExceptionQueuePage from '../pages/ExceptionQueuePage';
import CaseSearchPage from '../pages/CaseSearchPage';
import SupervisorDashboardPage from '../pages/SupervisorDashboardPage';
import AIDocumentExtractionPage from '../pages/AIDocumentExtractionPage';
import ValidationChecksPage from '../pages/ValidationChecksPage';
import GroundedSummaryPage from '../pages/GroundedSummaryPage';
import ReportsAnalyticsPage from '../pages/ReportsAnalyticsPage';
import NotificationsPage from '../pages/NotificationsPage';
import UserManagementPage from '../pages/UserManagementPage';
import RolePermissionPage from '../pages/RolePermissionPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import SystemSettingsPage from '../pages/SystemSettingsPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import ForbiddenPage from '../pages/ForbiddenPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="intake"
          element={
            <PermissionGuard permission="documents.upload">
              <DocumentIntakePage />
            </PermissionGuard>
          }
        />
        <Route
          path="cases/:id"
          element={
            <PermissionGuard permission="cases.read">
              <CaseReviewWorkspacePage />
            </PermissionGuard>
          }
        />
        <Route
          path="exceptions"
          element={
            <PermissionGuard permission="cases.read">
              <ExceptionQueuePage />
            </PermissionGuard>
          }
        />
        <Route
          path="search"
          element={
            <PermissionGuard permission="cases.read">
              <CaseSearchPage />
            </PermissionGuard>
          }
        />
        <Route
          path="supervisor"
          element={
            <PermissionGuard permission="cases.assign">
              <SupervisorDashboardPage />
            </PermissionGuard>
          }
        />
        <Route
          path="ai-extraction"
          element={
            <PermissionGuard permission="ai.review">
              <AIDocumentExtractionPage />
            </PermissionGuard>
          }
        />
        <Route
          path="validations"
          element={
            <PermissionGuard permission="cases.read">
              <ValidationChecksPage />
            </PermissionGuard>
          }
        />
        <Route
          path="grounded-summary"
          element={
            <PermissionGuard permission="ai.review">
              <GroundedSummaryPage />
            </PermissionGuard>
          }
        />
        <Route
          path="reports"
          element={
            <PermissionGuard permission="reports.export">
              <ReportsAnalyticsPage />
            </PermissionGuard>
          }
        />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route
          path="users"
          element={
            <PermissionGuard permission="users.manage">
              <UserManagementPage />
            </PermissionGuard>
          }
        />
        <Route
          path="roles"
          element={
            <PermissionGuard permission="roles.manage">
              <RolePermissionPage />
            </PermissionGuard>
          }
        />
        <Route
          path="audit"
          element={
            <PermissionGuard permission="audit.read">
              <AuditLogsPage />
            </PermissionGuard>
          }
        />
        <Route
          path="settings"
          element={
            <PermissionGuard permission="settings.manage">
              <SystemSettingsPage />
            </PermissionGuard>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
