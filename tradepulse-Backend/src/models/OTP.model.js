const mongoose=require('mongoose');

const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required"]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"user is required"]
    },
    OTPHash:{
        type:String,
        required:[true,"OTP is required"]
    },
    purpose:{
        type:String,
        enum:["register","login","reset"],
        required:[true,"purpose is required"]
    }
},{
    timestamps:true
})

const OTPModel=mongoose.model('otp',OTPSchema);

module.exports=OTPModel;