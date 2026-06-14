import mongoose from "mongoose";

const CommentSchema = mongoose.Schema({
    commentText: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model("Comment", CommentSchema);