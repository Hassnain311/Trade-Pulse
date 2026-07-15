const mongoose=require('mongoose');

const portfolioSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"user is required"],
        
    },
    symbol:{
        type:String,
        required:[true,"symbol is required"]
    },
    amount:{
        type:Number,
        required:[true,"amount id required"]
    },
    avgBuyPrice:{
        type:Number,
        required:[true,"average price is required"]
    },
},{
    timestamps:true
});

portfolioSchema.index({ user:1, symbol:1 },{ unique:true });

const PortfolioModel=mongoose.model('portfolio',portfolioSchema);

module.exports=PortfolioModel;