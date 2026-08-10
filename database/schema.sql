-- ============================================================================
-- Dairy Intelligent Document Intake & Decision Hub
-- Pure MySQL Schema Specification (DDL)
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `dairy_hub` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dairy_hub`;

-- Disable foreign key checks for clean teardown/recreation during initialization
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `generated_reports`;
DROP TABLE IF EXISTS `report_jobs`;
DROP TABLE IF EXISTS `workflow_rules`;
DROP TABLE IF EXISTS `system_settings`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `ai_overrides`;
DROP TABLE IF EXISTS `ai_feedback`;
DROP TABLE IF EXISTS `ai_outputs`;
DROP TABLE IF EXISTS `ai_runs`;
DROP TABLE IF EXISTS `ai_models`;
DROP TABLE IF EXISTS `notification_preferences`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `alerts`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `inventory`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `batches`;
DROP TABLE IF EXISTS `tankers`;
DROP TABLE IF EXISTS `milk_tests`;
DROP TABLE IF EXISTS `milk_lots`;
DROP TABLE IF EXISTS `assignments`;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `decisions`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `exceptions`;
DROP TABLE IF EXISTS `cross_document_links`;
DROP TABLE IF EXISTS `validation_results`;
DROP TABLE IF EXISTS `validation_rules`;
DROP TABLE IF EXISTS `extracted_fields`;
DROP TABLE IF EXISTS `document_fields`;
DROP TABLE IF EXISTS `document_pages`;
DROP TABLE IF EXISTS `document_versions`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `submissions`;
DROP TABLE IF EXISTS `cases`;
DROP TABLE IF EXISTS `distributors`;
DROP TABLE IF EXISTS `plant_operators`;
DROP TABLE IF EXISTS `quality_technicians`;
DROP TABLE IF EXISTS `milk_collectors`;
DROP TABLE IF EXISTS `farmers`;
DROP TABLE IF EXISTS `collection_centres`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `organizations`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. ORGANIZATIONS (Tenant Isolation Boundary)
CREATE TABLE `organizations` (
  `id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `license_number` VARCHAR(100) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `contact_email` VARCHAR(255) NOT NULL,
  `contact_phone` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_org_code` (`code`),
  INDEX `idx_org_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USERS
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE', 'LOCKED', 'PENDING_MFA') NOT NULL DEFAULT 'ACTIVE',
  `failed_login_attempts` INT NOT NULL DEFAULT 0,
  `locked_until` DATETIME DEFAULT NULL,
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_email` (`email`),
  CONSTRAINT `fk_user_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_user_org_status` (`organization_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ROLES
