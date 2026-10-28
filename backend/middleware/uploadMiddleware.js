import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(
  process.cwd(),
  "backend",
  "uploads"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname);

    const safeName =
      `document-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, safeName);
  },
});

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, JPG and PNG files are allowed"
      ),
      false
    );
  }
};

const uploadDocument =
  multer({
    storage,
    fileFilter,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
  });

export default uploadDocument;