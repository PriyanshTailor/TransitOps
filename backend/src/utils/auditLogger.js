import pool from '../db/pool.js';

export const logAudit = async (companyId, userId, action, entityType, entityId, details) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (company_id, user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [companyId, userId, action, entityType, entityId, details]
    );
  } catch (err) {
    console.error("Audit Logging Error:", err);
    // Do not throw, audit logging should not break the main transaction in most cases
  }
};
