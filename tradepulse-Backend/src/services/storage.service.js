const {ImageKit} = require('@imagekit/nodejs');
const config=require('../config/config');

const imagekit = new ImageKit({
    privateKey:config.IMAGEKIT_PRIVATE_KEY,
})

async function uploadprofilepic(buffer,userId){
    const result=await imagekit.files.upload({
        file:buffer.toString('base64'),
        fileName:`profile_${userId}_${Date.now()}.jpg`
    })

    return result;
}

module.exports=uploadprofilepic;