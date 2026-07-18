const app=require('./src/app');
const connectDB=require('./src/DB/db');
const http=require('http');//new
const { Server } = require('socket.io');
const socketModule=require('./src/socket');//new

connectDB();

const server=http.createServer(app);//creating http server from express app

//attach socket.io

const io=new Server(server,{    
    cors:{
        origin:"http://localhost:5173",
        credentials:true
    }
});

socketModule.init(io);

//socket.io connection handler

io.on('connection',(socket)=>{
    console.log('User connected: ',socket.id);

    socket.join('news');//join news room

    socket.on('disconnect',()=>{
        console.log('User disconnected: ',socket.id)
    });
});

module.exports={io};

server.listen(3000,()=>{
    console.log('Server is Running');
})