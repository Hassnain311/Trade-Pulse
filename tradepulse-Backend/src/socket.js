let io;

function init(ioInstance){
    io=ioInstance;
}

function getIO(){
    return io;
}


module.exports={init,getIO};