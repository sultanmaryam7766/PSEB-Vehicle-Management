import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createConnection({
  host:
    process.env.MYSQLHOST ||
    process.env.DB_HOST,

  port:
    process.env.MYSQLPORT ||
    process.env.DB_PORT ||
    3306,

  user:
    process.env.MYSQLUSER ||
    process.env.DB_USER,

  password:
    process.env.MYSQLPASSWORD ||
    process.env.DB_PASSWORD,

  database:
    process.env.MYSQLDATABASE ||
    process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error(
      "Database connection failed:",
      err.message
    );

    return;
  }

  console.log(
    "MySQL database connected successfully"
  );
});

export default db;