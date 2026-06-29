import mongoose from 'mongoose'
import validator from 'validator'

const UsernamePattern = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        minlength: 3,
        maxlength: 10,
        match: [UsernamePattern,"Please enter a valid username "]
    },
    email:{
        type:String,
        unique:true,
        required:true,
        validate: {
            validator: validator.isEmail,
            message: "Please enter a valid email"
        }
    },
    password:{
        type:String,
        required:true,
        validate: {
        validator: (value) => validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
            }),
        message: "Password must be stronger (include uppercase, lowercase, number, and symbol)"
        }
    }
})

const userModel = mongoose.model("users",userSchema);
export default userModel; 