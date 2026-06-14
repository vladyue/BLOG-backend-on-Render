import { body } from 'express-validator';

//  Валидация регистрации пользователя
export const registerValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 5 }),
    body('fullName', 'Имя должно быть минимум 3 символа').isLength({ min: 3 }),
    body('avatarUrl', "Неверная ссылка на аватарку").optional()
];

//  Валидация авторизации пользователя
export const loginValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 5 })
];

//  Валидация создания статьи
export const postCreateValidation = [
    body('title', 'Введите заголовок статьи').isLength({ min: 3 }).isString(),
    body('text', 'Введите текст статьи').isLength({ min: 5 }).isString(),
    body('tags', 'Неверный формат тегов').optional().isArray(),
    body('imageUrl', "Неверная ссылка на изображение").optional().isString()
];

//  Валидация комментария
export const commentValidation = [
    body('commentText', 'Напишите текст комментария').isLength({ min: 1 }).isString()
];