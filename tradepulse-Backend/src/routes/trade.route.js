const express=require('express');
const router=express.Router();
const authmiddleware=require('../middlewares/auth.middleware');
const tradecontroller=require('../controllers/trade.controller');


router.post('/place',authmiddleware.Validate,tradecontroller.placetrade);

router.get('/portfolio',authmiddleware.Validate,tradecontroller.getportfolio);

router.get('/balance',authmiddleware.Validate,tradecontroller.getbalance);

router.get('/history',authmiddleware.Validate,tradecontroller.gethistory);

router.get('/open-orders',authmiddleware.Validate,tradecontroller.getopenorders);

router.delete('/order/:id',authmiddleware.Validate,tradecontroller.cancelorders);


module.exports=router;