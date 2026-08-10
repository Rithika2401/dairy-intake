import React, { createContext, useContext, useState } from 'react';
import {
  INITIAL_CASES,
  INITIAL_EXCEPTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_FARMERS,
  INITIAL_COLLECTION_CENTRES
} from '../data/mockData';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [cases, setCases] = useState(INITIAL_CASES);
  const [exceptions, setExceptions] = useState(INITIAL_EXCEPTIONS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [farmers] = useState(INITIAL_FARMERS);
  const [centres] = useState(INITIAL_COLLECTION_CENTRES);

  const [systemSettings, setSystemSettings] = useState({
    aiConfidenceThreshold: 85, // %
    coldChainMaxTempC: 4.0,   // Celsius
    fatMinStandardPct: 3.0,
    fatMaxStandardPct: 5.5,
    autoRouteLowConfidence: true,
    malwareScanningStrict: true,
    duplicateInvoiceCheck: true,
    modelName: "Google Gemini 2.5 Flash",
    modelVersion: "v2.5-flash-2026",
  });

  const [globalSearch, setGlobalSearch] = useState('');

  // Audit Log Recorder Helper
  const logAudit = (actor, role, action, entity, details, outcome = 'Success') => {
    const newEntry = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor,
      role,
      action,
      entity,
      details,
      outcome,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 1),
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Add Notification Helper
  const addNotification = (title, message, type = 'info', link = '#') => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title,
      message,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type,
      read: false,
      link,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Add new Case (from document upload intake)
  const addCase = (newCaseData, actorUser) => {
    const caseId = `CASE-2026-${Math.floor(8800 + Math.random() * 1000)}`;
    const newCase = {
      id: caseId,
      title: newCaseData.title || `${newCaseData.documentType} #${caseId}`,
      documentType: newCaseData.documentType,
      farmerId: newCaseData.farmerId || "F-4091",
      farmerName: newCaseData.farmerName || "Ramesh Patel",
      centre: newCaseData.centre || "Anand Main Chilling Hub",
      uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: newCaseData.status || "Pending Intake",
      riskLevel: newCaseData.riskLevel || "Low",
      confidenceScore: newCaseData.confidenceScore || 0.92,
      assignedReviewer: newCaseData.assignedReviewer || "Dr. Ananya Roy",
      agingHours: 0.1,
      documentUrl: newCaseData.documentUrl || "/samples/collection_slip.png",
      malwareStatus: newCaseData.malwareStatus || "Clean",
      extractedData: newCaseData.extractedData || {},
      boundingRegions: newCaseData.boundingRegions || [],
      validationRules: newCaseData.validationRules || [],
      relatedDocuments: newCaseData.relatedDocuments || [],
      summaryCitation: newCaseData.summaryCitation || "Uploaded document successfully processed.",
    };

    setCases(prev => [newCase, ...prev]);

    logAudit(
      actorUser?.name || 'User',
      actorUser?.role || 'Applicant',
      'DOCUMENT_UPLOAD',
      caseId,
      `Uploaded document ${newCase.title} (${newCase.documentType}). Malware scan: Clean.`
    );

    addNotification(
      'Document Submitted',
      `New ${newCase.documentType} uploaded: ${newCase.title}`,
      'info',
      `/case/${caseId}`
    );

    return newCase;
  };

  // Field Level Override Action
  const overrideField = (caseId, fieldKey, newValue, reason, actorUser) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updatedExtracted = { ...c.extractedData, [fieldKey]: newValue };
        const updatedRegions = c.boundingRegions.map(b => b.field === fieldKey ? { ...b, confidence: 1.0, overridden: true } : b);
        return {
          ...c,
          extractedData: updatedExtracted,
          boundingRegions: updatedRegions,
        };
      }
      return c;
    }));

    logAudit(
      actorUser?.name || 'Reviewer',
      actorUser?.role || 'Reviewer',
      'FIELD_OVERRIDE',
      caseId,
      `Overrode field [${fieldKey}] to "${newValue}". Reason: ${reason}`
    );

    addNotification(
      'Field Overridden',
      `Field ${fieldKey} overrode in ${caseId} by ${actorUser?.name}`,
      'alert',
      `/case/${caseId}`
    );
  };

  // Case Decision Action (Approve / Reject / Request Correction / Escalate)
  const submitCaseDecision = (caseId, decisionType, notes, actorUser) => {
    let newStatus = "Approved";
    if (decisionType === 'reject') newStatus = "Rejected";
    if (decisionType === 'request_correction') newStatus = "Correction Requested";
    if (decisionType === 'escalate') newStatus = "Escalated";

    setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: newStatus, reviewerNotes: notes } : c));

    // Also update any matching exception
    setExceptions(prev => prev.map(ex => ex.caseId === caseId ? { ...ex, status: newStatus === 'Approved' ? 'Resolved' : newStatus } : ex));

    logAudit(
      actorUser?.name || 'User',
      actorUser?.role || 'Reviewer',
      `DECISION_${decisionType.toUpperCase()}`,
      caseId,
      `Submitted case decision "${newStatus}". Notes: ${notes}`
    );

    addNotification(
      `Case ${newStatus}`,
      `Case ${caseId} decision recorded: ${newStatus}`,
      decisionType === 'reject' ? 'alert' : 'info',
      `/case/${caseId}`
    );
  };

  const markNotifRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotif = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateSettings = (newSettings, actorUser) => {
    setSystemSettings(prev => ({ ...prev, ...newSettings }));
    logAudit(
      actorUser?.name || 'Admin',
      actorUser?.role || 'Compliance Admin',
      'SYSTEM_CONFIG_CHANGE',
      'SYSTEM_SETTINGS',
      `Updated system settings: ${JSON.stringify(newSettings)}`
    );
    addNotification(
      'System Settings Updated',
      `Configuration settings modified by ${actorUser?.name}`,
      'system',
      '/audit-settings'
    );
  };

  return (
    <DataContext.Provider value={{
      cases,
      exceptions,
      auditLogs,
      notifications,
      farmers,
      centres,
      systemSettings,
      globalSearch,
      setGlobalSearch,
      addCase,
      overrideField,
      submitCaseDecision,
      logAudit,
      markNotifRead,
      markAllNotifsRead,
      clearNotif,
      updateSettings,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
