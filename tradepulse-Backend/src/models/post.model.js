const mongoose=require('mongoose');


const commentSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"user is required"]
    },
    text:{
        type:String,
        required:[true,"text is required"]
    }      
},{
    timestamps:true    
});

const postSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"user is required"]
    },
    content:{
        type:String,
        required:[true,"content is required"]
    },
    sentiment:{
        type:String,
        enum:{
            values:["BULLISH","BEARISH","NEUTRAL"],
            message:"the {VALUE} is invalid"
        },
    },
    likes:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user",
    }],
    comments:[commentSchema]
},{
    timestamps:true
});


const PostModel=mongoose.model('post',postSchema);

module.exports=PostModel;