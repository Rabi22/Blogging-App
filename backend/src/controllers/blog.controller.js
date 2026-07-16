import fs from 'fs'
import mongoose from 'mongoose';
import { toFile } from '@imagekit/nodejs';
import imagekit from '../config/imageKit.config.js';
import Blog from '../models/blog.model.js';
import Comment from '../models/comment.model.js';

export const addBlog = async(req,res)=>{
    const imageFile = req.file || req.files?.[0];
    let parsedBlog;

    try{
        parsedBlog = JSON.parse(req.body.blog);
    } catch {
        return res.status(400).json({
            message: "Invalid blog payload"
        });
    }

    try{
        const {title, subTitle = '', description, category, isPublished} = parsedBlog;

        if(!title || !description || !category || typeof isPublished !== 'boolean'){
            return res.status(400).json({
                message : "Please fill all required fields !"
            })
        }

        if (req.files?.length > 1) {
            return res.status(400).json({
                message: "Please upload only one image file."
            });
        }

        if (!imagekit) {
            return res.status(500).json({
                message: "ImageKit is not configured. Please set IMAGEKIT_PRIVATE_KEY."
            });
        }

        if (!imageFile || !imageFile.path) {
            return res.status(400).json({
                message: "No image file was uploaded."
            });
        }

        const fileBuffer = await fs.promises.readFile(imageFile.path);
        const response = await imagekit.files.upload({
            file: await toFile(fileBuffer, imageFile.originalname),
            fileName: imageFile.originalname
        });
        const imageKitFileId = response.fileId || response?.file?.fileId;

        // image properties
        const imageTransformation = imagekit.helper.buildSrc({
            urlEndpoint: 'https://ik.imagekit.io/your_imagekit_id',
            src: response.url,
            transformation: [
              {
                width: 400,
                height: 300,
                crop: 'maintain_ratio',
                quality: "auto",
                format: 'webp',
              },          
            ],
        })  

        try {
            await Blog.create({
                title,
                subTitle: subTitle?.trim() || '',
                description: description?.trim() || '',
                category,
                image: response.url,
                isPublished
            })
            return res.status(200).json({message: "Blog created successfully"})
        } catch (createErr) {
            if (imageKitFileId) {
                try {
                    await imagekit.files.delete(imageKitFileId);
                } catch (deleteErr) {
                    console.error("ImageKit cleanup failed : ", deleteErr);
                }
            }
            throw createErr;
        }
    }catch(err){
        console.error("Blog creation error : ",err);
        return res.status(500).json({
            message: err?.message || "Failed to create blog"
        });
    } finally {
        if (imageFile?.path) {
            try {
                await fs.promises.rm(imageFile.path, { force: true });
            } catch (cleanupErr) {
                console.error("Blog upload cleanup failed : ", cleanupErr);
            }
        }
    }
}

export const getAllBlogs = async(req,res)=>{
    try{
        const blogs = await Blog.find({isPublished:true})
        res.json({success:true,blogs})
    }catch(err){
        res.status(500).json({success:false,message:err})
    }
}

export const getBlogById = async(req,res)=>{
    try{
        const {blogId} = req.params;
        const blog = await Blog.findOne({ _id: blogId, isPublished: true })

        if(!blog){
            return res.json({message:"Blog not found !"})
        }
        res.json({blog});
    }catch(err){
        res.json(err)
    }
}

export const deleteBlogById = async(req,res)=>{
    let session;

    try{
        const blogId = req.params.blogId || req.params.id;
        session = await mongoose.startSession();
        session.startTransaction();

        await Blog.findByIdAndDelete(blogId, { session });
        await Comment.deleteMany({blog: blogId}, { session });

        await session.commitTransaction();
        res.json({message: "Blog deleted successfully !"});
    }catch(err){
        if (session?.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("Blog Deletion error:",err);
        return res.status(500).json({message:"Failed to delete blog"})
    } finally {
        if (session) {
            await session.endSession();
        }
    }
}

export const togglePublish = async (req,res)=>{
    try{
        const {id}=req.body;
        const blog = await Blog.findById(id);
        blog.isPublished = !blog.isPublished;
        await blog.save();
        res.json({message: "Publish status updated",blog});
    }catch(err){
        res.json(err)
    }
}

export const addComment = async(req,res)=>{
    try{
        const {blog,name,content} = req.body;
        const existingBlog = await Blog.findOne({ _id: blog, isPublished: true });

        if (!existingBlog) {
            return res.status(404).json({ message: "Blog not found !" });
        }

        await Comment.create({blog,name,content})
        res.json({message:'Comment added for review'})
    }catch(err){
        res.json({message:err.message})
    }
}

export const getBlogComment = async(req,res)=>{
    try{
        const {blogId} = req.body;
        const comments = await Comment.find({blog:blogId,isApproved:true})
        res.json({success:true,comments})
    }catch(err){
        res.json({message:err.message})
    }
}