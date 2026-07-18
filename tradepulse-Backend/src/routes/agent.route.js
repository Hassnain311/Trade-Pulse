const express=require('express');
const router=express.Router();
const agentcontroller=require('../controllers/agent.controller');
const authmiddleware = require('../middlewares/auth.middleware');

router.post('/predict', authmiddleware.Validate, agentcontroller.predict);
router.get('/predictions/:symbol', authmiddleware.Validate, agentcontroller.getPredictions);

module.exports=router;