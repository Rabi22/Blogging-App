import fs from 'fs'
import { toFile } from '@imagekit/nodejs';
import imagekit from '../config/imageKit.config.js';
import Blog from '../models/blog.model.js';
import Comment from '../models/comment.model.js';

export const addBlog = async(req,res)=>{
    try{
        const {title,subTitle,description,category,isPublished} = JSON.parse(req.body.blog);
        const imageFile = req.file || req.files?.[0];

        if(!title||!subTitle||!description||!category||!isPublished){
            return res.status(400).json({
                message : "Please fill all fields !"
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

        await Blog.create({
            title,
            subTitle,
            description,
            category,
            image: response.url,
            isPublished
        })
        res.status(200).json({message: "Blog created successfully"})

    }catch(err){
        console.error("Blog creation error : ",err);
        return res.status(500).json({
            message: err?.message || "Failed to create blog"
        });
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
        const blog = await Blog.findById(blogId)

        if(!blog){
            return res.json({message:"Blog not found !"})
        }
        res.json({blog});
    }catch(err){
        res.json(err)
    }
}

export const deleteBlogById = async(req,res)=>{
    try{
        const {id} = req.params;
        await Blog.findByIdAndDelete(id)
        await Comment.deleteMany({blog:id})
        res.json({message: "Blog deleted successfully !"});
    }catch(err){
        res.json(err)
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