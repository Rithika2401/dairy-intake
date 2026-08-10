const db = require('../config/db');

class ValidationEngineService {
  /**
   * Run full deterministic validation rules and cross-document checks on a case
   */
  async runValidation(caseId, organizationId) {
    // Fetch case and documents
    const caseData = await db.query(
      `SELECT c.* FROM cases c WHERE c.id = ? AND c.organization_id = ?`,
      [caseId, organizationId]
    );

    if (!caseData || caseData.length === 0) {
      throw new Error('Case not found for validation.');
    }

    const documents = await db.query(
      `SELECT d.* FROM documents d WHERE d.case_id = ?`,
      [caseId]
    );

    const fields = await db.query(
      `SELECT ef.*, d.document_type
       FROM extracted_fields ef
       JOIN documents d ON ef.document_id = d.id
       WHERE d.case_id = ?`,
      [caseId]
    );

    const fieldMap = {};
    fields.forEach(f => {
      if (!fieldMap[f.document_type]) fieldMap[f.document_type] = {};
      fieldMap[f.document_type][f.field_key] = f.field_value;
    });

    const results = [];
    const createdExceptions = [];

    // Rule 1: Temperature Threshold Check (TEST_REPORT / TANKER_LOG)
    const testReportFields = fieldMap['TEST_REPORT'] || {};
    if (testReportFields.temperature) {
      const tempVal = parseFloat(testReportFields.temperature);
      if (tempVal > 8.0) {
        results.push({
          rule: 'R-TEMP-MAX',
          status: 'FAILED',
          severity: 'HIGH',
          message: `Milk temperature (${tempVal} C) exceeds maximum threshold limit of 8.0 C.`
        });

        // Create exception
        await db.query(
          `INSERT INTO exceptions (id, organization_id, case_id, exception_type, severity, title, description, status)
           VALUES (UUID(), ?, ?, 'CONFLICT', 'HIGH', 'Milk Temperature Deviation Warning', ?, 'OPEN')`,
          [organizationId, caseId, `Milk temperature recorded at ${tempVal} C (Threshold: 8.0 C max).`]
        );
        createdExceptions.push('Milk Temperature Deviation Warning');
      } else {
        results.push({
          rule: 'R-TEMP-MAX',
          status: 'PASSED',
          severity: 'HIGH',
          message: `Milk temperature (${tempVal} C) within acceptable range.`
        });
      }
    }

    // Rule 2: Cross-Document Quantity Reconciliation
    const collectionSlip = fieldMap['COLLECTION_SLIP'] || {};
    const tankerLog = fieldMap['TANKER_LOG'] || {};

    if (collectionSlip.milk_quantity && tankerLog.quantity) {
      const slipQty = parseFloat(collectionSlip.milk_quantity);
      const tankerQty = parseFloat(tankerLog.quantity);
      const diff = Math.abs(slipQty - tankerQty);
      const diffPct = (diff / Math.max(slipQty, 1)) * 100;

      if (diffPct > 2.0) {
        results.push({
          rule: 'R-QTY-MATCH',
          status: 'FAILED',
          severity: 'CRITICAL',
          message: `Quantity discrepancy: Collection slip (${slipQty} L) vs Tanker Log (${tankerQty} L). Difference: ${diff.toFixed(1)} L (${diffPct.toFixed(1)}%).`
        });

        // Record Cross Document Link
        await db.query(
          `INSERT INTO cross_document_links (id, case_id, source_document_id, target_document_id, link_type, status, difference_details)
           VALUES (UUID(), ?, ?, ?, 'QUANTITY_RECONCILIATION', 'MISMATCH', ?)`,
          [
            caseId,
            documents[0] ? documents[0].id : caseId,
            documents[1] ? documents[1].id : caseId,
            JSON.stringify({ slipQty, tankerQty, diffPct })
          ]
        );

        // Record Exception
        await db.query(
          `INSERT INTO exceptions (id, organization_id, case_id, exception_type, severity, title, description, status)
           VALUES (UUID(), ?, ?, 'CROSS_DOCUMENT_MISMATCH', 'CRITICAL', 'Quantity Discrepancy Flagged', ?, 'OPEN')`,
          [organizationId, caseId, `Quantity discrepancy detected between Collection Slip (${slipQty} L) and Tanker Log (${tankerQty} L).`]
        );
        createdExceptions.push('Quantity Discrepancy Flagged');
      } else {
        results.push({
          rule: 'R-QTY-MATCH',
          status: 'PASSED',
          severity: 'CRITICAL',
          message: 'Quantity reconciles within 2.0% tolerance margin.'
        });
      }
    }

    // Rule 3: Invoice Math Equals Check
    const invoice = fieldMap['INVOICE'] || {};
    if (invoice.subtotal && invoice.tax && invoice.total) {
      const subtotal = parseFloat(invoice.subtotal);
      const tax = parseFloat(invoice.tax);
      const total = parseFloat(invoice.total);
      const expectedTotal = subtotal + tax;

      if (Math.abs(expectedTotal - total) > 0.01) {
        results.push({
          rule: 'R-INV-MATH',
          status: 'FAILED',
          severity: 'HIGH',
          message: `Invoice arithmetic mismatch: Subtotal (${subtotal}) + Tax (${tax}) = ${expectedTotal}, but Total states ${total}.`
        });
      } else {
        results.push({
          rule: 'R-INV-MATH',
          status: 'PASSED',
          severity: 'HIGH',
          message: 'Invoice totals match mathematical sum.'
        });
      }
    }

    // Update Case Status to EXCEPTION if critical validation failed
    if (createdExceptions.length > 0) {
      await db.query(
        `UPDATE cases SET status = 'EXCEPTION', risk_level = 'HIGH' WHERE id = ?`,
        [caseId]
      );
    }

    return {
      case_id: caseId,
      total_rules_executed: results.length,
      passed_count: results.filter(r => r.status === 'PASSED').length,
      failed_count: results.filter(r => r.status === 'FAILED').length,
      results,
      new_exceptions_created: createdExceptions
    };
  }
}

module.exports = new ValidationEngineService();
