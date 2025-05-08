const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Cấu hình từ biến môi trường
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload buffer lên Cloudinary (trả về Promise)
 * @param {Buffer} buffer - file từ multer.memoryStorage
 * @param {String} folder - thư mục upload
 * @returns {Promise<Object>} Cloudinary upload result
 */
module.exports = (
  buffer,
  folder = process.env.CLOUDINARY_UPLOAD_FOLDER
) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};
