import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'File too large. Maximum size is 5MB.' });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file field.' });
    }

    return res.status(400).json({ message: 'File upload failed.' });
  }

  if (err) {
    return next(err);
  }

  return next();
};

export const uploadSingleImage = (req, res, next) => upload.single("image")(req, res, (err) => handleUploadError(err, req, res, next));
export const uploadSingleFile = (req, res, next) => upload.single("file")(req, res, (err) => handleUploadError(err, req, res, next));

export default upload;
