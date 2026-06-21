import CommentModel from '../models/comment.js';

//  post/addComment
export const addComment = async (req, res) => {
    try {
        const doc = new CommentModel({
            commentText: req.body.commentText,
            userId: req.body.userId,
            postId: req.body.postId
        });

        const comment = await doc.save();
        
        res.json(comment);
        
    } catch(err) {
        console.log(err);

        res.status(500).json({
            message: 'Не удалось создать комментарий'
        });
    }
};


//  Получение комментариев для полного поста (FullPost)
export const getCommentsOnePost = async (postId) => {
    try {
        const comments = await CommentModel.find({ postId }).populate('userId').exec();
       
        return comments;
    } catch(err) {
        console.log(err);

        return [];
    }
};


//  Получение количества комментариев к посту
export const commentsCount = async (postsId) => {
    try {
        const postCommentsCount = await CommentModel.aggregate([
            {
                $match: {
                    postId: {$in: postsId}
                }
            },
            {
                $group: {
                    _id: '$postId',
                    count: {$sum: 1}
                }
            }
        ]);

        return postCommentsCount;
        
    } catch(err) {
        console.log(err);
        return [];
    }
};

//  Удаление комментария
export const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'Не авторизован'
            });
        }

        const comment = await CommentModel.findById(commentId).populate('userId').exec();

        if (!comment) {
            return res.status(404).json({
                message: 'Комментарий не найден'
            });
        }

        if (comment.userId._id.toString() !== userId) {
            return res.status(403).json({
                message: 'У вас нет прав на удаление этого комментария'
            });
        }

        const doc = await CommentModel.findByIdAndDelete(commentId);

        if (!doc) {
            return res.status(404).json({
                message: 'Не удалось удалить комментарий'
            });
        }

        console.log('Комментарий удален:', doc);

        return res.json({
            success: true,
            message: 'Комментарий успешно удален'
        });

    } catch(err) {
        console.log('Ошибка удаления комментария:', err);
        return res.status(500).json({
            message: 'Не удалось удалить комментарий'
        });
    }
};

//  Удаление комментариев удаляемого поста
export const deleteCommentsByPostId = async (postId) => {
    try {

        const result = await CommentModel.deleteMany({ postId: postId });

        return {
            success: true,
            deletedCount: result.deletedCount
        };

    } catch (error) {

        console.log('Ошибка при удалении комментариев:', error);
        throw new Error('Не удалось удалить комментарии');
    
    }
};
