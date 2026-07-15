const BalanceModel=require('../models/balance.model');
const PortfolioModel=require('../models/portfolio.model');
const TradeModel=require('../models/trade.model');
const axios=require('axios');


async function placetrade(req,res){
    try{
        const {amount,price,symbol,type,side}=req.body;
        const user=req.user;
        const parsedAmount = parseFloat(amount);
        const parsedPrice  = parseFloat(price);
        if (!parsedAmount || parsedAmount <= 0 || !parsedPrice || parsedPrice <= 0) {
            return res.status(400).json({ message: 'Invalid amount or price' });
        }
        if(side==="Buy"){
            if(type==="Market"){

                const balance=await BalanceModel.findOne({
                    user:user._id
                });
                if(!balance){
                    return res.status(400).json({
                        message:"User doesn't exist"
                    });
                }
                const cost = parsedAmount * parsedPrice;
                if(balance.usdt<cost){
                    return res.status(400).json({
                        message:"Insufficient Balance"
                    });
                }

                balance.usdt-=cost;
                await balance.save();

                const portfolio=await PortfolioModel.findOne({
                    user:user._id,
                    symbol
                });

                if(portfolio){ 
                    portfolio.avgBuyPrice=(portfolio.amount*portfolio.avgBuyPrice+parsedAmount * parsedPrice)/(portfolio.amount+parsedAmount);
                    portfolio.amount+=parsedAmount;
                    await portfolio.save();
                }else{
                    await PortfolioModel.create({
                        user:user._id,
                        symbol,
                        amount:parsedAmount,
                        avgBuyPrice:parsedPrice
                    });
                }

                const trade=await TradeModel.create({
                    user:user._id,
                    symbol,
                    side:"Buy",
                    type:"Market",
                    amount:parsedAmount,
                    price:parsedPrice,
                    total:parsedAmount * parsedPrice,
                    status:"Completed"
                })

                res.status(201).json({
                    message:"Trade has been succesfully executed",
                    trade,
                    balance: balance.usdt
                })
            }else if(type==="Limit"){
                const cost=parsedAmount * parsedPrice;
                const balance=await BalanceModel.findOne({
                    user:user._id
                });

                if(!balance){
                    return res.status(400).json({
                        message:"user not valid"
                    });
                }

                if(balance.usdt<cost){
                    return res.status(400).json({
                        message:"Insufficient Balance"
                    });
                }

                const trade = await TradeModel.create({
                    user: user._id,
                    symbol,
                    side:"Buy",     
                    type: "Limit",
                    amount:parsedAmount,
                    price:parsedPrice,
                    total:cost,
                    status:"Pending"
                });

                res.status(201).json({
                    message:"trade completed successfully",
                    trade
                });

            }
        }else if(side==="Sell"){
            if(type==="Market"){
                const portfolio=await PortfolioModel.findOne({
                    user:user._id,
                    symbol
                });
                if(!portfolio){
                    return res.status(400).json({
                        message:"user doesn't hold this coin"
                    });
                }

                if(portfolio.amount < parsedAmount){
                    return res.status(400).json({
                        message:"Not enough amount"
                    });
                }

                const balance = await BalanceModel.findOne({
                    user:user._id
                });

                if(!balance){
                    return res.status(400).json({
                        message:"User doesn't exist"
                    });
                }
                balance.usdt+=(parsedAmount * parsedPrice);
                portfolio.amount -= parsedAmount;
                if(portfolio.amount < 0.000001){
                    await PortfolioModel.deleteOne({user:user._id,symbol});
                }else{
                    await portfolio.save();
                }

                await balance.save();
                const trade=await TradeModel.create({
                    user:user._id,
                    symbol,
                    side:"Sell",
                    type:"Market",
                    amount:parsedAmount,
                    price:parsedPrice,
                    total:parsedAmount * parsedPrice,
                    status:"Completed"
                });

                res.status(201).json({
                    message:"Trade has been succesfully executed",
                    trade,
                    balance: balance.usdt
                });
                
            }else if(type==="Limit"){
                const portfolio=await PortfolioModel.findOne({
                    user:user._id,
                    symbol
                });

                if(!portfolio){
                    return res.status(400).json({
                        message:"User doesn't hold this coin"
                    });
                }

                if(portfolio.amount < parsedAmount){
                    return res.status(400).json({
                        message:"Insufficient balance"
                    });
                }

                const trade = await TradeModel.create({
                    user:user._id,
                    symbol,
                    side:"Sell",      
                    type: "Limit",
                    amount:parsedAmount,
                    price:parsedPrice,
                    total:parsedAmount * parsedPrice,
                    status:"Pending"
                });

                return res.status(201).json({
                    message: "Limit sell order placed",
                    trade
                });
            }
        }
    }catch(err){
        console.error('placeTrade error:', err);
        return res.status(500).json({ message: "Something went wrong" });
    }
}

