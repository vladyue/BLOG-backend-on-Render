import PostModel from '../models/post.js';
import { commentController } from './index.js';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

//  patch/posts/:id
export const update = async (req, res) => {
    try {
        const postId = req.params.id;

        const doc = await PostModel.updateOne(
            {
                _id: postId
            },
            {
                title: req.body.title,
                text: req.body.text,
                imageUrl: req.body.imageUrl,
                tags: req.body.tags,
                user: req.userId
            }
        );

        if(!doc.matchedCount) {
            console.log(doc);

            return res.status(500).json({
                message: 'Не удалось обновить статью'
            });
        }

        res.json({
            success: true
        });

    } catch(err) {
        console.log(err);

        res.status(500).json({
            message: 'Не удалось обновить статью'
        });
    }
};

//  delete/posts/:id
export const remove = async (req, res) => {
    try {
        const postId = req.params.id;

        const doc = await PostModel.findOneAndDelete(
            {
                _id: postId
            });

        if(!doc) {
            res.status(404).json({
                message: 'Не удалось удалить статью'
            })
        }

        res.json({
            success: true
        });

    } catch(err) {
        console.log(err);

        res.status(500).json({
            message: 'Не удалось удалить статью'
        });
    }
};

//  get/posts/:id
export const getOne = async (req, res) => {
    try {
        const postId = req.params.id;

        const document = await PostModel.findOneAndUpdate(
            {
                _id: postId
            },
            {
                $inc: { viewsCount: 1 }
            },
            {
                returnDocument: 'after'
            }).populate('user').exec();

            if(!document) {
                return res.status(404).json({
                    message: 'Статья не найдена'
                })
            }

            const comments = await commentController.getCommentsOnePost(req.params.id);

            const doc = document.toObject();
            
            doc.createdAt = format(new Date(doc.createdAt), "d MMMM yyyy 'год' HH:mm:ss", { locale: ru });

            res.json({
                doc,
                comments
            });
    } catch(err) {
        console.log(err);

        res.status(500).json({
            message: 'Не удалось получить статью'
        });
    }
};

//  get/posts
export const getAll = async (req, res) => {
    try {
        const posts = await PostModel.find().populate('user').sort({ createdAt: -1 }).exec();

        const postsId = posts.map((post) => (post._id));

        const postsCommentsCount = await commentController.commentsCount(postsId);

        if(postsCommentsCount.length === 0) {
            return res.json(posts);
        }

        const countMap = {};

        postsCommentsCount.forEach((obj) => {
            countMap[obj._id.toString()] = obj.count;
        });

        const result = posts.map((post) => {
            const postObj = post.toObject();
            postObj.commentsCount = countMap[post._id.toString()] || 0;

            postObj.createdAt = format(new Date(post.createdAt), "d MMMM yyyy 'год' HH:mm:ss", { locale: ru });

            return postObj;
        });
console.log(result)
        res.json(result);
    } catch(err) {
        console.log(err);

        res.status(500).json({
            message: 'Не удалось получить статьи'
        });
    }
};

export const getTags = async (req, res) => {
    try {
        const posts = await PostModel.find().limit(5).exec();

        console.log(posts);

        const tags = posts.map(obj => obj.tags).flat().slice(0, 5);

        res.json(tags);
    } catch(err) {
        console.log(err);

        res.status(500).json({
            message: 'Не удалось получить теги'
        });
    }
};

//  post/posts
export const create = async (req, res) => {
    try {
        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.userId
        });

        const post = await doc.save();

        res.json(post);
    } catch(err) {
        console.log(err);

        res.status(500).json({
            message: 'Не удалось создать статью'
        });
    }
};

//  get/posts/:id/edit
export const getEdit = async (req, res) => {
    try {
        const postId = req.params.id;

        const doc = await PostModel.findOneAndUpdate(
            {
                _id: postId
            },
            {
                returnDocument: 'after'
            }).populate('user').exec();

            if(!doc) {
                return res.status(404).json({
                    message: 'Статья не найдена'
                })
            }

            res.json(
                doc
            );
    } catch(err) {
        console.log(err);

        res.status(500).json({
            message: 'Не удалось получить статью'
        });
    }
};