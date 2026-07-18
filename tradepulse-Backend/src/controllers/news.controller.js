const PostModel=require('../models/post.model');
const axios=require('axios');
const { getIO } = require('../socket');
const config=require('../config/config');
const Parser = require('rss-parser');
const parser = new Parser();

const RSS_FEEDS = [
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' },
    { url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph' },
    { url: 'https://decrypt.co/feed', source: 'Decrypt' },
];

async function createpost(req,res){
    try{
        const user=req.user;
        const {content,sentiment}=req.body;
        const post=await PostModel.create({
            user:user._id,
            content,
            sentiment
        });

        await post.populate('user', 'name profilepic');

        getIO().to('news').emit('new_post', post);

        res.status(201).json({
            message:"Post has been successfully created",
            post
        });
    }catch(err){
        console.log('Error: ',err);
        res.status(500).json({ 
            message:"Something went wrong"
        });
    }
}

async function getposts(req,res){
    try{
        const page=parseInt(req.query.page) || 1;
        const limit=20;
        const skip=(page - 1) * limit;
        const posts=await PostModel.find().populate('user','name profilepic').sort({createdAt:-1}).skip(skip).limit(limit);
        if(posts.length===0){
            return res.status(200).json({
                message:"No posts yet",
                posts: [],
                total: 0,
                hasmore: false
            });
        }

        const total=await PostModel.countDocuments();
        const hasmore=page * limit < total;

        res.status(200).json({
            message:"Posts fetched Successfully",
            posts,
            total,
            hasmore
        });
        
    }catch(err){
        console.log('Error: ',err);
        res.status(500).json({ 
            message:"Something went wrong"
        });
    }
}

async function likepost(req,res){
    try{
        const id=req.params.id;
        const user=req.user;
        const post=await PostModel.findOne({
            _id:id
        });
        if(!post){
            return res.status(400).json({
                message:"Cannot fetch Post"
            });
        }

        const result=post.likes.some(id => id.toString() === user._id.toString());

        if(result){
            return res.status(400).json({
                message:"Already Liked"
            });
        }

        post.likes.push(user._id);
        await post.save();

        getIO().to('news').emit('likes_updated', {        
            postId: post._id,
            likes: post.likes
        });

        res.status(201).json({
            message:"Post liked Successfully",
            likes:post.likes.length
        });

    }catch(err){
        console.log('Error: ',err);
        res.status(500).json({ 
            message:"Something went wrong"
        });
    }
}

async function unlikepost(req,res){
    try{
        const id=req.params.id;
        const user=req.user;
        const post=await PostModel.findOneAndUpdate({
            _id:id
        },{
            $pull:{
                likes:user._id
            },
        },{
            new:true
        }); 

        if(!post){
            return res.status(400).json({
                message:"Cannot fetch Post"
            });
        }

        getIO().to('news').emit('likes_updated', {      
            postId: post._id,
            likes: post.likes
        });
        

        res.status(200).json({
            message:"Post unlike Successfully",
            likes:post.likes.length
        });

    }catch(err){
        console.log('Error: ',err);
        res.status(500).json({ 
            message:"Something went wrong"
        });
    }
}

async function addcomment(req,res){
    try{
        const user=req.user;
        const {text}=req.body;
        const id=req.params.id;
        const post=await PostModel.findOne({
            _id:id
        });

        if(!post){
            return res.status(400).json({
                message:"cannot fetch post"
            });
        }

        post.comments.push({
            user:user._id,
            text
        });

        await post.save();

        await post.populate('comments.user','name profilepic');

        const newcomment=post.comments[post.comments.length - 1];

        getIO().to('news').emit('new_comment', {             
            postId: post._id,
            comment: newcomment
        });

        res.status(201).json({
            message:"Comment added Successfully",
            comment:newcomment
        });

    }catch(err){
        console.log('Error: ',err);
        res.status(500).json({ 
            message:"Something went wrong"
        });
    }
}

async function deletepost(req,res){
    try{
        const id=req.params.id;
        const user=req.user;
        const post=await PostModel.findOne({
            _id:id
        });

        if(!post){
            return res.status(400).json({
                message:"cannot fetch post"
            });
        }

        if(post.user.toString() !== user._id.toString()){
            return res.status(403).json({
                message:"Forbidden to delete the post"
            });
        }

        await PostModel.deleteOne({
            _id:id
        });

        getIO().to('news').emit('post_deleted', {
            postId:id 
        });

        res.status(200).json({
            message:"Post has been Successfully deleted"
        });

    }catch(err){
        console.log('Error: ',err);
        res.status(500).json({ 
            message:"Something went wrong"
        });
    }
}

async function getTrending(req,res){
    try{
        const last24hours=new Date(Date.now() - 24*60*60*1000);

        const posts=await PostModel.aggregate([
            {
                $match:{
                    createdAt:{
                        $gte:last24hours
                    }
                }
            },
            {
                $project:{
                    content:1,
                    likescount:{
                        $size:"$likes"
                    },
                    commentscount:{
                        $size:"$comments"
                    }
                }
            }
        ]);

        if(posts.length===0){
            return res.status(200).json({
                message:"cannot fetch any post",
                trending:[]
            });
        }

        const coinregex= /\$[A-Z]+/g;
        const mentionmap={};

        posts.forEach(post=>{
            const mentions=post.content.match(coinregex);
            if(mentions){
                const engagementBoost = 1 + (post.likescount + post.commentscount) * 0.1;
                mentions.forEach(coin=>{
                    mentionmap[coin]=(mentionmap[coin] || 0) + engagementBoost;
                });
            }
        });

        const trending=Object.entries(mentionmap)
        .map(([coin,count])=>({coin,count}))
        .sort((a,b)=>b.count - a.count)
        .slice(0,6);

        res.status(200).json({
            message:"Trending coins fetched successfully",
            trending
        });

    }catch(err){
        console.log('Error: ',err);
        res.status(500).json({ 
            message:"Something went wrong"
        });
    }
}

let cache={
    data:null,
    lastFetched:null
}

const CACHE_DURATION=5*60*1000;


async function getcryptonews(req,res){
    try{
        const now= Date.now();

        if(cache.data && (now-cache.lastFetched) < CACHE_DURATION){
            return res.status(200).json({
                message:"Crypto news fetched successfully",
                fromCache:true,
                news:cache.data
            });
        }

        const results = await Promise.allSettled(
            RSS_FEEDS.map(feed => parser.parseURL(feed.url))
        );

        let news = [];
        results.forEach((result, i) => {
            if (result.status === 'fulfilled') {
                const items = result.value.items.map(item => ({
                    title: item.title,
                    body: item.contentSnippet || item.title,
                    url: item.link,
                    imageurl: item.enclosure?.url || null,
                    source: RSS_FEEDS[i].source,
                    publishedOn: Math.floor(new Date(item.pubDate).getTime() / 1000)
                }));
                news.push(...items);
            } else {
                console.log(`[getcryptonews] Feed failed: ${RSS_FEEDS[i].source}`, result.reason.message);
            }
        });

        if (news.length === 0) {
            if (cache.data) {
                return res.status(200).json({
                    message: "Crypto news fetched from stale cache",
                    fromCache: true,
                    news: cache.data
                });
            }
            return res.status(502).json({ message: "Crypto news source unavailable" });
        }

        news.sort((a, b) => b.publishedOn - a.publishedOn);

        cache.data=news;
        cache.lastFetched=now;


        res.status(200).json({
            message: "Crypto news fetched successfully",
            fromCache: false,
            news
        });

    }catch(err){
        console.log('[getcryptonews] ERROR:', err.response?.data || err.message);

        if (cache.data) {
            return res.status(200).json({
                message: "Crypto news fetched from stale cache",
                fromCache: true,
                news: cache.data
            });
        }


        res.status(500).json({ 
            message:"Something went wrong"
        });
    }
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function search(req,res){
    try{
        const query=req.query.q;
        if(!query){
            return res.status(400).json({
                message:"search query required"
            });
        }
        const page=parseInt(req.query.page) || 1;
        const limit=20;

        const skip=(page - 1)* limit;

        const safequery = escapeRegex(query);

        const posts=await PostModel.find({
            content: { $regex: safequery, $options: 'i' }
        }).populate('user','name profilepic').sort({createdAt:-1}).skip(skip).limit(limit);

        if(posts.length===0){
            return res.status(200).json({
                message:"post didn't exist",
                post:[]
            });
        }

        res.status(200).json({
            message:"post fetched successfully",
            post:posts
        });

    }catch(err){
        console.log('Error: ',err);
        res.status(500).json({ 
            message:"Something went wrong"
        });
    }
}

module.exports={createpost,getposts,likepost,unlikepost,addcomment,deletepost,getTrending,getcryptonews,search};

