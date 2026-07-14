const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    profilepic:{
        type:String
    },
    name:{
        type:String,
        required:[true,"Full name is required"]
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:[true,"Email should be unique"]
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    verified:{
        type:Boolean,
        default:false
    }
})

const UserModel=mongoose.model('user',userSchema);

module.exports=UserModel;