const UserModel=require('../models/user.model');
const crypto=require('crypto');
const bcrypt=require('bcrypt');
const utils=require('../utils/utils');
const OTPModel=require('../models/OTP.model');
const sendEmail=require('../services/email.service');
const jwt=require('jsonwebtoken');
const config=require('../config/config');
const SessionModel=require('../models/session.model');
const uploadprofilepic=require('../services/storage.service');

async function register(req,res){
    try{
        const {fullName,email,password}=req.body;
        const userexist=await UserModel.findOne({email});
        if(userexist){
            return res.status(409).json({
                message:"User is Already Registered"
            })
        }

        const hashedpassword=await bcrypt.hash(password,10);

        const user=await UserModel.create({
            name:fullName,
            email,
            password:hashedpassword
        });

        const OTP=utils.generateOTP();
        const HTML=utils.getOTPHTML(OTP);

        const hashedotp=crypto.createHash('sha256').update(OTP).digest('hex');

        await OTPModel.create({
            email,
            user:user._id,
            OTPHash:hashedotp,
            purpose:"register"
        })

        await sendEmail(email,"OTP Verification",`Your OTP code is ${OTP}`,HTML);

        res.status(201).json({
            message:"User Registered Successfully"
        });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Something went wrong' });
  }



    

}

async function resendotp(req,res){
    try{
        const {email,purpose}=req.body;

        if(!email){
            return res.status(400).json({
                message:"Email is required"
            });
        }

        if(!["register","login","reset"].includes(purpose)){
            return res.status(400).json({
                message:"A valid purpose is required"
            });
        }

        const user=await UserModel.findOne({email});
        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }

        const OTP=utils.generateOTP();
        const HTML=utils.getOTPHTML(OTP);
        const hashedotp=crypto.createHash('sha256').update(OTP).digest('hex');

        await OTPModel.deleteMany({ 
            user: user._id,
            purpose
         });
        await OTPModel.create({
            email:user.email,
            user:user._id,
            OTPHash:hashedotp,
            purpose
            
        });

        await sendEmail(user.email,"OTP Verification",`Your OTP code is ${OTP}`,HTML);

        res.status(200).json({
            message:"OTP resent successfully"
        });

    } catch(err){
        console.error('resendotp error:', err);
        return res.status(500).json({ message: 'Something went wrong' });
    }
}

async function VerifyEmail(req,res){
    try{
        const {email,otp}=req.body;

        const otphash=crypto.createHash('sha256').update(otp).digest('hex');
        console.log(otphash);

        const otpexist=await OTPModel.findOne({
            email,
            OTPHash:otphash,
            purpose:"register"
        })

        if(!otpexist){
            return res.status(400).json({
                message:"Invalid OTP"
            })
        }

        const user=await UserModel.findByIdAndUpdate(otpexist.user,{verified:true},{new:true});

        await OTPModel.deleteMany({
            user:otpexist.user,
            purpose:"register"
        });

        res.status(200).json({
            message:"Email Verified Successfully"
        })

    }catch(err){
        console.error('VerifyEmail error:', err);
        return res.status(500).json({ message: 'Something went wrong' });
  }

    
}

async function login(req,res){
    const user=req.user;

    if(!user.verified){
        const OTP     = utils.generateOTP();
        const HTML    = utils.getOTPHTML(OTP);
        const otpHash = crypto.createHash('sha256').update(OTP).digest('hex');

        await OTPModel.deleteMany({ user: user._id });
        await OTPModel.create({
            email:   user.email,
            user:    user._id,
            OTPHash: otpHash,
            purpose:"register"
        });

        await sendEmail(user.email, 'Verify your email', `Your OTP is ${OTP}`, HTML);

        return res.status(403).json({
            message:     'Email not verified. OTP sent to your email.',
            requiresOtp: true,
            email:       user.email,
            otpPurpose:  'register',
        });

    }

    const Refreshtoken=jwt.sign({
        id:user._id,
        email:user.email,
    },config.JWT_SECRET,{
        expiresIn:"7d"
    });

    const hashedrefreshtoken=crypto.createHash('sha256').update(Refreshtoken).digest('hex');

    const session=await SessionModel.create({
        user:user._id,
        Refreshtokenhash:hashedrefreshtoken,
        IP:req.ip,
        UserAgent:req.headers[ "user-agent" ]
    });

    const Accesstoken=jwt.sign({
        id:user._id,
        email:user.email,
    },config.JWT_SECRET,{
        expiresIn:"15m"
    });

    res.cookie('Accesstoken',Accesstoken, {
      httpOnly:true,
      secure:false,
      sameSite:'strict',
      maxAge:15 * 60 * 1000,
    });

    res.cookie('Refreshtoken',Refreshtoken,{
        httpOnly:true,
        secure:false,
        sameSite:"strict",
        maxAge:7 * 24 * 60 * 60 * 1000 
    });


    res.status(200).json({
        message:"User is Successfully Logged in",
        requiresOtp:false,
        user:{
            id:user._id,
            fullName:user.name,  
            email:user.email,
            profilePic:user.profilepic,
        }
    });

} 

