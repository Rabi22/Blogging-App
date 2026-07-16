import userModel from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import tokenBlacklistModel from '../models/blacklist.model.js'
import crypto from 'crypto'

/**
 * @name TokenIssueHelper
 */
function issueToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

/**
 * @name AuthCookieHelper
 */

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 86400000 // 1 day //1000ms*60s*60min*24hr
  });
}


/**
 * @name registerUserController
 * @description register a new user
 * @access Public
 */

async function registerUserController(req,res) {
    const {username,email,password,role} = req.body
    const bootstrapToken = req.headers?.['x-admin-bootstrap-token'] || req.headers?.['X-Admin-Bootstrap-Token'];
    const isAdminBootstrap = bootstrapToken && bootstrapToken === process.env.ADMIN_BOOTSTRAP_TOKEN;

    if(!username || !email || !password){
        return res.status(400).json({
            message : "Please provide username , email & password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or : [{username},{email}]
    })

    if(isUserAlreadyExists){
        if(isUserAlreadyExists.username === username){
            return res.status(400).json({
                message:"This username is already taken! Choose another username "
            })
        }
        if(isUserAlreadyExists.email === email){
            return res.status(400).json({
                message:"Account with this email already exists!"
            })
        }
    }

    const hash = await bcrypt.hash(password,10) //10 is cost factor or salt rounds here.
    let user;

    try{
        user = await userModel.create({
            username,
            email,
            password:hash,
            role: isAdminBootstrap ? 'admin' : 'user'
        })
    }catch(err){
        return res.status(500).json(
            {
                message:"Failed to create user",
                error:err.message
            }
        )
    }

    const token = issueToken(user)
    setAuthCookie(res, token)

    res.status(201).json({
        message:"User registered successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email,
            role:user.role || 'user'
        }
    })
}

/**
 * @name loginUserController
 * @description user login
 * @access Public
 */

async function loginUserController(req,res) {
    const {email,password} = req.body;

    const user = await userModel.findOne({email})

    if(!user){
        return res.status(400).json({message:"Invalid email or password"})
    }
    const isPasswdValid = await bcrypt.compare(password,user.password)

    if(!isPasswdValid){
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = issueToken(user)
    setAuthCookie(res, token);

    res.status(200).json({
        message:"User logged in successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email,
            role:user.role || 'user'
        }
    })
}

/**
 * @name logoutUserController
 * @description user logout
 * @access Private
 */

async function logoutUserController(req,res) {
    const token = req.cookies.token

    if(token){
        try {
      // decode to extract exp and user id
      const decoded = jwt.decode(token);
      const exp = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24*60*60*1000);
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      await tokenBlacklistModel.create({
        tokenHash,
        userId: decoded?.id,
        expiresAt: exp
      }).catch(err => {
        if (err && err.code !== 11000) {
          console.error('Failed to write blacklist entry:', err);
        }
      });
    } catch (err) {
      console.error('Error while blacklisting token:', err);
    }
  }


    const isProduction = process.env.NODE_ENV === 'production'
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/'
    });

    res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get current user details
 * @access Private 
 */

async function getMeController(req,res){
    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message : "User deatils fetched successfully",
        user:{
            id: user._id,
            username: user.username,
            email:user.email
        }
    })
}

export default {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}