const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

const uploadRoot = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');
const maxMb = Number(process.env.UPLOAD_MAX_SIZE_MB) || 5;

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const storage = isCloudinaryConfigured() ? multer.memoryStorage() : localStorage;

function createUploader(fileFilter) {
  return multer({
    storage,
    limits: { fileSize: maxMb * 1024 * 1024 },
    fileFilter,
  });
}

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(value || '');
}

function localPublicUrl(file) {
  return `/uploads/${path.basename(file.path)}`;
}

function cloudinaryFolder(folder) {
  const root = process.env.CLOUDINARY_FOLDER || 'scee';
  return `${root}/${folder}`.replace(/\/+/g, '/');
}

function uploadBuffer(file, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: cloudinaryFolder(folder),
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });
}

async function persistUploadedFile(file, folder = 'uploads') {
  if (!isCloudinaryConfigured()) {
    return {
      ...file,
      url: localPublicUrl(file),
      storedName: path.basename(file.path),
    };
  }

  if (!file.buffer) {
    throw new Error('Cloudinary upload requires an in-memory file buffer');
  }

  const uploaded = await uploadBuffer(file, folder);
  return {
    ...file,
    url: uploaded.secure_url,
    storedName: uploaded.secure_url,
    cloudinaryPublicId: uploaded.public_id,
    cloudinaryResourceType: uploaded.resource_type,
  };
}

async function deleteUploadedFile(value) {
  if (!value || isRemoteUrl(value)) return;
  const diskPath =
    value.startsWith('/uploads/') || value.startsWith('uploads/')
      ? path.join(uploadRoot, path.basename(value))
      : path.isAbsolute(value)
        ? value
        : path.join(uploadRoot, path.basename(value));
  try {
    await fsPromises.unlink(diskPath);
  } catch {
    /* ignore missing local file */
  }
}

module.exports = {
  createUploader,
  deleteUploadedFile,
  isCloudinaryConfigured,
  isRemoteUrl,
  persistUploadedFile,
  uploadRoot,
};
