# Database Schema & Data Dictionary

## Overview
Engine: **MySQL 8.0+ / InnoDB** | Character Set: `utf8mb4` | Collation: `utf8mb4_unicode_ci`

## Normalized Tables Summary (47 Tables)

1. `organizations`: Tenant isolation boundary records.
2. `users`: System user accounts with status locks and failed login counters.
3. `roles`: RBAC roles (`APPLICANT`, `REVIEWER`, `SUPERVISOR`, `COMPLIANCE_ADMIN`).
4. `permissions`: Granular permission definitions (e.g. `cases.approve`, `reports.export`).
5. `role_permissions`: Many-to-many role-permission mapping.
6. `user_roles`: Many-to-many user-role mapping.
7. `collection_centres`: Milk collection hubs with capacity metrics.
8. `farmers`: Farmer master data with bank accounts and codes.
9. `milk_collectors`: Field collection personnel.
10. `quality_technicians`: QA laboratory technicians.
11. `plant_operators`: Dairy processing plant operators.
12. `distributors`: Logistics distributors.
13. `cases`: Business review processes with optimistic locking `version` field.
14. `submissions`: Case submission packages.
15. `documents`: Ingested document records.
16. `document_versions`: Immutable document versions with SHA256 checksums.
17. `document_pages`: OCR page text and bounding boxes.
18. `document_fields`: Schema field key definitions.
19. `extracted_fields`: AI/Rule extracted field values with confidence scores.
20. `validation_rules`: Deterministic validation rule definitions.
21. `validation_results`: Rule execution status and failure logs.
22. `cross_document_links`: Cross-doc quantity & sample reconciliation links.
23. `exceptions`: System exceptions with severity rankings.
24. `reviews`: Reviewer session tracking.
25. `decisions`: Material approval/rejection/override decision audit records.
26. `comments`: Reviewer thread comments.
27. `assignments`: Reviewer assignment history.
28. `milk_lots`: Collection slip milk lot metrics.
29. `milk_tests`: QA laboratory sample test records.
30. `tankers`: Dispatch tanker log metrics.
31. `batches`: Processing batch releases.
32. `products`: Dairy SKU product catalog.
33. `inventory`: Stock balances.
34. `payments`: Farmer payment invoices.
35. `alerts`: System operational alerts.
36. `notifications`: In-app user notifications.
37. `notification_preferences`: User channel settings.
38. `ai_models`: Model registry.
39. `ai_runs`: AI processing execution logs.
40. `ai_outputs`: AI JSON outputs and grounded summary text.
41. `ai_feedback`: Reviewer model feedback ratings.
42. `ai_overrides`: Human reviewer field override records.
43. `audit_logs`: Immutable audit trail.
44. `system_settings`: System thresholds and parameters.
45. `workflow_rules`: Dynamic workflow routing rules.
46. `report_jobs`: Background report export jobs.
47. `generated_reports`: Exported report artifacts.
