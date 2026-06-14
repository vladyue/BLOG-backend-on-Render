import './preload.js';
import express from 'express';
import mongoose from 'mongoose';
import { registerValidation, loginValidation, postCreateValidation, commentValidation } from './validations.js';
import { checkAuthorization, handleValidationErrors } from './utils/index.js';
import { postController, userController, commentController } from './controllers/index.js';
import multer from 'multer';
import cors from 'cors';
import { upload } from './cloudinaryConfig.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose
    .connect(MONGODB_URI)
    .then(() => {console.log('MongoDB OK!')})
    .catch(((err) => {console.log('MongoDB error!', err)}));

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4444;

// Один универсальный эндпоинт для загрузки всех изображений
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
    }
    
    res.json({
        url: req.file.path  // Cloudinary возвращает прямую URL-ссылку
    });
});

//  userController
app.post('/auth/register', registerValidation, handleValidationErrors, userController.register);
app.post('/auth/login', loginValidation, handleValidationErrors, userController.login);
app.get('/auth/authorization', checkAuthorization, userController.getMe);
app.patch('/auth', checkAuthorization, userController.updateUserAvatar);

//  postController
app.get('/posts', postController.getAll);
app.get('/posts/:id', postController.getOne);
app.post('/posts', checkAuthorization, postCreateValidation, handleValidationErrors, postController.create);
app.delete('/posts/:id', checkAuthorization, postController.remove)
app.patch('/posts/:id', checkAuthorization, postCreateValidation, handleValidationErrors, postController.update)
app.get('/tags', postController.getTags);
app.get('/posts/:id/edit', postController.getEdit);

//  commentController
app.post('/addComment', checkAuthorization, commentValidation, handleValidationErrors, commentController.addComment);

app.listen(PORT, err => {
    if(err) {
        return console.log(err);
    }

    console.log(`Server OK on port ${PORT}`);
});