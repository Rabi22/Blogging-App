import Blog from "../models/blog.model.js";
import Comment from "../models/comment.model.js";

export const getAllBlogsAdmin = async(req,res)=>{
  try{
    const blogs = await Blog.find({}).sort({createdAt:-1});
    res.json({success:true,blogs})
  }catch(err){
    res.json({message:err})
  }
}

export const getAllComments = async(req,res)=>{
    try{
        const comments = await Comment.find({}).populate("blog").sort({createdAt:-1});
        res.json({success:true,comments})
    }catch(err){
        res.json({message:err})
    }
}

export const getDashboard = async (req, res) =>{
    try{
        const recentBlogs = await Blog.find({}).sort({createdAt:-1});
        const blogs = await Blog.countDocuments()
        const publishedBlogs = await Blog.countDocuments({isPublished:true})
        const drafts = await Blog.countDocuments({isPublished:false})
        const comments = await Comment.countDocuments()

        const dashBoardData = {recentBlogs,blogs,publishedBlogs,drafts,comments}
        res.json({success:true,dashBoardData})
    }catch(err){
        res.json({message:err})
    }
};

export const deleteComment = async (req, res) =>{
    try{
        const {id} = req.body;
        await Comment.findByIdAndDelete(id);
        res.json({success:true,message:"Comment deleted successfully"})
    }catch(err){
        res.json({message:err})
    }
};

export const approveComment = async (req, res) =>{
    try{
        const {id} = req.body;
        await Comment.findByIdAndUpdate(id,{isApproved:true});
        
        if(Comment.findByIdAndUpdate(id,{isApproved:false})){
            res.json({message:"Please set Published : True & then update !"})
        }

        res.json({success:true,message:"Comment approved successfully"})
    }catch(err){
        res.json({message:err})
    }
};

