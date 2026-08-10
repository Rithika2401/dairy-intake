const crypto = require('crypto');
const db = require('../config/db');

class CaseService {
  /**
   * List cases with pagination, search query, and status filters for an organization
   */
  async getCases(organizationId, filters = {}) {
    const page = Math.max(1, parseInt(filters.page || 1, 10));
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit || 20, 10)));
    const offset = (page - 1) * limit;

    const conditions = ['c.organization_id = ?'];
    const params = [organizationId];

    if (filters.status) {
      conditions.push('c.status = ?');
      params.push(filters.status);
    }

    if (filters.priority) {
      conditions.push('c.priority = ?');
      params.push(filters.priority);
    }

    if (filters.risk_level) {
      conditions.push('c.risk_level = ?');
      params.push(filters.risk_level);
    }

    if (filters.case_type) {
      conditions.push('c.case_type = ?');
      params.push(filters.case_type);
    }

    if (filters.assigned_reviewer_id) {
      conditions.push('c.assigned_reviewer_id = ?');
      params.push(filters.assigned_reviewer_id);
    }

    if (filters.search) {
      conditions.push('(c.case_number LIKE ? OR c.title LIKE ?)');
      const searchTerm = `%${filters.search.trim()}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereClause = conditions.join(' AND ');

    // Total Count
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM cases c WHERE ${whereClause}`,
      params
    );
    const total = countResult[0] ? parseInt(countResult[0].total, 10) : 0;

    // Items
    const sql = `
      SELECT c.*, 
             CONCAT(u_owner.first_name, ' ', u_owner.last_name) as owner_name,
             CONCAT(u_rev.first_name, ' ', u_rev.last_name) as reviewer_name,
             (SELECT COUNT(*) FROM documents d WHERE d.case_id = c.id) as document_count,
             (SELECT COUNT(*) FROM exceptions e WHERE e.case_id = c.id AND e.status = 'OPEN') as open_exception_count
      FROM cases c
      LEFT JOIN users u_owner ON c.owner_id = u_owner.id
      LEFT JOIN users u_rev ON c.assigned_reviewer_id = u_rev.id
      WHERE ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const items = await db.query(sql, [...params, limit, offset]);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  /**
   * Get complete details of a single case by ID
   */
  async getCaseById(caseId, organizationId) {
    const cases = await db.query(
      `SELECT c.*, 
              CONCAT(u_owner.first_name, ' ', u_owner.last_name) as owner_name,
              u_owner.email as owner_email,
              CONCAT(u_rev.first_name, ' ', u_rev.last_name) as reviewer_name,
              u_rev.email as reviewer_email
       FROM cases c
       LEFT JOIN users u_owner ON c.owner_id = u_owner.id
       LEFT JOIN users u_rev ON c.assigned_reviewer_id = u_rev.id
       WHERE c.id = ? AND c.organization_id = ?`,
      [caseId, organizationId]
    );

    if (!cases || cases.length === 0) {
      const err = new Error('Case not found or access denied.');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const caseData = cases[0];

    // Fetch documents
    const documents = await db.query(
      `SELECT d.*, dv.id as version_id, dv.version_number, dv.file_size_bytes, dv.checksum_sha256, dv.storage_key, dv.uploaded_at
       FROM documents d
       LEFT JOIN document_versions dv ON d.id = dv.document_id AND d.current_version = dv.version_number
       WHERE d.case_id = ?
       ORDER BY d.created_at ASC`,
      [caseId]
    );

    // Fetch extracted fields for documents
    const docIds = documents.map(d => d.id);
    let extractedFields = [];
    if (docIds.length > 0) {
      const placeholders = docIds.map(() => '?').join(',');
      extractedFields = await db.query(
        `SELECT ef.* FROM extracted_fields ef WHERE ef.document_id IN (${placeholders})`,
        docIds
      );
    }

    // Fetch validation results
    const validationResults = await db.query(
      `SELECT vr.*, r.name as rule_name, r.code as rule_code 
       FROM validation_results vr
       JOIN validation_rules r ON vr.rule_id = r.id
       WHERE vr.case_id = ?`,
      [caseId]
    );

    // Fetch cross-document links
    const crossDocLinks = await db.query(
      `SELECT cdl.* FROM cross_document_links cdl WHERE cdl.case_id = ?`,
      [caseId]
    );

    // Fetch open exceptions
    const exceptions = await db.query(
      `SELECT e.* FROM exceptions e WHERE e.case_id = ? ORDER BY e.created_at DESC`,
      [caseId]
    );

    // Fetch decision history
    const decisions = await db.query(
      `SELECT d.*, CONCAT(u.first_name, ' ', u.last_name) as decision_maker_name
       FROM decisions d
       JOIN users u ON d.decision_maker_id = u.id
       WHERE d.case_id = ?
       ORDER BY d.created_at DESC`,
      [caseId]
    );

    // Fetch comments
    const comments = await db.query(
      `SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) as author_name
       FROM comments c
       JOIN users u ON c.author_id = u.id
       WHERE c.case_id = ?
       ORDER BY c.created_at ASC`,
      [caseId]
    );

    // Fetch AI Grounded Summaries
    const aiOutputs = await db.query(
      `SELECT ao.*, ar.run_type, ar.status as run_status, am.model_name
       FROM ai_outputs ao
       JOIN ai_runs ar ON ao.ai_run_id = ar.id
       JOIN ai_models am ON ar.ai_model_id = am.id
       WHERE ar.case_id = ?
       ORDER BY ao.created_at DESC`,
      [caseId]
    );

    return {
      ...caseData,
      documents: documents.map(doc => ({
        ...doc,
        extracted_fields: extractedFields.filter(ef => ef.document_id === doc.id)
      })),
      validation_results: validationResults,
      cross_document_links: crossDocLinks,
      exceptions,
      decisions,
      comments,
      ai_summary: aiOutputs.length > 0 ? aiOutputs[0] : null
    };
  }

  /**
   * Create a new case record
   */
  async createCase(organizationId, userId, caseData) {
    const caseId = `case-${crypto.randomBytes(8).toString('hex')}`;
    const caseNumber = `CAS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const { title, case_type, priority = 'MEDIUM', risk_level = 'LOW', due_date } = caseData;

    if (!title || !case_type) {
      const err = new Error('Case title and case_type are required.');
      err.statusCode = 422;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    await db.query(
      `INSERT INTO cases (id, organization_id, case_number, title, case_type, status, priority, risk_level, owner_id, due_date, version, created_by)
       VALUES (?, ?, ?, ?, ?, 'SUBMITTED', ?, ?, ?, ?, 1, ?)`,
      [caseId, organizationId, caseNumber, title, case_type, priority, risk_level, userId, due_date || null, userId]
    );

    // Record Audit Log
    try {
      await db.query(
        `INSERT INTO audit_logs (id, organization_id, actor_id, actor_email, actor_role, action, entity_type, entity_id, outcome)
         VALUES (UUID(), ?, ?, 'user', 'Applicant', 'CASE_CREATED', 'CASE', ?, 'SUCCESS')`,
        [organizationId, userId, caseId]
      );
    } catch (e) {}

    return this.getCaseById(caseId, organizationId);
  }

  /**
   * Update case with Optimistic Concurrency Check
   */
  async updateCase(caseId, organizationId, userId, caseData, expectedVersion) {
    const currentCase = await this.getCaseById(caseId, organizationId);

    if (expectedVersion !== undefined && currentCase.version !== parseInt(expectedVersion, 10)) {
      const err = new Error('This record was updated by another user. Refresh before saving.');
      err.statusCode = 409;
      err.code = 'CONCURRENCY_CONFLICT';
      throw err;
    }

    const { title, priority, risk_level, assigned_reviewer_id } = caseData;

    await db.query(
      `UPDATE cases 
       SET title = COALESCE(?, title),
           priority = COALESCE(?, priority),
           risk_level = COALESCE(?, risk_level),
           assigned_reviewer_id = COALESCE(?, assigned_reviewer_id),
           version = version + 1,
           updated_by = ?
       WHERE id = ? AND organization_id = ? AND version = ?`,
      [title, priority, risk_level, assigned_reviewer_id, userId, caseId, organizationId, currentCase.version]
    );

    return this.getCaseById(caseId, organizationId);
  }

  /**
   * Submit decision with MySQL Transaction Boundary and Lifecycle Validation
   */
  async submitDecision(caseId, organizationId, user, decisionData) {
    const { action, reason, override_reason, overrode_ai = false } = decisionData;

    if (!action || !reason) {
      const err = new Error('Decision action and mandatory reason are required.');
      err.statusCode = 422;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    return await db.transaction(async (conn) => {
      // 1. Fetch case for update
      const [rows] = await conn.query(
        'SELECT * FROM cases WHERE id = ? AND organization_id = ? FOR UPDATE',
        [caseId, organizationId]
      );

      if (!rows || rows.length === 0) {
        const err = new Error('Case not found.');
        err.statusCode = 404;
        throw err;
      }

      const caseRec = rows[0];

      // 2. Validate Lifecycle State Transitions
      const invalidTransitions = {
        'APPROVED': ['DRAFT', 'SUBMITTED'],
        'REJECTED': ['DRAFT', 'SUBMITTED', 'APPROVED'],
        'CLOSED': ['DRAFT', 'SUBMITTED', 'PENDING_REVIEW']
      };

      if (invalidTransitions[caseRec.status] && invalidTransitions[caseRec.status].includes(action)) {
        const err = new Error(`Invalid state transition from ${caseRec.status} to ${action}.`);
        err.statusCode = 422;
        err.code = 'INVALID_WORKFLOW_TRANSITION';
        throw err;
      }

      // Map action to status
      let newStatus = caseRec.status;
      if (action === 'APPROVE') newStatus = 'APPROVED';
      else if (action === 'REJECT') newStatus = 'REJECTED';
      else if (action === 'CORRECTION_REQUESTED') newStatus = 'CORRECTION_REQUESTED';
      else if (action === 'ESCALATE') newStatus = 'ESCALATED';

      // 3. Update Case Status & increment version
      await conn.query(
        'UPDATE cases SET status = ?, version = version + 1, updated_by = ? WHERE id = ?',
        [newStatus, user.id, caseId]
      );

      // 4. Create Decision Record
      const decisionId = `dec-${crypto.randomBytes(8).toString('hex')}`;
      await conn.query(
        `INSERT INTO decisions (id, organization_id, case_id, decision_maker_id, action, reason, overrode_ai, override_reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [decisionId, organizationId, caseId, user.id, action, reason, overrode_ai ? 1 : 0, override_reason || null]
      );

      // 5. Create Audit Log Record
      await conn.query(
        `INSERT INTO audit_logs (id, organization_id, actor_id, actor_email, actor_role, action, entity_type, entity_id, reason, outcome)
         VALUES (UUID(), ?, ?, ?, ?, ?, 'CASE', ?, ?, 'SUCCESS')`,
        [organizationId, user.id, user.email, user.roles[0] || 'Reviewer', `CASE_${action}`, caseId, reason]
      );

      // 6. Generate Notification to Case Owner
      await conn.query(
        `INSERT INTO notifications (id, organization_id, recipient_id, title, message, type, related_case_id)
         VALUES (UUID(), ?, ?, ?, ?, 'APPROVAL', ?)`,
        [
          organizationId,
          caseRec.owner_id,
          `Case ${caseRec.case_number} Updated`,
          `Decision ${action} recorded by ${user.first_name} ${user.last_name}. Reason: ${reason}`,
          caseId
        ]
      );

      return {
        decision_id: decisionId,
        case_id: caseId,
        new_status: newStatus,
        action,
        reason
      };
    });
  }
}

module.exports = new CaseService();
