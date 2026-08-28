import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadStreamToCloudinary } from "../config/cloudinary.js";

// Ensure local fallback folder exists if needed
const uploadDir = "public/image";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// In-memory storage for Cloudinary streaming
const memoryStorage = multer.memoryStorage();

// Disk storage fallback
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];
  if (allowed.includes(file.mimetype) || (file.mimetype && file.mimetype.startsWith("image/"))) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP, and image files are allowed"), false);
  }
};

const multerMemory = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const multerDisk = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * Universal upload middleware that uploads to Cloudinary (with fallback to local storage).
 * Provides .single(fieldName) to maintain drop-in compatibility with existing routes.
 */
export const upload = {
  single: (fieldName) => {
    return async (req, res, next) => {
      const isCloudinaryConfigured = Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      );

      if (isCloudinaryConfigured) {
        multerMemory.single(fieldName)(req, res, async (err) => {
          if (err) {
            return res.status(400).json({ success: false, error: true, message: err.message });
          }
          if (!req.file) {
            return next();
          }

          try {
            // Determine subfolder based on fieldName
            let folder = "uploads";
            if (fieldName === "profileImage") folder = "profiles";
            else if (fieldName === "schoolLogo") folder = "logos";

            const result = await uploadStreamToCloudinary(req.file.buffer, folder);

            req.file.path = result.secure_url;
            req.file.secure_url = result.secure_url;
            req.file.url = result.secure_url;
            req.file.public_id = result.public_id;
            next();
          } catch (uploadError) {
            console.error("Cloudinary upload failed:", uploadError);
            return res.status(500).json({
              success: false,
              error: true,
              message: "Cloudinary upload error: " + (uploadError.message || uploadError),
            });
          }
        });
      } else {
        // Fallback to local storage if Cloudinary credentials are not set
        multerDisk.single(fieldName)(req, res, (err) => {
          if (err) {
            return res.status(400).json({ success: false, error: true, message: err.message });
          }
          if (req.file) {
            req.file.path = `/image/${req.file.filename}`;
            req.file.secure_url = `/image/${req.file.filename}`;
          }
          next();
        });
      }
    };
  },
  array: (fieldName, maxCount) => {
    return (req, res, next) => {
      multerDisk.array(fieldName, maxCount)(req, res, next);
    };
  },
  fields: (fieldsArray) => {
    return (req, res, next) => {
      multerDisk.fields(fieldsArray)(req, res, next);
    };
  },
};