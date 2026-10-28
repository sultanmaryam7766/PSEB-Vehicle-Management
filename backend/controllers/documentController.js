import db from "../db.js";
import fs from "fs";
import path from "path";

/* =========================
   AUDIT LOG
========================= */

const addDocumentAuditLog = (
  actorUserId,
  action,
  recordId,
  recordName
) => {
  const actorSql = `
    SELECT name
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  db.query(
    actorSql,
    [actorUserId],
    (
      actorErr,
      actorResults
    ) => {
      if (
        actorErr
      ) {
        console.error(
          "Document audit actor error:",
          actorErr
        );

        return;
      }

      const actorName =
        actorResults.length > 0
          ? actorResults[0].name
          : "Unknown User";

      const auditSql = `
        INSERT INTO audit_logs
        (
          actor_user_id,
          actor_name,
          action,
          module,
          record_id,
          record_name
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        auditSql,
        [
          actorUserId,
          actorName,
          action,
          "Documents",
          recordId,
          recordName,
        ],
        (
          auditErr
        ) => {
          if (
            auditErr
          ) {
            console.error(
              "Document audit error:",
              auditErr
            );
          }
        }
      );
    }
  );
};

/* =========================
   GET DOCUMENTS
========================= */

export const getDocuments = (
  req,
  res
) => {
  const sql = `
    SELECT
      d.id,
      d.vehicle_id,
      d.document_type,
      d.document_number,
      d.issue_date,
      d.expiry_date,
      d.document_reference,
      d.document_file,
      d.remarks,
      d.created_at,

      v.registration_no,
      v.vehicle_name,
      v.location,

      DATEDIFF(
        d.expiry_date,
        CURRENT_DATE()
      ) AS days_left,

      CASE
        WHEN d.expiry_date < CURRENT_DATE()
          THEN 'Expired'

        WHEN DATEDIFF(
          d.expiry_date,
          CURRENT_DATE()
        ) <= 7
          THEN 'Urgent'

        WHEN DATEDIFF(
          d.expiry_date,
          CURRENT_DATE()
        ) <= 30
          THEN 'Expiring'

        ELSE 'Valid'
      END AS status

    FROM vehicle_documents d

    INNER JOIN vehicles v
      ON d.vehicle_id = v.id

    ORDER BY
      d.expiry_date ASC,
      d.id DESC
  `;

  db.query(
    sql,
    (
      err,
      results
    ) => {
      if (
        err
      ) {
        console.error(
          "Load documents error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to load vehicle documents",
          });
      }

      return res.json({
        documents:
          results,
      });
    }
  );
};

/* =========================
   CREATE DOCUMENT
========================= */

