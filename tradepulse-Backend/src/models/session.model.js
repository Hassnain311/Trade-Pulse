const mongoose=require('mongoose');

const sessionSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"user is required"]
    },
    Refreshtokenhash:{
        type:String,
        required:[true,"token is required"]
    },
    IP:{
        type:String,
        required:[true,"IP address is required"]
    },
    UserAgent:{
        type:String,
        required:[true,"User Agent is required"]
    },
    Revoked:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

const SessionModel=mongoose.model('session',sessionSchema);


module.exports=SessionModel;
