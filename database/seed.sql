-- ============================================================================
-- Dairy Intelligent Document Intake & Decision Hub
-- Pure MySQL Seed Data Specification (DML)
-- Pre-hashed password for demo accounts: 'Password123!'
-- Bcrypt Hash: $2a$10$3zR1QoX1V1bK2nZ4.r5YeeZl7lqY7g6L1/9i1A3S6d5F4e3D2c1b0 (Password123!)
-- ============================================================================

USE `dairy_hub`;

-- 1. ORGANIZATIONS
INSERT INTO `organizations` (`id`, `code`, `name`, `license_number`, `address`, `contact_email`, `contact_phone`, `status`) VALUES
('org-001', 'APEX_DAIRY', 'Apex Dairy Farmers Cooperative', 'LIC-2026-APEX-987', '100 Dairy Lane, Sector 4, Anand, Gujarat', 'contact@apexdairy.coop', '+91 2692 245000', 'ACTIVE'),
('org-002', 'VALLEY_FRESH', 'Valley Fresh Processing Ltd', 'LIC-2026-VALLEY-412', '45 Industrial Estate, Pune, Maharashtra', 'info@valleyfresh.com', '+91 20 2712 8000', 'ACTIVE');

-- 2. ROLES
INSERT INTO `roles` (`id`, `name`, `code`, `description`, `is_system`) VALUES
('role-applicant', 'Applicant', 'APPLICANT', 'Can submit document packages and view submission status', TRUE),
('role-reviewer', 'Reviewer', 'REVIEWER', 'Can review extracted fields, resolve low/medium exceptions, and recommend decisions', TRUE),
('role-supervisor', 'Supervisor', 'SUPERVISOR', 'Can reassign cases, approve/reject high-risk cases, and override AI recommendations', TRUE),
('role-admin', 'Compliance Admin', 'COMPLIANCE_ADMIN', 'Full system management, audit log access, system settings, user management, and report export', TRUE);

-- 3. PERMISSIONS
INSERT INTO `permissions` (`id`, `code`, `module`, `description`) VALUES
('perm-001', 'cases.read', 'CASES', 'View cases within organization'),
('perm-002', 'cases.create', 'CASES', 'Create new document intake cases'),
('perm-003', 'cases.update', 'CASES', 'Modify existing case metadata and fields'),
('perm-004', 'cases.assign', 'CASES', 'Assign cases to reviewers'),
('perm-005', 'cases.approve', 'CASES', 'Approve cases and release batches'),
('perm-006', 'cases.reject', 'CASES', 'Reject non-compliant cases'),
('perm-007', 'cases.override', 'CASES', 'Override validation rules or AI confidence warnings'),
('perm-008', 'documents.upload', 'DOCUMENTS', 'Upload new documents to cases'),
('perm-009', 'documents.read', 'DOCUMENTS', 'View uploaded documents and versions'),
('perm-010', 'documents.delete', 'DOCUMENTS', 'Soft-delete or purge document records'),
('perm-011', 'ai.run', 'AI', 'Trigger AI extraction pipeline'),
('perm-012', 'ai.review', 'AI', 'Review AI extracted values and grounded summaries'),
('perm-013', 'reports.export', 'REPORTS', 'Export analytics reports in CSV/PDF format'),
('perm-014', 'users.manage', 'ADMIN', 'Manage user accounts and roles'),
('perm-015', 'roles.manage', 'ADMIN', 'Manage roles and permissions'),
('perm-016', 'settings.manage', 'ADMIN', 'Configure system settings and thresholds'),
('perm-017', 'audit.read', 'AUDIT', 'Inspect system audit trails');

-- 4. ROLE PERMISSIONS MAPPING
-- Applicant
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
('role-applicant', 'perm-001'), ('role-applicant', 'perm-002'), ('role-applicant', 'perm-008'), ('role-applicant', 'perm-009');

-- Reviewer
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
('role-reviewer', 'perm-001'), ('role-reviewer', 'perm-003'), ('role-reviewer', 'perm-005'), ('role-reviewer', 'perm-006'),
('role-reviewer', 'perm-008'), ('role-reviewer', 'perm-009'), ('role-reviewer', 'perm-011'), ('role-reviewer', 'perm-012');

-- Supervisor
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
('role-supervisor', 'perm-001'), ('role-supervisor', 'perm-003'), ('role-supervisor', 'perm-004'), ('role-supervisor', 'perm-005'),
('role-supervisor', 'perm-006'), ('role-supervisor', 'perm-007'), ('role-supervisor', 'perm-008'), ('role-supervisor', 'perm-009'),
('role-supervisor', 'perm-011'), ('role-supervisor', 'perm-012'), ('role-supervisor', 'perm-013');

