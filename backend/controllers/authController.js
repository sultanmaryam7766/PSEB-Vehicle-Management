import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";

/* LOGIN */

export const login = (
  req,
  res
) => {
  const email =
    req.body.email
      ?.trim()
      .toLowerCase();

  const password =
    req.body.password;

  if (!email || !password) {
    return res
      .status(400)
      .json({
        message:
          "Email and password are required",
      });
  }

  const sql = `
    SELECT
      id,
      name,
      email,
      password,
      role,
      department,
      status,
      token_version
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  db.query(
    sql,
    [email],
    async (err, results) => {
      if (err) {
        console.error(
          "Login database error:",
          err
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
          .status(401)
          .json({
            message:
              "Invalid email or password",
          });
      }

      const user =
        results[0];

      if (
        user.status !==
        "Active"
      ) {
        return res
          .status(403)
          .json({
            message:
              "Account is inactive",
          });
      }

      try {
        const match =
          await bcrypt.compare(
            password,
            user.password
          );

        if (!match) {
          return res
            .status(401)
            .json({
              message:
                "Invalid email or password",
            });
        }

        const token =
          jwt.sign(
            {
              id: user.id,

              tokenVersion:
                user.token_version,
            },

            process.env
              .JWT_SECRET,

            {
              expiresIn: "8h",
            }
          );

        return res.json({
          message:
            "Login successful",

          token,

          user: {
            id: user.id,

            name: user.name,

            email:
              user.email,

            role:
              user.role,

            department:
              user.department,
          },
        });
      } catch (bcryptError) {
        console.error(
          "Password verification error:",
          bcryptError
        );

        return res
          .status(500)
          .json({
            message:
              "Server error",
          });
      }
    }
  );
};

/* CHANGE OWN PASSWORD */

export const changePassword = (
  req,
  res
) => {
  const userId =
    req.user.id;

  const {
    currentPassword,
    newPassword,
  } = req.body;

  if (
    !currentPassword ||
    !newPassword
  ) {
    return res
      .status(400)
      .json({
        message:
          "Current password and new password are required",
      });
  }

  if (
    newPassword.length < 6
  ) {
    return res
      .status(400)
      .json({
        message:
          "New password must be at least 6 characters",
      });
  }

  const sql = `
    SELECT
      id,
      password
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  db.query(
    sql,
    [userId],
    async (err, results) => {
      if (err) {
        console.error(
          "Change password lookup error:",
          err
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

      const user =
        results[0];

      try {
        const passwordMatch =
          await bcrypt.compare(
            currentPassword,
            user.password
          );

        if (!passwordMatch) {
          return res
            .status(401)
            .json({
              message:
                "Current password is incorrect",
            });
        }

        const samePassword =
          await bcrypt.compare(
            newPassword,
            user.password
          );

        if (samePassword) {
          return res
            .status(400)
            .json({
              message:
                "New password must be different from current password",
            });
        }

        const hashedPassword =
          await bcrypt.hash(
            newPassword,
            10
          );

        /*
          token_version + 1
          means current JWT becomes
          invalid immediately.
        */

        const updateSql = `
          UPDATE users
          SET
            password = ?,
            token_version = token_version + 1
          WHERE id = ?
        `;

        db.query(
          updateSql,
          [
            hashedPassword,
            userId,
          ],
          (
            updateErr,
            result
          ) => {
            if (updateErr) {
              console.error(
                "Change password update error:",
                updateErr
              );

              return res
                .status(500)
                .json({
                  message:
                    "Unable to change password",
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

            return res.json({
              message:
                "Password changed successfully. Please sign in again.",
            });
          }
        );
      } catch (error) {
        console.error(
          "Change password error:",
          error
        );

        return res
          .status(500)
          .json({
            message:
              "Unable to change password",
          });
      }
    }
  );
};