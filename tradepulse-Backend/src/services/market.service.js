const axios=require('axios');

const BINANCE_BASE='https://api.binance.com/api/v3';

// ── Simple in-memory cache ────────────────────────────────────────
// Stores { data, timestamp } per cache key
// Avoids hitting Binance on every single request
const cache={};
const CACHE_TTL=5000;//5 second

function getCache(key){
    const entry=cache[key];
    if(!entry){
        return null;
    }
    const isexpired=Date.now() - entry.timestamp > CACHE_TTL;
    if(isexpired){
        return null;
    }

    return entry.data;
}


function setCache(key,data){
    cache[key]={data,timestamp:Date.now()};
}

//Binance API call

async function getallcoins(){
    const cached=getCache('all_coins');
    if(cached){
        return cached;
    }

    const res=await axios.get(`${BINANCE_BASE}/ticker/24hr`);

    //only return usdt pair - filter out btc/eth pairs etc
    const usdtpairs=res.data.filter(coin => coin.symbol.endsWith('USDT'));

    setCache('all_coins',usdtpairs);
    return usdtpairs;
}


//get single coin detail
async function getcoindetail(symbol){
    const cachekey=`coin_${symbol}`;
    const cached=getCache(cachekey);
    if(cached){
        return cached;
    }

    const res=await axios.get(`${BINANCE_BASE}/ticker/24hr`,{
        params:{symbol:symbol.toUpperCase()}
    });

    setCache(cachekey,res.data);
    return res.data;
}

//get OHLCV candlestick history 
//interval option 1m,5m,15m,1h,4h,1d,1w

async function getcoinhistory(symbol,interval = '1d',limit = 100){
    const cachekey=`history_${symbol}_${interval}`;
    const cached=getCache(cachekey);
    if(cached){
        return cached;
    }

    const res=await axios.get(`${BINANCE_BASE}/klines`,{
        params:{
            symbol:symbol.toUpperCase(),
            interval,
            limit
        }
    });


    //binance returns arrays - convert to readable objects

    const formatted =res.data.map(candle => ({
        openTime: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
        closeTime: candle[6],
    }));

    setCache(cachekey,formatted);
    return formatted;
}

//get top gainers-sorted by 24h price change

async function gettopgainer(limit=10){
    const coins = await getallcoins();
    return [...coins]
        .sort((a,b)=>parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
        .slice(0,limit);
}


//get top volume coins -sorted by quote volume
async function gettopvolume(limit=10){
    const coins=await getallcoins();
    return [...coins]
        .sort((a,b)=>parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0,limit);
}


module.exports={getallcoins,getcoindetail,getcoinhistory,gettopgainer,gettopvolume};