const UserModel=require('../models/user.model');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const config=require('../config/config');

async function authenticate(req,res,next){
    const {email,password}=req.body;
    
    const user=await UserModel.findOne({
        email
    });

    if(!user){
        return res.status(401).json({
            message:"Invalid Email or Password"
        })
    }

    const ismatch=await bcrypt.compare(password,user.password);

    if(!ismatch){
        return res.status(401).json({
            message:"Invalid Email Or Password"
        })
    }

    req.user=user;

    next();
}


async function Validate(req,res,next){
    try{
        const token = req.cookies.Accesstoken;
        if(!token){
            return res.status(401).json({
                message:"Access token not found"
            });
        }

        const decoded=jwt.verify(token,config.JWT_SECRET);

        const user=await UserModel.findOne({
            _id:decoded.id,
            verified:true
        }).select('-password'); 

        if(!user){
            return res.status(401).json({
                message:"User Not found"
            });
        }

        req.user=user;

        next();

    }catch(err){
        return res.status(401).json({ 
            message:"Invalid or expired token" 
        });
    }
}

module.exports={authenticate,Validate};