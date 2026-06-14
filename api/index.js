import './preload.js';
import express from 'express';
import mongoose from 'mongoose';
import { registerValidation, loginValidation, postCreateValidation, commentValidation } from '../validations.js';
import { checkAuthorization, handleValidationErrors } from '../utils/index.js';
import { postController, userController, commentController } from '../controllers/index.js';
import multer from 'multer';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  await mongoose.connect('mongodb+srv://vladnimbus3_db_user:w3u6z1rXdLiA9Ny6@cluster0.b9q2gee.mongodb.net/blog?appName=Cluster0');
  cachedDb = mongoose.connection;
  console.log('MongoDB OK!');
  return cachedDb;
}

// Middleware
app.use(express.json());
app.use(cors());

// Настройка multer для временного хранения в памяти (не на диск)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB лимит
});

// Функция загрузки в Cloudinary
async function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
}

// Загрузка изображения для поста
app.post('/upload/post', checkAuthorization, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const result = await uploadToCloudinary(req.file.buffer, 'blog/posts');
    
    res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Загрузка аватара
app.post('/upload/avatar', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const result = await uploadToCloudinary(req.file.buffer, 'blog/avatars');
    
    res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// userController
app.post('/auth/register', registerValidation, handleValidationErrors, userController.register);
app.post('/auth/login', loginValidation, handleValidationErrors, userController.login);
app.get('/auth/authorization', checkAuthorization, userController.getMe);
app.patch('/auth', checkAuthorization, userController.updateUserAvatar);

// postController
app.get('/posts', postController.getAll);
app.get('/posts/:id', postController.getOne);
app.post('/posts', checkAuthorization, postCreateValidation, handleValidationErrors, postController.create);
app.delete('/posts/:id', checkAuthorization, postController.remove);
app.patch('/posts/:id', checkAuthorization, postCreateValidation, handleValidationErrors, postController.update);
app.get('/tags', postController.getTags);
app.get('/posts/:id/edit', postController.getEdit);

// commentController
app.post('/addComment', checkAuthorization, commentValidation, handleValidationErrors, commentController.addComment);

// Экспорт serverless функции
export default async function handler(req, res) {
  await connectToDatabase();
  app(req, res);
}