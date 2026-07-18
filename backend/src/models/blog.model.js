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
  description: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    default: null
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
