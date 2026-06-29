import express from 'express'
import authController from '../controllers/auth.controller.js'
const authRoute = express.Router()
// import { authUser } from '../middleware/userAuth.middleware.js'

/**
 * @route POST /api/auth/register
 * @description Regiater a new user
 * @access Public
 */

authRoute.post("/register",authController.registerUserController)

/** 
 * @route POST /api/auth/login
 * @description user login
 * @access Public
*/

authRoute.post("/login",authController.loginUserController)

/**
 * @route GET /api/auth/logout
 * @description Clear token from user cookie and add that token in blacklist
 * @access Public
 */

authRoute.get("/logout",authController.logoutUserController)

/**
 * @route GET /api/auth/get-me
 * @description get current logged in user details
 * @access Private
 */

//  authRoute.get("/get-me", authUser.authUser , authController.getMeController)

export default authRoute;