const marketservice=require('../services/market.service');

async function getAllCoins(req,res){
    try{
        const coins=await marketservice.getallcoins();
        return res.status(200).json({
            coins
        });
    }catch(err){
        console.error('getAllCoins error:', err.message);
        return res.status(500).json({ message: 'Failed to fetch market data' });
    }
}


async function getCoinDetail(req,res){
    try{
        const {symbol}=req.params;
        const coin=await marketservice.getcoindetail(symbol);
        return res.status(200).json({
            coin
        });
    }catch(err){
        console.error('getCoinDetail error:', err.message);
        return res.status(500).json({ message: 'Failed to fetch coin detail' });
    }
}


async function getCoinHistory(req,res){
    try{
        const {symbol}=req.params;
        const {interval,limit}=req.query;
        const history=await marketservice.getcoinhistory(symbol,interval,limit);
        return res.status(200).json({
            history
        });
    }catch(err){
        console.error('getCoinHistory error:', err.message);
        return res.status(500).json({ message: 'Failed to fetch coin history' });
    }
}

async function getTopGainer(req,res){
    try{
        const gainers=await marketservice.gettopgainer();
        return res.status(200).json({
            gainers
        });
    }catch(err){
        console.error('getTopGainers error:', err.message);
        return res.status(500).json({ message: 'Failed to fetch top gainers' });
    }
}

async function getTopVolume(req,res){
    try{
        const volume=await marketservice.gettopvolume();
        return res.status(200).json({
            volume
        });
    }catch(err){
        console.error('getTopVolume error:', err.message);
        return res.status(500).json({ message: 'Failed to fetch top volume' });
    }
}

module.exports={getAllCoins,getCoinDetail,getCoinHistory,getTopGainer,getTopVolume};