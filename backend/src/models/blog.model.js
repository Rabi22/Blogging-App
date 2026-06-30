import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  subTitle: {
    type: String,
    trim: true,
    maxlength: 300
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
