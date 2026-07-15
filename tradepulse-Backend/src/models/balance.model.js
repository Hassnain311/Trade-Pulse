const mongoose=require('mongoose');

const balanceSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"user is required"],
        unique:true
    },
    usdt:{
        type:Number,
        default:100000
    }
},{
    timestamps:true
});


balanceSchema.index({user:1},{unique:true});

const BalanceModel=mongoose.model('balance',balanceSchema);

module.exports=BalanceModel;