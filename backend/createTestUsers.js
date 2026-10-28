import bcrypt from "bcrypt";
import db from "./db.js";

const createUser = async (name, email, password, role, department) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO users
    (name, email, password, role, department, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  return new Promise((resolve) => {
    db.query(
      sql,
      [name, email, hashedPassword, role, department, "Active"],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            console.log(`${role} user already exists`);
          } else {
            console.error(`${role} creation failed:`, err.message);
          }
          resolve();
          return;
        }

        console.log(`${role} user created successfully`);
        resolve();
      }
    );
  });
};

const createUsers = async () => {
  await createUser(
    "PSEB Operator",
    "operator@pseb.org.pk",
    "Operator@123",
    "Operator",
    "Operations"
  );

  await createUser(
    "PSEB Viewer",
    "viewer@pseb.org.pk",
    "Viewer@123",
    "Viewer",
    "Management"
  );

  console.log("");
  console.log("Operator:");
  console.log("operator@pseb.org.pk");
  console.log("Operator@123");

  console.log("");
  console.log("Viewer:");
  console.log("viewer@pseb.org.pk");
  console.log("Viewer@123");

  process.exit();
};

createUsers();