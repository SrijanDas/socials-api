const router = require("express").Router();
const Comment = require("../models/Comment");

// comment on a post
router.post("/new", async (req, res) => {
  try {
    // creating a new comment
    const newComment = new Comment(req.body);
    const savedComment = await newComment.save();

    res.status(200).json(savedComment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get all comments of a post
router.get("/:id/all", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id }); //find all comments of the post
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete a comment
router.delete("/:id", async (req, res) => {
  try {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);
    if (!deletedComment.parentId !== null) {
      await Comment.deleteMany({ postId: deletedComment.parentId });
    }
    res.status(200).json("deleted comment");
  } catch (err) {
    res.status(500).json(err);
  }
});

// edit a comment
router.put("/:id", async (req, res) => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id, //find the comment by id
      req.body, //update the comment with the new body
      { new: true } //return the updated comment
    );
    res.status(200).json(updatedComment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// like  or dislike a comment
router.put("/:id/like", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment.likes.includes(req.body.userId)) {
      const updatedComment = await comment.updateOne(
        {
          $push: { likes: req.body.userId },
        },
        { timestamps: false }
      );
      res.status(200).json("you liked this comment");
    } else {
      const updatedComment = await comment.updateOne(
        {
          $pull: { likes: req.body.userId },
        },
        { timestamps: false }
      );
      res.status(200).json("you disliked this comment");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
