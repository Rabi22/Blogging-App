import express from 'express';
import { addBlog, addComment, deleteBlogById, getAllBlogs, getBlogById, getBlogComment, togglePublish } from '../controllers/blog.controller.js';
import upload from '../middleware/multer.js';
import userAuthMiddleware from '../middleware/userAuth.middleware.js';

const blogRouter = express.Router()

blogRouter.post("/add", userAuthMiddleware, upload.any(), addBlog);
blogRouter.get("/all",getAllBlogs);
blogRouter.get("/:blogId",getBlogById);
blogRouter.post("/delete/:blogId",userAuthMiddleware,deleteBlogById);
blogRouter.post("/toggle-publish",userAuthMiddleware,togglePublish);
blogRouter.post("/add-comment",addComment);
blogRouter.post("/comments",getBlogComment);

export default blogRouter;