export const createDocument = (
  req,
  res
) => {
  const {
    vehicleId,
    documentType,
    documentNumber,
    issueDate,
    expiryDate,
    documentReference,
    remarks,
  } =
    req.body;

  if (
    !vehicleId ||
    !documentType ||
    !expiryDate
  ) {
    return res
      .status(400)
      .json({
        message:
          "Vehicle, document type and expiry date are required",
      });
  }

  if (
    issueDate &&
    new Date(
      expiryDate
    ) <
      new Date(
        issueDate
      )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Expiry date cannot be earlier than issue date",
      });
  }

  const documentFile =
    req.file
      ? req.file.filename
      : null;

  const sql = `
    INSERT INTO vehicle_documents
    (
      vehicle_id,
      document_type,
      document_number,
      issue_date,
      expiry_date,
      document_reference,
      document_file,
      remarks,
      created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      vehicleId,
      documentType,
      documentNumber ||
        null,
      issueDate ||
        null,
      expiryDate,
      documentReference ||
        null,
      documentFile,
      remarks ||
        null,
      req.user.id,
    ],
    (
      err,
      result
    ) => {
      if (
        err
      ) {
        console.error(
          "Create document error:",
          err
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to add document",
          });
      }

      addDocumentAuditLog(
        req.user.id,
        "Created vehicle document",
        result.insertId,
        documentType
      );

      return res
        .status(201)
        .json({
          message:
            "Vehicle document added successfully",
        });
    }
  );
};

/* =========================
   UPDATE DOCUMENT
========================= */

export const updateDocument = (
  req,
  res
) => {
  const {
    id,
  } =
    req.params;

  const {
    vehicleId,
    documentType,
    documentNumber,
    issueDate,
    expiryDate,
    documentReference,
    remarks,
  } =
    req.body;

  if (
    !vehicleId ||
    !documentType ||
    !expiryDate
  ) {
    return res
      .status(400)
      .json({
        message:
          "Vehicle, document type and expiry date are required",
      });
  }

  if (
    issueDate &&
    new Date(
      expiryDate
    ) <
      new Date(
        issueDate
      )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Expiry date cannot be earlier than issue date",
      });
  }

  const findSql = `
    SELECT document_file
    FROM vehicle_documents
    WHERE id = ?
    LIMIT 1
  `;

  db.query(
    findSql,
    [
      id,
    ],
    (
      findErr,
      results
    ) => {
      if (
        findErr
      ) {
        console.error(
          findErr
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to update document",
          });
      }

      if (
        results.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Document not found",
          });
      }

      const documentFile =
        req.file
          ? req.file.filename
          : results[0]
              .document_file;

      const sql = `
        UPDATE vehicle_documents

        SET
          vehicle_id = ?,
          document_type = ?,
          document_number = ?,
          issue_date = ?,
          expiry_date = ?,
          document_reference = ?,
          document_file = ?,
          remarks = ?

        WHERE id = ?
      `;

      db.query(
        sql,
        [
          vehicleId,
          documentType,
          documentNumber ||
            null,
          issueDate ||
            null,
          expiryDate,
          documentReference ||
            null,
          documentFile,
          remarks ||
            null,
          id,
        ],
        (
          err,
          result
        ) => {
          if (
            err
          ) {
            console.error(
              "Update document error:",
              err
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to update document",
              });
          }

          if (
            result.affectedRows ===
            0
          ) {
            return res
              .status(404)
              .json({
                message:
                  "Document not found",
              });
          }

          addDocumentAuditLog(
            req.user.id,
            "Updated vehicle document",
            id,
            documentType
          );

          return res.json({
            message:
              "Vehicle document updated successfully",
          });
        }
      );
    }
  );
};

/* =========================
   DELETE DOCUMENT
   ADMINISTRATOR ONLY
========================= */

export const deleteDocument = (
  req,
  res
) => {
  const {
    id,
  } =
    req.params;

  if (
    !id ||
    Number.isNaN(
      Number(
        id
      )
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid document ID",
      });
  }

  /*
    Read the record first.

    We need:
    - uploaded file name
    - document type
    - vehicle details
    - Audit Log information
  */

  const findSql = `
    SELECT
      d.id,
      d.vehicle_id,
      d.document_type,
      d.document_number,
      d.document_reference,
      d.document_file,
      d.expiry_date,

      v.registration_no,
      v.vehicle_name

    FROM vehicle_documents d

    LEFT JOIN vehicles v
      ON d.vehicle_id = v.id

    WHERE d.id = ?

    LIMIT 1
  `;

  db.query(
    findSql,
    [
      id,
    ],
    (
      findErr,
      results
    ) => {
      if (
        findErr
      ) {
        console.error(
          "Find document before delete error:",
          findErr
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to delete document",
          });
      }

      if (
        results.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Document not found",
          });
      }

      const document =
        results[0];

      const deleteSql = `
        DELETE FROM vehicle_documents
        WHERE id = ?
      `;

      db.query(
        deleteSql,
        [
          id,
        ],
        (
          deleteErr,
          deleteResult
        ) => {
          if (
            deleteErr
          ) {
            console.error(
              "Delete document error:",
              deleteErr
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to delete document",
              });
          }

          if (
            deleteResult.affectedRows ===
            0
          ) {
            return res
              .status(404)
              .json({
                message:
                  "Document not found",
              });
          }

          /*
            Delete uploaded physical file.

            A document may only have a
            reference and no uploaded file,
            so this is optional.
          */

          if (
            document.document_file
          ) {
            const safeFileName =
              path.basename(
                document.document_file
              );

            const filePath =
              path.join(
                process.cwd(),
                "backend",
                "uploads",
                safeFileName
              );

            fs.unlink(
              filePath,
              (
                fileErr
              ) => {
                if (
                  fileErr &&
                  fileErr.code !==
                    "ENOENT"
                ) {
                  console.error(
                    "Delete document physical file error:",
                    fileErr
                  );
                }
              }
            );
          }

          const registrationNo =
            document.registration_no ||
            "Unknown Vehicle";

          const vehicleName =
            document.vehicle_name ||
            "";

          const number =
            document.document_number
              ? ` - ${document.document_number}`
              : "";

          const recordName =
            `${document.document_type}${number} - ${registrationNo}${
              vehicleName
                ? ` - ${vehicleName}`
                : ""
            }`;

          addDocumentAuditLog(
            req.user.id,
            "Deleted vehicle document",
            document.id,
            recordName
          );

          return res.json({
            message:
              "Vehicle document deleted successfully",

            deletedDocument: {
              id:
                Number(
                  document.id
                ),

              documentType:
                document.document_type,

              documentNumber:
                document.document_number,

              registrationNo:
                document.registration_no,

              fileDeleted:
                Boolean(
                  document.document_file
                ),
            },
          });
        }
      );
    }
  );
};