async function logout(req,res){
    const Refreshtoken=req.cookies.Refreshtoken;
    if(!Refreshtoken){
        return res.status(400).json({
            message:"Refresh token not found"
        });
    }

    const refreshtokenhash=crypto.createHash('sha256').update(Refreshtoken).digest('hex');

    const session=await SessionModel.findOne({
        Refreshtokenhash:refreshtokenhash,
        Revoked:false
    });

    if(!session){
        return res.status(400).json({
            message:"Invalid Refresh Token"
        });
    }

    session.Revoked=true;
    await session.save();

    res.clearCookie('Refreshtoken');
    res.clearCookie('Accesstoken');

    res.status(200).json({
        message:"Logged Out Successfully"
    })


}

async function logoutAll(req,res){
    const Refreshtoken=req.cookies.Refreshtoken;
    if(!Refreshtoken){
        return res.status(400).json({
            message:"Refresh token not found"
        });
    }

    const decoded=jwt.verify(Refreshtoken,config.JWT_SECRET);

    await SessionModel.updateMany({
        user:decoded.id,
        Revoked:false
    },{
        Revoked:true
    });

    res.clearCookie('Refreshtoken');
    res.clearCookie('Accesstoken');

    res.status(200).json({
        message:"Logged out from all devices successfully"
    });

}

async function getProfile(req,res){
    const user=req.user;
    res.status(200).json({
        message:"profile fetched Successfully",
        user:{
            id:user._id,
            fullName:user.name,  
            email:user.email,
            profilePic:user.profilepic,
        }
    });
}

async function Refreshtoken(req,res){
    const Refreshtoken=req.cookies.Refreshtoken;
    if(!Refreshtoken){
        return res.status(400).json({
            message:"Refresh token not found"
        })
    }

    const decoded=jwt.verify(Refreshtoken,config.JWT_SECRET);


    const refreshtokenhash=crypto.createHash('sha256').update(Refreshtoken).digest('hex');

    const session=await SessionModel.findOne({
        Refreshtokenhash:refreshtokenhash,
        Revoked:false
    });

    if(!session){
        return res.status(400).json({
            message:"Invalid refresh token"
        });
    }

    const Accesstoken=jwt.sign({
        id:decoded.id,
        email:decoded.email
    },config.JWT_SECRET,{
        expiresIn:"15m"
    });

    const Newrefreshtoken=jwt.sign({
        id:decoded.id,
        email:decoded.email
    },config.JWT_SECRET,{
        expiresIn:"7d"
    });

    const Newrefreshtokenhash=crypto.createHash('sha256').update(Newrefreshtoken).digest('hex');

    session.Refreshtokenhash=Newrefreshtokenhash;
    await session.save();

    res.cookie('Refreshtoken',Newrefreshtoken,{
        httpOnly:true,
        secure:false,
        sameSite:"strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.cookie('Accesstoken',Accesstoken,{
        httpOnly:true,
        secure:false,
        sameSite:"strict",
        maxAge:15 * 60 * 1000,
    })

    res.status(200).json({
        message:"Access token refreshed Successfully"
    })
}

async function updateprofile(req,res){
    try{
        const user=req.user;
        const result=await uploadprofilepic(req.file.buffer,user._id);
        

        user.profilepic=result.url;
        await user.save();

        res.status(201).json({
            message:"User Updated Successfully!",
            user:{
                id:user._id,
                fullName:user.name,
                email:user.email,
                profilePic:user.profilepic,
            }
        })

    }catch(err){
        console.error('updateprofile error:', err);
        return res.status(500).json({ message: 'Something went wrong' });
    }
}

async function forgetpassword(req,res){
    try{
        const {email}=req.body;

        if(!email){
            return res.status(400).json({
                message:"Email is required"
            });
        }

        const user=await UserModel.findOne({
            email
        });

        if(user){
            const OTP=utils.generateOTP();
            const HTML=utils.getOTPHTML(OTP);

            const hashedotp=crypto.createHash('sha256').update(OTP).digest('hex');

            await OTPModel.create({
                email,
                user:user._id,
                OTPHash:hashedotp,
                purpose:"reset"
            })

            await sendEmail(email,"OTP Verification",`Your OTP code is ${OTP}`,HTML);
        }

        res.status(200).json({
                message:"If an account with that email exists, a reset code has been sent."
        });

        }catch(err){
            console.error('forgotPassword error:', err);
            return res.status(500).json({ message: 'Something went wrong' });
        }
}


async function resetpassword(req,res){
   try{
        const {email,otp,newPassword}=req.body;
        if(!email || !otp || !newPassword){
            return res.status(400).json({
                message:"email, otp and new password are required"
            })
        }

        const user=await UserModel.findOne({
            email
        });

        if(!user){
            return res.status(400).json({
                message:"Invalid Email"
            });
        }

        const hashedotp=crypto.createHash('sha256').update(otp).digest('hex');

        const Otp=await OTPModel.findOne({
            OTPHash:hashedotp
        });

        if(!otp){
            return res.status(400).json({
                message:"Invalid otp"
            });
        }

        const hashedpassword=await bcrypt.hash(newPassword,10);

        user.password=hashedpassword;
        await user.save();


        await OTPModel.deleteMany({
            user:user._id,
            purpose:"reset"
        });

        res.status(200).json({
            message:"Password reset successfully"
        });

    }catch(err){
        console.error('resetPassword error:', err);
        return res.status(500).json({ message: 'Something went wrong' });
    }
}


module.exports={register,resendotp,VerifyEmail,login,logout,logoutAll,getProfile,Refreshtoken,updateprofile,resetpassword,forgetpassword};


