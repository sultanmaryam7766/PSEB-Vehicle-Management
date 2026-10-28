import bcrypt from "bcrypt";
import db from "../db.js";

/* AUDIT LOG HELPER */

const addAuditLog = (
  actorUserId,
  action,
  module,
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
      if (actorErr) {
        console.error(
          "Audit actor error:",
          actorErr
        );

        return;
      }

      const actorName =
        actorResults.length >
        0
          ? actorResults[0]
              .name
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
          module,
          recordId || null,
          recordName || null,
        ],
        (auditErr) => {
          if (auditErr) {
            console.error(
              "Audit log error:",
              auditErr
            );
          }
        }
      );
    }
  );
};

/* CREATE USER */

export const createUser =
  async (req, res) => {
    try {
      let {
        name,
        email,
        password,
        department,
        role,
      } = req.body;

      name = name?.trim();

      email = email
        ?.trim()
        .toLowerCase();

      if (
        !name ||
        !email ||
        !password ||
        !role
      ) {
        return res
          .status(400)
          .json({
            message:
              "Name, email, password and role are required",
          });
      }

      if (
        password.length < 6
      ) {
        return res
          .status(400)
          .json({
            message:
              "Password must be at least 6 characters",
          });
      }

      const allowedRoles = [
        "Administrator",
        "Operator",
        "Viewer",
      ];

      if (
        !allowedRoles.includes(
          role
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid role",
          });
      }

      const checkSql = `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
      `;

      db.query(
        checkSql,
        [email],
        async (
          checkErr,
          results
        ) => {
          if (checkErr) {
            console.error(
              checkErr
            );

            return res
              .status(500)
              .json({
                message:
                  "Server error",
              });
          }

          if (
            results.length > 0
          ) {
            return res
              .status(409)
              .json({
                message:
                  "A user with this email already exists",
              });
          }

          try {
            const hashedPassword =
              await bcrypt.hash(
                password,
                10
              );

            const sql = `
              INSERT INTO users
              (
                name,
                email,
                password,
                role,
                department,
                status,
                token_version
              )
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
              sql,
              [
                name,
                email,
                hashedPassword,
                role,
                department ||
                  null,
                "Active",
                0,
              ],
              (
                err,
                result
              ) => {
                if (err) {
                  console.error(
                    err
                  );

                  return res
                    .status(500)
                    .json({
                      message:
                        "Unable to create user",
                    });
                }

                addAuditLog(
                  req.user.id,
                  "Created user",
                  "Users & Roles",
                  result.insertId,
                  name
                );

                return res
                  .status(201)
                  .json({
                    message:
                      "User created successfully",

                    user: {
                      id:
                        result.insertId,

                      name,

                      email,

                      department:
                        department ||
                        null,

                      role,

                      status:
                        "Active",
                    },
                  });
              }
            );
          } catch (error) {
            console.error(
              error
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to create user",
              });
          }
        }
      );
    } catch (error) {
      console.error(error);

      return res
        .status(500)
        .json({
          message:
            "Server error",
        });
    }
  };

/* GET USERS */

export const getUsers = (
  req,
  res
) => {
  const sql = `
    SELECT
      id,
      name,
      email,
      role,
      department,
      status
    FROM users
    ORDER BY id DESC
  `;

  db.query(
    sql,
    (err, results) => {
      if (err) {
        console.error(err);

        return res
          .status(500)
          .json({
            message:
              "Unable to load users",
          });
      }

      return res.json({
        users: results,
      });
    }
  );
};

/* UPDATE USER */

export const updateUser = (
  req,
  res
) => {
  const { id } =
    req.params;

  let {
    name,
    email,
    department,
    role,
  } = req.body;

  name = name?.trim();

  email = email
    ?.trim()
    .toLowerCase();

  if (
    !name ||
    !email ||
    !role
  ) {
    return res
      .status(400)
      .json({
        message:
          "Name, email and role are required",
      });
  }

  const allowedRoles = [
    "Administrator",
    "Operator",
    "Viewer",
  ];

  if (
    !allowedRoles.includes(
      role
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid role",
      });
  }

  /*
    Prevent current Administrator
    from changing their own role
    accidentally.
  */

  if (
    Number(id) ===
      Number(req.user.id) &&
    role !==
      "Administrator"
  ) {
    return res
      .status(400)
      .json({
        message:
          "You cannot remove your own Administrator role.",
      });
  }

  const findSql = `
    SELECT
      name,
      email,
      role,
      department
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  db.query(
    findSql,
    [id],
    (
      findErr,
      results
    ) => {
      if (findErr) {
        console.error(
          findErr
        );

        return res
          .status(500)
          .json({
            message:
              "Server error",
          });
      }

      if (
        results.length === 0
      ) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      const existingUser =
        results[0];

      const roleChanged =
        existingUser.role !==
        role;

      /*
        Only role change needs to
        invalidate existing sessions.
      */

      const sql = roleChanged
        ? `
          UPDATE users
          SET
            name = ?,
            email = ?,
            department = ?,
            role = ?,
            token_version = token_version + 1
          WHERE id = ?
        `
        : `
          UPDATE users
          SET
            name = ?,
            email = ?,
            department = ?,
            role = ?
          WHERE id = ?
        `;

      db.query(
        sql,
        [
          name,
          email,
          department || null,
          role,
          id,
        ],
        (
          err,
          result
        ) => {
          if (err) {
            if (
              err.code ===
              "ER_DUP_ENTRY"
            ) {
              return res
                .status(409)
                .json({
                  message:
                    "Email already exists",
                });
            }

            console.error(
              err
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to update user",
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
                  "User not found",
              });
          }

          addAuditLog(
            req.user.id,
            roleChanged
              ? "Updated user and changed role"
              : "Updated user",
            "Users & Roles",
            id,
            name
          );

          return res.json({
            message:
              roleChanged
                ? "User updated successfully. Existing sessions for this user have been signed out."
                : "User updated successfully",
          });
        }
      );
    }
  );
};

/* UPDATE STATUS */

export const updateUserStatus = (
  req,
  res
) => {
  const { id } =
    req.params;

  const { status } =
    req.body;

  const allowedStatuses = [
    "Active",
    "Inactive",
  ];

  if (
    !allowedStatuses.includes(
      status
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid status",
      });
  }

  if (
    Number(id) ===
    Number(req.user.id)
  ) {
    return res
      .status(400)
      .json({
        message:
          "You cannot change the status of your own account.",
      });
  }

  const findSql = `
    SELECT
      name,
      status
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  db.query(
    findSql,
    [id],
    (
      findErr,
      users
    ) => {
      if (findErr) {
        console.error(
          findErr
        );

        return res
          .status(500)
          .json({
            message:
              "Server error",
          });
      }

      if (
        users.length === 0
      ) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      const targetName =
        users[0].name;

      if (
        users[0].status ===
        status
      ) {
        return res.json({
          message: `User is already ${status.toLowerCase()}`,
        });
      }

      /*
        Increment token_version
        whether activating or
        deactivating so old sessions
        never become valid again.
      */

      const sql = `
        UPDATE users
        SET
          status = ?,
          token_version = token_version + 1
        WHERE id = ?
      `;

      db.query(
        sql,
        [status, id],
        (
          err,
          result
        ) => {
          if (err) {
            console.error(
              err
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to update user status",
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
                  "User not found",
              });
          }

          const action =
            status === "Active"
              ? "Activated user"
              : "Deactivated user";

          addAuditLog(
            req.user.id,
            action,
            "Users & Roles",
            id,
            targetName
          );

          return res.json({
            message: `User ${status.toLowerCase()} successfully`,
          });
        }
      );
    }
  );
};

/* RESET PASSWORD */

export const resetUserPassword =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const { password } =
        req.body;

      if (!password) {
        return res
          .status(400)
          .json({
            message:
              "New password is required",
          });
      }

      if (
        password.length < 6
      ) {
        return res
          .status(400)
          .json({
            message:
              "Password must be at least 6 characters",
          });
      }

      if (
        Number(id) ===
        Number(req.user.id)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Use Change Password for your own account.",
          });
      }

      const findSql = `
        SELECT
          name,
          password
        FROM users
        WHERE id = ?
        LIMIT 1
      `;

      db.query(
        findSql,
        [id],
        async (
          findErr,
          users
        ) => {
          if (findErr) {
            console.error(
              findErr
            );

            return res
              .status(500)
              .json({
                message:
                  "Server error",
              });
          }

          if (
            users.length === 0
          ) {
            return res
              .status(404)
              .json({
                message:
                  "User not found",
              });
          }

          const targetName =
            users[0].name;

          try {
            const samePassword =
              await bcrypt.compare(
                password,
                users[0]
                  .password
              );

            if (samePassword) {
              return res
                .status(400)
                .json({
                  message:
                    "New password must be different from the current password.",
                });
            }

            const hashedPassword =
              await bcrypt.hash(
                password,
                10
              );

            /*
              Password reset also
              invalidates all existing
              sessions for target user.
            */

            const sql = `
              UPDATE users
              SET
                password = ?,
                token_version = token_version + 1
              WHERE id = ?
            `;

            db.query(
              sql,
              [
                hashedPassword,
                id,
              ],
              (
                err,
                result
              ) => {
                if (err) {
                  console.error(
                    err
                  );

                  return res
                    .status(500)
                    .json({
                      message:
                        "Unable to reset password",
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
                        "User not found",
                    });
                }

                addAuditLog(
                  req.user.id,
                  "Reset user password",
                  "Users & Roles",
                  id,
                  targetName
                );

                return res.json({
                  message:
                    "Password changed successfully. Existing sessions for this user have been signed out.",
                });
              }
            );
          } catch (error) {
            console.error(
              error
            );

            return res
              .status(500)
              .json({
                message:
                  "Unable to reset password",
              });
          }
        }
      );
    } catch (error) {
      console.error(error);

      return res
        .status(500)
        .json({
          message:
            "Server error",
        });
    }
  };