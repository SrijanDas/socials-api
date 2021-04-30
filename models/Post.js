import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  userId: {
    type: String,
    requied: true,
  },
});

export default mongoose.model("Post", PostSchema);