-- Compliance Admin
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
('role-admin', 'perm-001'), ('role-admin', 'perm-002'), ('role-admin', 'perm-003'), ('role-admin', 'perm-004'),
('role-admin', 'perm-005'), ('role-admin', 'perm-006'), ('role-admin', 'perm-007'), ('role-admin', 'perm-008'),
('role-admin', 'perm-009'), ('role-admin', 'perm-010'), ('role-admin', 'perm-011'), ('role-admin', 'perm-012'),
('role-admin', 'perm-013'), ('role-admin', 'perm-014'), ('role-admin', 'perm-015'), ('role-admin', 'perm-016'), ('role-admin', 'perm-017');

-- 5. USERS (Bcrypt hash corresponds to 'Password123!')
INSERT INTO `users` (`id`, `organization_id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `status`) VALUES
('usr-app-001', 'org-001', 'applicant@dairycoop.com', '$2a$10$3zR1QoX1V1bK2nZ4.r5YeeZl7lqY7g6L1/9i1A3S6d5F4e3D2c1b0', 'Ramesh', 'Patel', '+91 98250 11223', 'ACTIVE'),
('usr-rev-001', 'org-001', 'reviewer@dairycoop.com', '$2a$10$3zR1QoX1V1bK2nZ4.r5YeeZl7lqY7g6L1/9i1A3S6d5F4e3D2c1b0', 'Priya', 'Sharma', '+91 98765 43210', 'ACTIVE'),
('usr-sup-001', 'org-001', 'supervisor@dairycoop.com', '$2a$10$3zR1QoX1V1bK2nZ4.r5YeeZl7lqY7g6L1/9i1A3S6d5F4e3D2c1b0', 'Vikram', 'Singh', '+91 99000 88776', 'ACTIVE'),
('usr-adm-001', 'org-001', 'admin@dairycoop.com', '$2a$10$3zR1QoX1V1bK2nZ4.r5YeeZl7lqY7g6L1/9i1A3S6d5F4e3D2c1b0', 'Ananya', 'Deshmukh', '+91 91111 22222', 'ACTIVE'),
('usr-val-001', 'org-002', 'reviewer@valleyfresh.com', '$2a$10$3zR1QoX1V1bK2nZ4.r5YeeZl7lqY7g6L1/9i1A3S6d5F4e3D2c1b0', 'Suresh', 'Kulkarni', '+91 94444 33333', 'ACTIVE');

-- 6. USER ROLES MAPPING
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
('usr-app-001', 'role-applicant'),
('usr-rev-001', 'role-reviewer'),
('usr-sup-001', 'role-supervisor'),
('usr-adm-001', 'role-admin'),
('usr-val-001', 'role-reviewer');

-- 7. COLLECTION CENTRES
INSERT INTO `collection_centres` (`id`, `organization_id`, `code`, `name`, `location`, `capacity_liters`) VALUES
('cc-001', 'org-001', 'CC-ANAND-01', 'Anand North Milk Hub', 'Anand Rural Bypass', 15000.00),
('cc-002', 'org-001', 'CC-KEDA-02', 'Kheda East Center', 'Kheda Main Market', 10000.00);

-- 8. FARMERS
INSERT INTO `farmers` (`id`, `organization_id`, `collection_centre_id`, `farmer_code`, `name`, `phone`, `bank_account`) VALUES
('farm-001', 'org-001', 'cc-001', 'FARM-1001', 'Mansukhbhai Rabari', '+91 98980 12345', 'SBIN00012345678'),
('farm-002', 'org-001', 'cc-001', 'FARM-1002', 'Dhanesh Solanki', '+91 97234 56789', 'HDFC00087654321');

-- 9. AI MODELS
INSERT INTO `ai_models` (`id`, `model_name`, `version`, `provider`, `description`) VALUES
('aim-001', 'gemini-1.5-flash', 'v1.5', 'GOOGLE_GEMINI', 'Google Gemini Flash multimodal OCR and structured JSON extraction model'),
('aim-002', 'gemini-1.5-pro', 'v1.5', 'GOOGLE_GEMINI', 'Google Gemini Pro high-reasoning document analysis model');

-- 10. SYSTEM SETTINGS
INSERT INTO `system_settings` (`id`, `organization_id`, `setting_key`, `setting_value`, `description`) VALUES
('set-001', 'org-001', 'CONFIDENCE_THRESHOLDS', '{"high": 0.88, "medium": 0.70, "mandatory_review_below": 0.85}', 'AI extraction confidence thresholds for exception routing'),
('set-002', 'org-001', 'VALIDATION_RULES_CONFIG', '{"max_fat_pct": 12.0, "min_fat_pct": 2.5, "max_temp_celsius": 8.0, "duplicate_window_days": 30}', 'Parameters for deterministic dairy quality validation engine');

-- 11. CASES
INSERT INTO `cases` (`id`, `organization_id`, `case_number`, `title`, `case_type`, `status`, `priority`, `risk_level`, `owner_id`, `assigned_reviewer_id`, `due_date`, `version`, `created_by`) VALUES
('case-001', 'org-001', 'CAS-2026-001', 'Morning Milk Intake - Anand North (Lot #891)', 'COLLECTION_INTAKE', 'PENDING_REVIEW', 'HIGH', 'HIGH', 'usr-app-001', 'usr-rev-001', '2026-08-12 18:00:00', 1, 'usr-app-001'),
('case-002', 'org-001', 'CAS-2026-002', 'Quality Audit - Tanker #GJ-07-X-4421', 'QUALITY_AUDIT', 'EXCEPTION', 'CRITICAL', 'HIGH', 'usr-app-001', 'usr-sup-001', '2026-08-11 12:00:00', 1, 'usr-app-001'),
('case-003', 'org-001', 'CAS-2026-003', 'Batch Release #B-2026-884 - Butter Milk', 'BATCH_RELEASE', 'APPROVED', 'MEDIUM', 'LOW', 'usr-app-001', 'usr-rev-001', '2026-08-10 10:00:00', 2, 'usr-app-001');

-- 12. DOCUMENTS
INSERT INTO `documents` (`id`, `organization_id`, `case_id`, `document_type`, `original_filename`, `current_version`, `status`, `created_by`) VALUES
('doc-001', 'org-001', 'case-001', 'COLLECTION_SLIP', 'Collection_Slip_Lot891.pdf', 1, 'PROCESSED', 'usr-app-001'),
('doc-002', 'org-001', 'case-001', 'TEST_REPORT', 'Milk_Test_Report_Sample991.pdf', 1, 'PROCESSED', 'usr-app-001'),
('doc-003', 'org-001', 'case-002', 'TANKER_LOG', 'Tanker_Log_GJ07X4421.pdf', 1, 'PROCESSED', 'usr-app-001');

-- 13. DOCUMENT VERSIONS
INSERT INTO `document_versions` (`id`, `document_id`, `version_number`, `storage_key`, `mime_type`, `file_size_bytes`, `checksum_sha256`, `uploaded_by`) VALUES
('dv-001', 'doc-001', 1, 'uploads/doc-001-v1.pdf', 'application/pdf', 145200, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'usr-app-001'),
('dv-002', 'doc-002', 1, 'uploads/doc-002-v1.pdf', 'application/pdf', 210400, 'a7d5f8641192e21642ae9284102919329048a10294193850193810294918239a', 'usr-app-001'),
('dv-003', 'doc-003', 1, 'uploads/doc-003-v1.pdf', 'application/pdf', 189000, 'b8e6f7532293e31753bf0395213020430159b21305204961204921305029340b', 'usr-app-001');

-- 14. EXTRACTED FIELDS
INSERT INTO `extracted_fields` (`id`, `document_id`, `version_id`, `field_key`, `field_value`, `confidence`, `source_page`, `extraction_method`) VALUES
('ef-001', 'doc-001', 'dv-001', 'collection_center', 'Anand North Milk Hub', 0.9650, 1, 'GEMINI_OCR'),
('ef-002', 'doc-001', 'dv-001', 'farmer_id', 'FARM-1001', 0.9820, 1, 'GEMINI_OCR'),
('ef-003', 'doc-001', 'dv-001', 'milk_quantity', '450.50', 0.9410, 1, 'GEMINI_OCR'),
('ef-004', 'doc-001', 'dv-001', 'fat_percentage', '4.2', 0.9100, 1, 'GEMINI_OCR'),
('ef-005', 'doc-001', 'dv-001', 'snf_percentage', '8.5', 0.8950, 1, 'GEMINI_OCR'),
('ef-006', 'doc-002', 'dv-002', 'sample_id', 'SMP-991', 0.9700, 1, 'GEMINI_OCR'),
('ef-007', 'doc-002', 'dv-002', 'fat', '3.8', 0.7200, 1, 'GEMINI_OCR'), -- Medium confidence flag
('ef-008', 'doc-002', 'dv-002', 'temperature', '9.5', 0.9900, 1, 'GEMINI_OCR'); -- Temperature warning (>8.0C)

-- 15. VALIDATION RULES
INSERT INTO `validation_rules` (`id`, `organization_id`, `code`, `name`, `document_type`, `rule_type`, `severity`, `configuration`) VALUES
('vr-001', 'org-001', 'R-TEMP-MAX', 'Maximum Temperature Check', 'TEST_REPORT', 'NUMERIC_RANGE', 'HIGH', '{"field": "temperature", "max": 8.0, "unit": "Celsius"}'),
('vr-002', 'org-001', 'R-QTY-MATCH', 'Cross Document Quantity Reconciliation', 'CROSS_DOC', 'CROSS_DOCUMENT', 'CRITICAL', '{"source_field": "milk_quantity", "target_field": "quantity_loaded", "tolerance_pct": 2.0}'),
('vr-003', 'org-001', 'R-EXPIRY-CHECK', 'Quality Certificate Expiry Date Check', 'QUALITY_CERTIFICATE', 'EXPIRY_CHECK', 'HIGH', '{"field": "expiry_date"}');

-- 16. VALIDATION RESULTS
INSERT INTO `validation_results` (`id`, `case_id`, `document_id`, `rule_id`, `status`, `severity`, `message`) VALUES
('vres-001', 'case-001', 'doc-002', 'vr-001', 'FAILED', 'HIGH', 'Milk temperature (9.5 C) exceeds threshold maximum limit of 8.0 C.'),
('vres-002', 'case-002', 'doc-003', 'vr-002', 'FAILED', 'CRITICAL', 'Tanker log quantity (4200 L) mismatches collection slip aggregate quantity (4500 L). Difference: 300 L (6.67%).');

-- 17. EXCEPTIONS
INSERT INTO `exceptions` (`id`, `organization_id`, `case_id`, `document_id`, `exception_type`, `severity`, `title`, `description`, `status`) VALUES
('exc-001', 'org-001', 'case-001', 'doc-002', 'CONFLICT', 'HIGH', 'Milk Temperature Deviation', 'Milk test sample #SMP-991 recorded temperature 9.5 C (Limit: 8.0 C). Mandatory cooling inspection required.', 'OPEN'),
('exc-002', 'org-001', 'case-002', 'doc-003', 'CROSS_DOCUMENT_MISMATCH', 'CRITICAL', 'Quantity Mismatch (300 L)', 'Discrepancy detected between Collection Slip total quantity and Tanker Log dispatch quantity.', 'OPEN');

-- 18. DECISIONS
INSERT INTO `decisions` (`id`, `organization_id`, `case_id`, `decision_maker_id`, `action`, `reason`, `ai_recommendation`, `ai_confidence`, `overrode_ai`) VALUES
('dec-001', 'org-001', 'case-003', 'usr-rev-001', 'APPROVE', 'All QA parameter thresholds and certification dates verified successfully.', 'APPROVE', 0.9650, FALSE);

-- 19. AUDIT LOGS
INSERT INTO `audit_logs` (`id`, `organization_id`, `actor_id`, `actor_email`, `actor_role`, `action`, `entity_type`, `entity_id`, `reason`, `outcome`) VALUES
('aud-001', 'org-001', 'usr-app-001', 'applicant@dairycoop.com', 'Applicant', 'CASE_CREATED', 'CASE', 'case-001', 'Submitted morning intake collection package', 'SUCCESS'),
('aud-002', 'org-001', 'usr-rev-001', 'reviewer@dairycoop.com', 'Reviewer', 'DECISION_SUBMITTED', 'CASE', 'case-003', 'Approved batch release after QA verification', 'SUCCESS');

-- 20. NOTIFICATIONS
INSERT INTO `notifications` (`id`, `organization_id`, `recipient_id`, `title`, `message`, `type`, `status`, `related_case_id`) VALUES
('not-001', 'org-001', 'usr-rev-001', 'New Case Assignment', 'Case CAS-2026-001 (Morning Milk Intake) has been assigned to you for review.', 'ASSIGNMENT', 'UNREAD', 'case-001'),
('not-002', 'org-001', 'usr-sup-001', 'Critical Exception Flagged', 'Case CAS-2026-002 has a CRITICAL cross-document quantity mismatch exception.', 'EXCEPTION', 'UNREAD', 'case-002');
