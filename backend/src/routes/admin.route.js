import express from 'express'
import authUser from '../middleware/userAuth.middleware.js'
import authController from '../controllers/auth.controller.js'
import adminOnly from '../middleware/adminOnly.middleware.js'
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

adminRoute.get("/admin-comments",authUser,adminOnly,getAllComments)

adminRoute.get("/admin-blogs",authUser,adminOnly,getAllBlogsAdmin) 
adminRoute.delete("/delete-comment/:id",authUser,adminOnly,deleteComment) 
adminRoute.put("/approve-comment/:id",authUser,adminOnly,approveComment) 
adminRoute.get("/admin-dashboard",authUser,adminOnly,getDashboard) 

export default adminRoute