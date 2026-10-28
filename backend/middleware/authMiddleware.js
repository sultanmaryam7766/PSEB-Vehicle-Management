import jwt from "jsonwebtoken";
import db from "../db.js";

const authMiddleware = (req, res, next) => {
  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith(
      "Bearer "
    )
  ) {
    return res.status(401).json({
      message:
        "Access denied. No token provided.",
    });
  }

  const token =
    authHeader.split(" ")[1];

  try {
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    const sql = `
      SELECT
        id,
        name,
        email,
        role,
        department,
        status,
        token_version
      FROM users
      WHERE id = ?
      LIMIT 1
    `;

    db.query(
      sql,
      [decoded.id],
      (err, results) => {
        if (err) {
          console.error(
            "Auth database error:",
            err
          );

          return res
            .status(500)
            .json({
              message:
                "Authentication server error",
            });
        }

        if (
          results.length === 0
        ) {
          return res
            .status(401)
            .json({
              message:
                "User account no longer exists.",
            });
        }

        const user =
          results[0];

        if (
          user.status !==
          "Active"
        ) {
          return res
            .status(401)
            .json({
              message:
                "Account is inactive.",
            });
        }

        if (
          Number(
            decoded.tokenVersion
          ) !==
          Number(
            user.token_version
          )
        ) {
          return res
            .status(401)
            .json({
              message:
                "Your session is no longer valid. Please sign in again.",
            });
        }

        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department:
            user.department,
          status: user.status,
          tokenVersion:
            user.token_version,
        };

        next();
      }
    );
  } catch (error) {
    return res.status(401).json({
      message:
        "Invalid or expired token.",
    });
  }
};

export default authMiddleware;