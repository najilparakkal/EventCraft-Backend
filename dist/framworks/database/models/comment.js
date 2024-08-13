"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = exports.Reply = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const replySchema = new mongoose_1.Schema({
    commentId: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    likes: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});
const commentSchema = new mongoose_1.Schema({
    comment: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        ref: "Users",
        required: true,
    },
    postId: {
        type: String,
        ref: "Posts",
        required: true,
    },
    likes: {
        type: [String],
        default: [],
    },
    replies: [
        {
            type: String,
            ref: "Reply",
            default: [],
        },
    ],
}, {
    timestamps: true,
});
const Reply = mongoose_1.default.model("Reply", replySchema);
exports.Reply = Reply;
const Comment = mongoose_1.default.model("Comment", commentSchema);
exports.Comment = Comment;
