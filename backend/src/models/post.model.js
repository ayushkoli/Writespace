import mongoose from "mongoose";

// Embedded → stored inside Post (not separate collection)
const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },
        
        writtenBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // link comment → user
            required: true,
        },
    },
    { timestamps: true }
);

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, // every post must have an owner
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                // store users → not count (helps toggle like/unlike)
            },
        ],

        image: {
            type: String,
            default: "", // store URL, not file
        },

        comments: [commentSchema], // embedded → fast read

        saves: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                // same logic as likes
            },
        ],

        color: {
            type: String,
            default: "default",
        },
    },
    { timestamps: true } // adds createdAt, updatedAt
);

export const Post = mongoose.model("Post", postSchema);