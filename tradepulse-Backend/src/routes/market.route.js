const express=require('express');
const router=express.Router();
const marketcontroller=require('../controllers/market.controller');

router.get('/coins',marketcontroller.getAllCoins);
router.get('/coin/:symbol',marketcontroller.getCoinDetail);
router.get('/history/:symbol',marketcontroller.getCoinHistory);
router.get('/top-gainers',marketcontroller.getTopGainer);
router.get('/top-volume',marketcontroller.getTopVolume);




module.exports=router;