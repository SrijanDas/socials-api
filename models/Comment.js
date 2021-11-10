const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    parentId: {
      type: String || null,
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
