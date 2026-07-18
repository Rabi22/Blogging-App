import express from 'express'
import authController from '../controllers/auth.controller.js'
import authUser from '../middleware/userAuth.middleware.js'

const userRoute = express.Router()

/**
 * @route POST /api/auth/user/register
 * @description Register a new normal user
 * @access Public
 */
userRoute.post("/register", authController.registerUserController)

/**
 * @route POST /api/auth/user/login
 * @description Normal user login
 * @access Public
 */
userRoute.post("/login", authController.loginUserController)

/**
 * @route GET /api/auth/user/logout
 * @description Normal user logout
 * @access Private
 */
userRoute.get("/logout", authController.logoutUserController)

/**
 * @route GET /api/auth/user/me
 * @description Get current user details
 * @access Private
 */
userRoute.get("/me", authUser, authController.getMeController)

export default userRoute
