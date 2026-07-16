import express from 'express'
import authUser from '../middleware/userAuth.middleware.js'
import authController from '../controllers/auth.controller.js'
import { approveComment, deleteComment, getAllBlogsAdmin, getAllComments, getDashboard } from '../middleware/adminFeature.middleware.js'

const adminRoute = express.Router()

/**
 * @route POST /api/auth/register
 * @description Regiater a new admin
 * @access Public
 */

adminRoute.post("/adminregister",authController.registerUserController)

/** 
 * @route POST /api/auth/login
 * @description admin login
 * @access Public
*/

adminRoute.post("/adminlogin",authController.loginUserController)

/**
 * @route GET /api/auth/logout
 * @description Clear token from user cookie and add that token in blacklist
 * @access Public
 */

adminRoute.get("/adminlogout",authController.logoutUserController)

adminRoute.get("/admin-comments",authUser,getAllComments)

adminRoute.get("/admin-blogs",authUser,getAllBlogsAdmin) 
adminRoute.get("/delete-comment",authUser,deleteComment) 
adminRoute.get("/approve-comment",authUser,approveComment) 
adminRoute.get("/admin-dashboard",authUser,getDashboard) 

export default adminRoute