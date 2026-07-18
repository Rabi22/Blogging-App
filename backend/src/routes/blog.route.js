import express from 'express';
import { addBlog, addComment, deleteBlogById, getAllBlogs, getBlogById, getBlogComment, getMyBlogs, togglePublish } from '../controllers/blog.controller.js';
import upload from '../middleware/multer.js';
import userAuthMiddleware from '../middleware/userAuth.middleware.js';
import adminOnly from '../middleware/adminOnly.middleware.js';

const blogRouter = express.Router()

blogRouter.post("/add", userAuthMiddleware, upload.any(), addBlog);
blogRouter.get("/all",getAllBlogs);
blogRouter.get("/my-blogs", userAuthMiddleware, getMyBlogs);
blogRouter.get("/:blogId",getBlogById);
blogRouter.post("/delete/:blogId",userAuthMiddleware,adminOnly,deleteBlogById);
blogRouter.post("/toggle-publish",userAuthMiddleware,adminOnly,togglePublish);
blogRouter.post("/add-comment",addComment);
blogRouter.post("/comments",getBlogComment);

export default blogRouter;