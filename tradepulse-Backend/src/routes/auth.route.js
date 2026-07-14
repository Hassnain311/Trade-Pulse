const express=require('express');
const router=express.Router();
const multer=require('multer');

const authcontroller=require('../controllers/auth.controller');
const authmiddleware=require('../middlewares/auth.middleware');


const upload=multer({
    storage:multer.memoryStorage()
})

router.post('/register',authcontroller.register);

router.post('/resend-otp',authcontroller.resendotp);

router.post('/verify-register-otp',authcontroller.VerifyEmail);

router.post('/login',authmiddleware.authenticate,authcontroller.login);

router.post('/logout',authcontroller.logout);

router.post('/logout-all',authcontroller.logoutAll);

router.get('/profile',authmiddleware.Validate,authcontroller.getProfile);

router.post('/refresh',authcontroller.Refreshtoken);

router.put('/profile',authmiddleware.Validate,upload.single('image'),authcontroller.updateprofile);

router.post('/forgot-password',authcontroller.forgetpassword);

router.post('/reset-password',authcontroller.resetpassword);


module.exports=router;