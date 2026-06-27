const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const crypto = require('crypto');
const { error } = require("console");

/**
 * @name TokenIssueHelper
 */
function issueToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
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
    const {username,email,password} = req.body

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

    try{
        const user = await userModel.create({
            username,
            email,
            password:hash
        })
    }catch(err){
        return res.status(500).json(
            {
                message:"Failed to create user",
                error:err.message
            }
        )
    }

    issueToken(user);
    setAuthCookie(res, token)

    const isProduction = process.env.NODE_ENV === 'production'
    res.cookie("token", token_username, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 86400000
    })

    res.status(201).json({
        message:"User logged in successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}

/**
 * @name loginUserController
 * @description user login
 * @access Public
 */

async function loginUserController(req,res){
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

    issueToken(user);
    setAuthCookie(res, token);

    const isProduction = process.env.NODE_ENV === 'production'
    res.cookie("token", token_Passwd, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 86400000
    });
    res.status(200).json({
        message:"User logged in Successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
            
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

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}