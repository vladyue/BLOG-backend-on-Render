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