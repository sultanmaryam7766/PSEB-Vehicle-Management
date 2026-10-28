import bcrypt from "bcrypt";
import db from "./db.js";

const createOrResetAdmin = async () => {
  try {
    const name = "PSEB Administrator";
    const email = "admin@pseb.org.pk";
    const password = "Admin@123";
    const role = "Administrator";
    const department = "Administration";

    const hashedPassword = await bcrypt.hash(password, 10);

    const checkSql =
      "SELECT id FROM users WHERE email = ? LIMIT 1";

    db.query(checkSql, [email], (checkErr, results) => {
      if (checkErr) {
        console.error("Admin check failed:", checkErr.message);
        process.exit();
      }

      if (results.length > 0) {
        const updateSql = `
          UPDATE users
          SET
            name = ?,
            password = ?,
            role = ?,
            department = ?,
            status = ?
          WHERE email = ?
        `;

        db.query(
          updateSql,
          [
            name,
            hashedPassword,
            role,
            department,
            "Active",
            email,
          ],
          (updateErr) => {
            if (updateErr) {
              console.error(
                "Admin update failed:",
                updateErr.message
              );
              process.exit();
            }

            console.log("Administrator updated successfully");
            console.log("Email: admin@pseb.org.pk");
            console.log("Password: Admin@123");

            process.exit();
          }
        );

        return;
      }

      const insertSql = `
        INSERT INTO users
        (name, email, password, role, department, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          name,
          email,
          hashedPassword,
          role,
          department,
          "Active",
        ],
        (insertErr) => {
          if (insertErr) {
            console.error(
              "Admin creation failed:",
              insertErr.message
            );
            process.exit();
          }

          console.log("Administrator created successfully");
          console.log("Email: admin@pseb.org.pk");
          console.log("Password: Admin@123");

          process.exit();
        }
      );
    });
  } catch (error) {
    console.error(error);
    process.exit();
  }
};

createOrResetAdmin();