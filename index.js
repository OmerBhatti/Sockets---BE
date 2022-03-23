const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const PORT = 3000 || process.env.PORT;

const app = express();
const server = http.createServer(app);
const io = socketio(server,{
    cors: {
    origin: "*"
  }
});

var online = {}

function getUserByID(id){
    for(let room in online){
        for (let user in online[room]){
            if(online[room][user].SocketId == id){
                return online[room][user];
            }
        }
    }
    return null;
}

io.on('connect', socket =>{
    socket.on("newUserRoom",(data)=>{
        //add user to online list with room key
        if(online[data.room] == undefined){
            online[data.room] = [];
        }
        online[data.room].push({
            user:data.user,
            room:data.room,
            SocketId:socket.id
        });
        //send Listneres
        io.emit("userJoined",data);
        io.emit('count',{room: data.room , online: online[data.room]});
    })
    socket.on('messageSend',(data)=>{
        io.emit('newMessage',data);
    })
    socket.on('disconnect',()=>{
        let user = getUserByID(socket.id);
            online[user.room] = online[user.room].filter((user) => user.SocketId !== socket.id );
        io.emit('count',{room: user.room , online: online[user.room]});
        io.emit("userLeft",user);
    })
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));