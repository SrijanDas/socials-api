const router = require("express").Router();
const { paginatedResults } = require("../middlewares/paginatedResults");
const Post = require("../models/Post");
const User = require("../models/User");

//create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    await post.deleteOne();
    res.status(200).json("the post has been deleted");
    // if (post.userId === req.body.userId) {
    //   await post.deleteOne();
    //   res.status(200).json("the post has been deleted");
    // } else {
    //   res.status(403).json("you can delete only your post");
    // }
  } catch (err) {
    res.status(500).json(err);
  }
});

//like / dislike a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// share a post
router.post("/:id/share", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const newPost = new Post({
      userId: req.body.userId,
      shared: post._id,
    });
    await newPost.save();
    return res.json({ success: true });
  } catch (err) {
    return res.json({ success: false });
  }
});

// get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 1;

  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.connections.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    const results = paginatedResults(
      userPosts.concat(...friendPosts),
      page,
      limit
    );
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get user's all posts
router.get("/profile/:id", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const posts = await Post.find({ userId: req.params.id });
    const results = paginatedResults(posts, page, limit);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