CREATE TABLE `roles` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `is_system` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PERMISSIONS
CREATE TABLE `permissions` (
  `id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(100) NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_perm_code` (`code`),
  INDEX `idx_perm_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ROLE PERMISSIONS
CREATE TABLE `role_permissions` (
  `role_id` VARCHAR(36) NOT NULL,
  `permission_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. USER ROLES
CREATE TABLE `user_roles` (
  `user_id` VARCHAR(36) NOT NULL,
  `role_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. COLLECTION CENTRES
CREATE TABLE `collection_centres` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `capacity_liters` DECIMAL(10, 2) NOT NULL DEFAULT 5000.00,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_centre_code_org` (`organization_id`, `code`),
  CONSTRAINT `fk_cc_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. FARMERS
CREATE TABLE `farmers` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `collection_centre_id` VARCHAR(36) NOT NULL,
  `farmer_code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `bank_account` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_farmer_code_org` (`organization_id`, `farmer_code`),
  CONSTRAINT `fk_farmer_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_farmer_cc` FOREIGN KEY (`collection_centre_id`) REFERENCES `collection_centres` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. MILK COLLECTORS
CREATE TABLE `milk_collectors` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `collector_code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `collection_centre_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_collector_code` (`organization_id`, `collector_code`),
  CONSTRAINT `fk_mc_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mc_cc` FOREIGN KEY (`collection_centre_id`) REFERENCES `collection_centres` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. QUALITY TECHNICIANS
CREATE TABLE `quality_technicians` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `technician_code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `certification_no` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_qt_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_qt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. PLANT OPERATORS
CREATE TABLE `plant_operators` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `operator_code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `plant_name` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_po_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_po_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. DISTRIBUTORS
CREATE TABLE `distributors` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `contact_person` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_dist_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. CASES (Business Review Process)
CREATE TABLE `cases` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `case_number` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `case_type` ENUM('COLLECTION_INTAKE', 'QUALITY_AUDIT', 'TANKER_DISPATCH', 'BATCH_RELEASE', 'INVOICE_RECONCILIATION', 'COMPLIANCE_REVIEW') NOT NULL,
  `status` ENUM('DRAFT', 'SUBMITTED', 'PROCESSING', 'PENDING_REVIEW', 'EXCEPTION', 'APPROVED', 'REJECTED', 'CORRECTION_REQUESTED', 'ESCALATED', 'CLOSED') NOT NULL DEFAULT 'SUBMITTED',
  `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  `risk_level` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'LOW',
  `owner_id` VARCHAR(36) NOT NULL,
  `assigned_reviewer_id` VARCHAR(36) DEFAULT NULL,
  `due_date` DATETIME DEFAULT NULL,
  `version` INT NOT NULL DEFAULT 1, -- Optimistic locking
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` VARCHAR(36) NOT NULL,
  `updated_by` VARCHAR(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_case_number_org` (`organization_id`, `case_number`),
  CONSTRAINT `fk_case_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_case_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_case_reviewer` FOREIGN KEY (`assigned_reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_case_org_status` (`organization_id`, `status`),
  INDEX `idx_case_org_risk` (`organization_id`, `risk_level`),
  INDEX `idx_case_reviewer` (`assigned_reviewer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. SUBMISSIONS
CREATE TABLE `submissions` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `case_id` VARCHAR(36) NOT NULL,
  `submitter_id` VARCHAR(36) NOT NULL,
  `channel` ENUM('WEB_PORTAL', 'MOBILE_APP', 'API_INTEGRATION', 'EMAIL_GATEWAY') NOT NULL DEFAULT 'WEB_PORTAL',
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sub_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sub_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sub_user` FOREIGN KEY (`submitter_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. DOCUMENTS
CREATE TABLE `documents` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `case_id` VARCHAR(36) NOT NULL,
  `document_type` ENUM('COLLECTION_SLIP', 'TEST_REPORT', 'TANKER_LOG', 'BATCH_RECORD', 'QUALITY_CERTIFICATE', 'INVOICE', 'SUPPORTING_DOCUMENT', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
  `original_filename` VARCHAR(255) NOT NULL,
  `current_version` INT NOT NULL DEFAULT 1,
  `status` ENUM('UPLOADING', 'UPLOADED', 'SCANNING', 'SCAN_FAILED', 'SAFE', 'PROCESSING', 'PROCESSED', 'FAILED', 'REJECTED') NOT NULL DEFAULT 'UPLOADED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_doc_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_doc_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  INDEX `idx_doc_org_type` (`organization_id`, `document_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. DOCUMENT VERSIONS
CREATE TABLE `document_versions` (
  `id` VARCHAR(36) NOT NULL,
  `document_id` VARCHAR(36) NOT NULL,
  `version_number` INT NOT NULL,
  `storage_key` VARCHAR(500) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_size_bytes` BIGINT NOT NULL,
  `checksum_sha256` VARCHAR(64) NOT NULL,
  `malware_scan_status` ENUM('PENDING', 'PASSED', 'FAILED', 'BYPASSED') NOT NULL DEFAULT 'PASSED',
  `change_reason` TEXT DEFAULT NULL,
  `uploaded_by` VARCHAR(36) NOT NULL,
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_doc_version` (`document_id`, `version_number`),
  CONSTRAINT `fk_dv_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dv_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  INDEX `idx_dv_checksum` (`checksum_sha256`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. DOCUMENT PAGES
CREATE TABLE `document_pages` (
  `id` VARCHAR(36) NOT NULL,
  `version_id` VARCHAR(36) NOT NULL,
  `page_number` INT NOT NULL,
  `raw_ocr_text` LONGTEXT DEFAULT NULL,
  `page_width` INT DEFAULT NULL,
  `page_height` INT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_page_ver` (`version_id`, `page_number`),
  CONSTRAINT `fk_dp_version` FOREIGN KEY (`version_id`) REFERENCES `document_versions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. DOCUMENT FIELDS (Schema definitions for extraction)
CREATE TABLE `document_fields` (
  `id` VARCHAR(36) NOT NULL,
  `document_type` ENUM('COLLECTION_SLIP', 'TEST_REPORT', 'TANKER_LOG', 'BATCH_RECORD', 'QUALITY_CERTIFICATE', 'INVOICE', 'SUPPORTING_DOCUMENT', 'UNKNOWN') NOT NULL,
  `field_key` VARCHAR(100) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `data_type` ENUM('STRING', 'NUMBER', 'DECIMAL', 'DATE', 'DATETIME', 'BOOLEAN') NOT NULL DEFAULT 'STRING',
  `is_required` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_doc_field_key` (`document_type`, `field_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. EXTRACTED FIELDS
CREATE TABLE `extracted_fields` (
  `id` VARCHAR(36) NOT NULL,
  `document_id` VARCHAR(36) NOT NULL,
  `version_id` VARCHAR(36) NOT NULL,
  `field_key` VARCHAR(100) NOT NULL,
  `field_value` TEXT DEFAULT NULL,
  `normalized_value` TEXT DEFAULT NULL,
  `confidence` DECIMAL(5, 4) NOT NULL DEFAULT 0.0000,
  `source_page` INT DEFAULT 1,
  `bounding_region` JSON DEFAULT NULL,
  `extraction_method` ENUM('GEMINI_OCR', 'RULE_PARSER', 'MANUAL_ENTRY') NOT NULL DEFAULT 'GEMINI_OCR',
  `model_version` VARCHAR(50) DEFAULT 'gemini-1.5-flash',
  `reviewer_corrected` BOOLEAN NOT NULL DEFAULT FALSE,
  `original_ai_value` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ef_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ef_version` FOREIGN KEY (`version_id`) REFERENCES `document_versions` (`id`) ON DELETE CASCADE,
  INDEX `idx_ef_field` (`document_id`, `field_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. VALIDATION RULES
CREATE TABLE `validation_rules` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `document_type` VARCHAR(100) NOT NULL,
  `rule_type` ENUM('REQUIRED_FIELD', 'NUMERIC_RANGE', 'DATE_FUTURE_CHECK', 'MATH_EQUALS', 'EXPIRY_CHECK', 'CROSS_DOCUMENT', 'DUPLICATE_CHECK') NOT NULL,
  `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'HIGH',
  `configuration` JSON NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_val_rule_org` (`organization_id`, `code`),
  CONSTRAINT `fk_vr_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. VALIDATION RESULTS
CREATE TABLE `validation_results` (
  `id` VARCHAR(36) NOT NULL,
  `case_id` VARCHAR(36) NOT NULL,
  `document_id` VARCHAR(36) DEFAULT NULL,
  `rule_id` VARCHAR(36) NOT NULL,
  `status` ENUM('PASSED', 'FAILED', 'WARNING', 'SKIPPED') NOT NULL,
  `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
  `message` TEXT NOT NULL,
  `details` JSON DEFAULT NULL,
  `executed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_vr_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vr_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_vr_rule` FOREIGN KEY (`rule_id`) REFERENCES `validation_rules` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. CROSS DOCUMENT LINKS
CREATE TABLE `cross_document_links` (
  `id` VARCHAR(36) NOT NULL,
  `case_id` VARCHAR(36) NOT NULL,
  `source_document_id` VARCHAR(36) NOT NULL,
  `target_document_id` VARCHAR(36) NOT NULL,
  `link_type` VARCHAR(100) NOT NULL, -- e.g. QUANTITY_COMPARISON, SAMPLE_ID_MATCH
  `status` ENUM('MATCH', 'MISMATCH', 'MISSING', 'UNVERIFIABLE') NOT NULL,
  `difference_details` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cdl_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cdl_src` FOREIGN KEY (`source_document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cdl_tgt` FOREIGN KEY (`target_document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. EXCEPTIONS
CREATE TABLE `exceptions` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `case_id` VARCHAR(36) NOT NULL,
  `document_id` VARCHAR(36) DEFAULT NULL,
  `exception_type` ENUM('MISSING_DATA', 'CONFLICT', 'LOW_CONFIDENCE', 'EXPIRED', 'DUPLICATE', 'INVALID_FORMAT', 'CROSS_DOCUMENT_MISMATCH', 'MALWARE', 'AI_FAILURE', 'PROCESSING_FAILURE', 'OTHER') NOT NULL,
  `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'OVERRIDDEN', 'DISMISSED') NOT NULL DEFAULT 'OPEN',
  `resolved_by` VARCHAR(36) DEFAULT NULL,
  `resolution_reason` TEXT DEFAULT NULL,
  `resolved_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_exc_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exc_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exc_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_exc_resolver` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_exc_status` (`organization_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. REVIEWS
CREATE TABLE `reviews` (
  `id` VARCHAR(36) NOT NULL,
  `case_id` VARCHAR(36) NOT NULL,
  `reviewer_id` VARCHAR(36) NOT NULL,
  `status` ENUM('IN_PROGRESS', 'COMPLETED', 'ESCALATED') NOT NULL DEFAULT 'IN_PROGRESS',
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_rev_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rev_user` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. DECISIONS
CREATE TABLE `decisions` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `case_id` VARCHAR(36) NOT NULL,
  `decision_maker_id` VARCHAR(36) NOT NULL,
  `action` ENUM('APPROVE', 'REJECT', 'CORRECTION_REQUESTED', 'OVERRIDE', 'ESCALATE') NOT NULL,
  `reason` TEXT NOT NULL,
  `ai_recommendation` VARCHAR(100) DEFAULT NULL,
  `ai_confidence` DECIMAL(5, 4) DEFAULT NULL,
  `overrode_ai` BOOLEAN NOT NULL DEFAULT FALSE,
  `override_reason` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_dec_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dec_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dec_user` FOREIGN KEY (`decision_maker_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. COMMENTS
CREATE TABLE `comments` (
  `id` VARCHAR(36) NOT NULL,
  `case_id` VARCHAR(36) NOT NULL,
  `author_id` VARCHAR(36) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_com_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_com_user` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. ASSIGNMENTS
CREATE TABLE `assignments` (
  `id` VARCHAR(36) NOT NULL,
  `case_id` VARCHAR(36) NOT NULL,
  `assigned_by_id` VARCHAR(36) NOT NULL,
  `assigned_to_id` VARCHAR(36) NOT NULL,
  `previous_assignee_id` VARCHAR(36) DEFAULT NULL,
  `reason` TEXT DEFAULT NULL,
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_asg_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_asg_by` FOREIGN KEY (`assigned_by_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_asg_to` FOREIGN KEY (`assigned_to_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. MILK LOTS
CREATE TABLE `milk_lots` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `lot_number` VARCHAR(50) NOT NULL,
  `collection_centre_id` VARCHAR(36) NOT NULL,
  `farmer_id` VARCHAR(36) NOT NULL,
  `collection_date` DATE NOT NULL,
  `quantity_liters` DECIMAL(10, 2) NOT NULL,
  `fat_percentage` DECIMAL(4, 2) NOT NULL,
  `snf_percentage` DECIMAL(4, 2) NOT NULL,
  `rate_per_liter` DECIMAL(10, 2) NOT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `collector_id` VARCHAR(36) DEFAULT NULL,
  `slip_number` VARCHAR(50) NOT NULL,
  `status` ENUM('ACCEPTED', 'REJECTED', 'PENDING_TEST') NOT NULL DEFAULT 'ACCEPTED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slip_org` (`organization_id`, `slip_number`),
  CONSTRAINT `fk_ml_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ml_cc` FOREIGN KEY (`collection_centre_id`) REFERENCES `collection_centres` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_ml_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. MILK TESTS
CREATE TABLE `milk_tests` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `sample_id` VARCHAR(50) NOT NULL,
  `milk_lot_id` VARCHAR(36) DEFAULT NULL,
  `technician_id` VARCHAR(36) DEFAULT NULL,
  `test_date` DATETIME NOT NULL,
  `fat` DECIMAL(4, 2) NOT NULL,
  `snf` DECIMAL(4, 2) NOT NULL,
  `temperature` DECIMAL(4, 1) NOT NULL,
  `acidity` DECIMAL(4, 2) NOT NULL,
  `quality_status` ENUM('GRADE_A', 'GRADE_B', 'REJECTED', 'STANDARD') NOT NULL DEFAULT 'STANDARD',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sample_org` (`organization_id`, `sample_id`),
  CONSTRAINT `fk_mt_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mt_lot` FOREIGN KEY (`milk_lot_id`) REFERENCES `milk_lots` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30. TANKERS
CREATE TABLE `tankers` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `tanker_number` VARCHAR(50) NOT NULL,
  `driver_name` VARCHAR(255) NOT NULL,
  `route` VARCHAR(255) NOT NULL,
  `capacity_liters` DECIMAL(10, 2) NOT NULL,
  `pickup_time` DATETIME NOT NULL,
  `delivery_time` DATETIME DEFAULT NULL,
  `quantity_loaded` DECIMAL(10, 2) NOT NULL,
  `temperature` DECIMAL(4, 1) NOT NULL,
  `status` ENUM('IN_TRANSIT', 'DELIVERED', 'INSPECTED', 'REJECTED') NOT NULL DEFAULT 'IN_TRANSIT',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tk_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 31. BATCHES
CREATE TABLE `batches` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `batch_number` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `volume_liters` DECIMAL(10, 2) NOT NULL,
  `production_date` DATE NOT NULL,
  `expiry_date` DATE NOT NULL,
  `status` ENUM('IN_PROCESSING', 'PASSED_QA', 'QUARANTINED', 'RELEASED', 'REJECTED') NOT NULL DEFAULT 'IN_PROCESSING',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_batch_org` (`organization_id`, `batch_number`),
  CONSTRAINT `fk_bt_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 32. PRODUCTS
CREATE TABLE `products` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `sku` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `shelf_life_days` INT NOT NULL DEFAULT 30,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_sku` (`organization_id`, `sku`),
  CONSTRAINT `fk_prod_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 33. INVENTORY
CREATE TABLE `inventory` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `batch_id` VARCHAR(36) DEFAULT NULL,
  `quantity_units` INT NOT NULL DEFAULT 0,
  `warehouse_location` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_inv_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inv_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 34. PAYMENTS
CREATE TABLE `payments` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `farmer_id` VARCHAR(36) NOT NULL,
  `invoice_number` VARCHAR(50) NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  `tax` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `payment_status` ENUM('PENDING', 'APPROVED', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
  `payment_date` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_pay_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pay_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 35. ALERTS
CREATE TABLE `alerts` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `severity` ENUM('INFO', 'WARNING', 'CRITICAL') NOT NULL DEFAULT 'WARNING',
  `is_resolved` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_alt_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 36. NOTIFICATIONS
CREATE TABLE `notifications` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `recipient_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('ASSIGNMENT', 'EXCEPTION', 'APPROVAL', 'REJECTION', 'CORRECTION', 'ESCALATION', 'AI_COMPLETE', 'AI_FAILED', 'SYSTEM_ALERT') NOT NULL,
  `status` ENUM('UNREAD', 'READ', 'CLEARED') NOT NULL DEFAULT 'UNREAD',
  `related_case_id` VARCHAR(36) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_notif_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_notif_user_status` (`recipient_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 37. NOTIFICATION PREFERENCES
CREATE TABLE `notification_preferences` (
  `user_id` VARCHAR(36) NOT NULL,
  `email_notifications` BOOLEAN NOT NULL DEFAULT TRUE,
  `in_app_notifications` BOOLEAN NOT NULL DEFAULT TRUE,
  `notify_on_assignment` BOOLEAN NOT NULL DEFAULT TRUE,
  `notify_on_exception` BOOLEAN NOT NULL DEFAULT TRUE,
  `notify_on_decision` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_np_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 38. AI MODELS
CREATE TABLE `ai_models` (
  `id` VARCHAR(36) NOT NULL,
  `model_name` VARCHAR(100) NOT NULL,
  `version` VARCHAR(50) NOT NULL,
  `provider` VARCHAR(50) NOT NULL DEFAULT 'GOOGLE_GEMINI',
  `description` VARCHAR(255) DEFAULT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ai_model_ver` (`model_name`, `version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 39. AI RUNS
CREATE TABLE `ai_runs` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `case_id` VARCHAR(36) NOT NULL,
  `document_id` VARCHAR(36) DEFAULT NULL,
  `ai_model_id` VARCHAR(36) NOT NULL,
  `run_type` ENUM('CLASSIFICATION', 'EXTRACTION', 'GROUNDED_SUMMARY', 'VALIDATION') NOT NULL,
  `status` ENUM('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PROCESSING',
  `latency_ms` INT DEFAULT NULL,
  `input_snapshot` JSON DEFAULT NULL,
  `error_message` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ar_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ar_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ar_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ar_model` FOREIGN KEY (`ai_model_id`) REFERENCES `ai_models` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 40. AI OUTPUTS
CREATE TABLE `ai_outputs` (
  `id` VARCHAR(36) NOT NULL,
  `ai_run_id` VARCHAR(36) NOT NULL,
  `raw_output` JSON NOT NULL,
  `overall_confidence` DECIMAL(5, 4) NOT NULL DEFAULT 0.0000,
  `grounded_summary` TEXT DEFAULT NULL,
  `evidence_citations` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ao_run` FOREIGN KEY (`ai_run_id`) REFERENCES `ai_runs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 41. AI FEEDBACK
CREATE TABLE `ai_feedback` (
  `id` VARCHAR(36) NOT NULL,
  `ai_run_id` VARCHAR(36) NOT NULL,
  `reviewer_id` VARCHAR(36) NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comments` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_af_run` FOREIGN KEY (`ai_run_id`) REFERENCES `ai_runs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_af_user` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 42. AI OVERRIDES
CREATE TABLE `ai_overrides` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `case_id` VARCHAR(36) NOT NULL,
  `reviewer_id` VARCHAR(36) NOT NULL,
  `field_key` VARCHAR(100) NOT NULL,
  `ai_value` TEXT DEFAULT NULL,
  `human_value` TEXT NOT NULL,
  `reason` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ao_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ao_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ao_user` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 43. AUDIT LOGS (Immutable)
CREATE TABLE `audit_logs` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `actor_id` VARCHAR(36) NOT NULL,
  `actor_email` VARCHAR(255) NOT NULL,
  `actor_role` VARCHAR(100) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(100) NOT NULL,
  `entity_id` VARCHAR(36) NOT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `previous_value` JSON DEFAULT NULL,
  `new_value` JSON DEFAULT NULL,
  `reason` TEXT DEFAULT NULL,
  `outcome` ENUM('SUCCESS', 'FAILURE') NOT NULL DEFAULT 'SUCCESS',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_org_action` (`organization_id`, `action`),
  INDEX `idx_audit_actor` (`actor_id`),
  INDEX `idx_audit_entity` (`entity_type`, `entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 44. SYSTEM SETTINGS
CREATE TABLE `system_settings` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` JSON NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `updated_by` VARCHAR(36) DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_setting_org_key` (`organization_id`, `setting_key`),
  CONSTRAINT `fk_ss_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 45. WORKFLOW RULES
CREATE TABLE `workflow_rules` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `case_type` VARCHAR(50) NOT NULL,
  `trigger_event` VARCHAR(100) NOT NULL,
  `conditions` JSON NOT NULL,
  `actions` JSON NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_wr_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 46. REPORT JOBS
CREATE TABLE `report_jobs` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `requested_by` VARCHAR(36) NOT NULL,
  `report_type` VARCHAR(100) NOT NULL,
  `parameters` JSON DEFAULT NULL,
  `status` ENUM('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'QUEUED',
  `error_message` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_rj_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rj_user` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 47. GENERATED REPORTS
CREATE TABLE `generated_reports` (
  `id` VARCHAR(36) NOT NULL,
  `report_job_id` VARCHAR(36) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_format` ENUM('CSV', 'PDF', 'EXCEL') NOT NULL,
  `storage_key` VARCHAR(500) NOT NULL,
  `file_size_bytes` BIGINT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_gr_job` FOREIGN KEY (`report_job_id`) REFERENCES `report_jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
