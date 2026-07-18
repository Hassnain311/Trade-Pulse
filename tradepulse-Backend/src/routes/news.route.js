const express=require('express');
const router=express.Router();
const authmiddleware=require('../middlewares/auth.middleware');
const newscontroller=require('../controllers/news.controller');


router.post('/posts',authmiddleware.Validate,newscontroller.createpost);

router.get('/posts',authmiddleware.Validate,newscontroller.getposts);

router.post('/posts/:id/like',authmiddleware.Validate,newscontroller.likepost);

router.delete('/posts/:id/like',authmiddleware.Validate,newscontroller.unlikepost);

router.post('/posts/:id/comment',authmiddleware.Validate,newscontroller.addcomment);

router.delete('/posts/:id',authmiddleware.Validate,newscontroller.deletepost);

router.get('/trending',authmiddleware.Validate,newscontroller.getTrending);

router.get('/crypto-news',authmiddleware.Validate,newscontroller.getcryptonews);

router.get('/search',authmiddleware.Validate,newscontroller.search);


module.exports=router;