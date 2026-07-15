const mongoose=require('mongoose');

const tradeSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"user is required"]
    },
    symbol:{
        type:String,
        required:[true,"symbol is required"]
    },
    side:{
        type:String,
        enum:{
            values:["Buy","Sell"],
            message:"{value} is not a valid side"
        },
        required:[true,"side is required"]
    },
    type:{
        type:String,
        enum:{
            values:["Market","Limit"],
            message:"this is not a valid type"
        },
        required:[true,"TYPE is required"]
    },
    amount:{
        type:Number,
        required:[true,"amount is required"]
    },
    price:{
        type:Number,
        required:[true,"price is required"]
    },
    total:{
        type:Number,
        required:[true,"total is required"]
    },
    status:{
        type:String,
        enum:{
            values:["Completed","Pending","Cancelled"],
            message:"This is not a valid status"
        },
        required:[true,"status is required"]
    }
},{
    timestamps:true
});


const TradeModel=mongoose.model('trade',tradeSchema);

module.exports=TradeModel;