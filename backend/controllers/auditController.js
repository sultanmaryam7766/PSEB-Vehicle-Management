import db from "../db.js";

export const getAuditLogs = (req, res) => {
  const sql = `
    SELECT
      id,
      actor_user_id,
      actor_name,
      action,
      module,
      record_id,
      record_name,
      created_at
    FROM audit_logs
    ORDER BY created_at DESC, id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Unable to load audit logs",
      });
    }

    return res.json({
      logs: results,
    });
  });
};