async function getbalance(req,res){
    try{
        const user=req.user;
        let balance=await BalanceModel.findOne({
            user:user._id
        });

        if(!balance){
            balance=await BalanceModel.create({
                user: user._id
            });
        }

        res.status(200).json({
            message:"Balance fetched Successfully",
            USDT:balance.usdt
        });

    }catch(err){
        console.error('getBalance error:', err);
        return res.status(500).json({
             message:"Something went wrong"
        });
    }
}

async function getportfolio(req,res){
    try{
        const user=req.user;
        const portfolios=await PortfolioModel.find({
            user:user._id
        });

        if(portfolios.length===0){
            return res.status(200).json({
                message:"No holdings found",
                holdings:[]
            });
        }

        const holdings=[];

        for(const holding of portfolios){
            const response=await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${holding.symbol}`);
            const currentprice=parseFloat(response.data.price);
            const pnl = (currentprice - holding.avgBuyPrice) * holding.amount;
            const currentValue = currentprice * holding.amount;
            holdings.push({
                symbol:holding.symbol,
                amount:holding.amount,
                avgBuyPrice:holding.avgBuyPrice,
                currentPrice:currentprice,
                currentValue,
                pnl
            });
        }
        res.status(200).json({
            message: "Portfolio fetched successfully",
            holdings
        });

    }catch(err){
        console.error('getBalance error:', err);
        return res.status(500).json({
             message:"Something went wrong"
        });
    }
}

async function gethistory(req,res){
    try{
        const user=req.user;
        const page=parseInt(req.query.page) || 1;
        const limit=20;
        const skip=(page - 1) * limit;
        const trades=await TradeModel.find({
            user:user._id
        })
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit);

        if(trades.length===0){
            return res.status(200).json({
                message:"No trade found"
            });
        }

        res.status(200).json({
            message:"trade fetched Successfully",
            page,
            trades
        });

    }catch(err){
        console.error('getBalance error:', err);
        return res.status(500).json({
             message:"Something went wrong"
        });
    }
}

async function getopenorders(req,res){
    try{
        const user=req.user;
        const trades=await TradeModel.find({
            user:user._id,
            status:"Pending"
        })
        .sort({
            createdAt:-1
        });
        
        if(trades.length===0){
            return res.status(200).json({
                message:"No open orders found"
            });
        }

        res.status(200).json({
            message:"Open orders fetched successfully",
            trades
        });

    }catch(err){
        console.error('getBalance error:', err);
        return res.status(500).json({
             message:"Something went wrong"
        });
    }
}

async function cancelorders(req,res){
    try{
        const id=req.params.id;
        const user=req.user;
        const trade=await TradeModel.findOne({
            _id:id,
            user:user._id
        });

        if(!trade){
            return res.status(404).json({
                message:"trade doesn't exist"
            });
        }

        if(trade.status!=="Pending"){
            return res.status(400).json({
                message:"Only pending orders can be cancelled"
            });
        }

        trade.status="Cancelled";
        await trade.save();

        res.status(200).json({
            message:"trade Cancelled Successfully",
            trade
        });

    }catch(err){
        console.error('getBalance error:', err);
        return res.status(500).json({
             message:"Something went wrong"
        });
    }
}

module.exports={placetrade,getbalance,getportfolio,gethistory,getopenorders,cancelorders};