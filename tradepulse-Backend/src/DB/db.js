const mongoose=require('mongoose');
const config=require('../config/config');

async function connectDB(){
    try{
        await mongoose.connect(config.MONGODB_URI);
        console.log('Successfully Connected to Database');
    }catch(err){
        console.log("Error During Connected to Database: ",err);
    }
}


module.exports=connectDB;