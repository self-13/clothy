const multer = require("multer");
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Multer setup (store in memory, not disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

async function imageUploadUtil(fileBuffer, originalName) {
  try {
    const result = await imagekit.upload({
      file: fileBuffer, // This should be the buffer directly
      fileName: originalName,
      folder: "clothy-uploads", // Optional: organize uploads
    });

    return result; // contains { url, fileId, etc. }
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = { upload, imageUploadUtil };