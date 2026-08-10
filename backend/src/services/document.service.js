const crypto = require('crypto');
const db = require('../config/db');
const storageDriver = require('../storage/storageDriver');

class DocumentService {
  /**
   * Upload and process a new document
   */
  async uploadDocument(organizationId, userId, caseId, documentType, file) {
    if (!file) {
      const err = new Error('No file provided for upload.');
      err.statusCode = 422;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    // 1. File Validation
    const allowedMimeTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/tiff'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      const err = new Error(`Unsupported document MIME type: ${file.mimetype}. Allowed formats: PDF, PNG, JPEG, TIFF.`);
      err.statusCode = 422;
      err.code = 'INVALID_FILE_TYPE';
      throw err;
    }

    // 2. Save File & Calculate Checksum
    const storageResult = await storageDriver.saveFile(file.buffer, file.originalname);

    // 3. Malware Scan Verification
    const scanResult = await storageDriver.scanFile(storageResult.storageKey);
    let docStatus = scanResult.safe ? 'UPLOADED' : 'REJECTED';

    const documentId = `doc-${crypto.randomBytes(8).toString('hex')}`;
    const versionId = `dv-${crypto.randomBytes(8).toString('hex')}`;

    // 4. Save to Database
    await db.query(
      `INSERT INTO documents (id, organization_id, case_id, document_type, original_filename, current_version, status, created_by)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
      [documentId, organizationId, caseId, documentType || 'UNKNOWN', file.originalname, docStatus, userId]
    );

    await db.query(
      `INSERT INTO document_versions (id, document_id, version_number, storage_key, mime_type, file_size_bytes, checksum_sha256, malware_scan_status, uploaded_by)
       VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)`,
      [
        versionId,
        documentId,
        storageResult.storageKey,
        file.mimetype,
        storageResult.fileSizeBytes,
        storageResult.checksumSha256,
        scanResult.safe ? 'PASSED' : 'FAILED',
        userId
      ]
    );

    // 5. Level 1 Exact Duplicate Check
    const duplicates = await db.query(
      `SELECT dv.document_id, d.case_id, d.original_filename
       FROM document_versions dv
       JOIN documents d ON dv.document_id = d.id
       WHERE dv.checksum_sha256 = ? AND d.organization_id = ? AND dv.document_id != ?`,
      [storageResult.checksumSha256, organizationId, documentId]
    );

    if (duplicates && duplicates.length > 0) {
      // Flag exact checksum duplicate exception
      await db.query(
        `INSERT INTO exceptions (id, organization_id, case_id, document_id, exception_type, severity, title, description, status)
         VALUES (UUID(), ?, ?, ?, 'DUPLICATE', 'HIGH', 'Exact Duplicate File Uploaded', ?, 'OPEN')`,
        [
          organizationId,
          caseId,
          documentId,
          `Identical SHA256 checksum (${storageResult.checksumSha256}) matches existing file ${duplicates[0].original_filename} in Case #${duplicates[0].case_id}.`
        ]
      );
    }

    if (!scanResult.safe) {
      await db.query(
        `INSERT INTO exceptions (id, organization_id, case_id, document_id, exception_type, severity, title, description, status)
         VALUES (UUID(), ?, ?, ?, 'MALWARE', 'CRITICAL', 'Malware Scan Failed', 'Uploaded file failed security scan.', 'OPEN')`,
        [organizationId, caseId, documentId]
      );
    }

    // 6. Audit Log
    try {
      await db.query(
        `INSERT INTO audit_logs (id, organization_id, actor_id, actor_email, actor_role, action, entity_type, entity_id, outcome)
         VALUES (UUID(), ?, ?, 'user', 'Uploader', 'DOCUMENT_UPLOADED', 'DOCUMENT', ?, 'SUCCESS')`,
        [organizationId, userId, documentId]
      );
    } catch (e) {}

    return {
      document_id: documentId,
      version_id: versionId,
      filename: file.originalname,
      mime_type: file.mimetype,
      file_size_bytes: storageResult.fileSizeBytes,
      checksum_sha256: storageResult.checksumSha256,
      status: docStatus,
      is_duplicate: duplicates.length > 0
    };
  }

  /**
   * Get documents for a case
   */
  async getCaseDocuments(caseId, organizationId) {
    return await db.query(
      `SELECT d.*, dv.storage_key, dv.checksum_sha256, dv.file_size_bytes, dv.mime_type
       FROM documents d
       LEFT JOIN document_versions dv ON d.id = dv.document_id AND d.current_version = dv.version_number
       WHERE d.case_id = ? AND d.organization_id = ?`,
      [caseId, organizationId]
    );
  }
}

module.exports = new DocumentService();
