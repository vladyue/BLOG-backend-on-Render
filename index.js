import './preload.js';
import express from 'express';
import mongoose from 'mongoose';
import { registerValidation, loginValidation, postCreateValidation, commentValidation } from './validations.js';
import { checkAuthorization, handleValidationErrors } from './utils/index.js';
import { postController, userController, commentController } from './controllers/index.js';
import multer from 'multer';
import cors from 'cors';


const MONGODB_URI = process.env.MONGODB_URI;

mongoose
    .connect(MONGODB_URI)
    .then(() => {console.log('MongoDB OK!')})
    .catch(((err) => {console.log('MongoDB error!', err)}));

const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

const PORT = 4444;

//  Обработчик сохранения изображения поста
const storagePost = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/post');
    },
    filename: (req, file, cb) => {
        const imageName = file.originalname;
        cb(null, imageName);
    }
});

//  Обработчик сохранения изображения аватара
const storageAvatar = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatar');
    },
    filename: (req, file, cb) => {
        const imageName = file.originalname;
        cb(null, imageName);
    }
});

const uploadPostImg = multer({ storage: storagePost });
const uploadAvatarImg = multer({ storage: storageAvatar });

app.post('/upload/post', checkAuthorization, uploadPostImg.single('image'), (req, res) => {
    res.json({
        url: `/uploads/post/${req.file.originalname}`
    });
});

app.post('/upload/avatar', uploadAvatarImg.single('image'), (req, res) => {
    res.json({
        url: `/uploads/avatar/${req.file.originalname}`
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

    console.log('Server OK');
});