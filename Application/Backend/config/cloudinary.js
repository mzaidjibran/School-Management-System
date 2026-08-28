import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a buffer directly to Cloudinary using upload_stream
 * @param {Buffer} fileBuffer - The in-memory file buffer from multer
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadStreamToCloudinary = (fileBuffer, folder = "school_system") => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return reject(
        new Error(
          "Cloudinary credentials missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env"
        )
      );
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `school_management/${folder}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Stream Error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
