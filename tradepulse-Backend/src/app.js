const express=require('express');
const app=express();
const CookieParser=require('cookie-parser');
const authroute=require('./routes/auth.route');
const marketroute=require('./routes/market.route');
const traderoute=require('./routes/trade.route');
const cors=require('cors');

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}));

app.use(express.json());
app.use(CookieParser());


app.use('/api/auth',authroute);
app.use('/api/market',marketroute);
app.use('/api/trade',traderoute);

module.exports=app;