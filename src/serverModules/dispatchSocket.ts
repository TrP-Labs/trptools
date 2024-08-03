import { Server } from "http";
import { Socket } from "socket.io";
import express from 'express';

// Server code for dispatch socket
const data : data = {}

const router = express.Router();

function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
  
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
  
    return randomString;
}

function findIndexByName(array : any, name : string) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].socketId === name) {
            return i; // Return the index if the name matches
        }
    }
    return -1; // Return -1 if the name is not found in the array
}

const socketIO = (server : Server) => {
    const io = require('socket.io')(server);

    function roomUpdate(roomName : string) {
        const count = io.sockets.adapter.rooms.get(roomName).size
        io.to(roomName).emit('userCountChange', count)
    }

    io.on('connection', (socket : any) => {
        // Manage Joining

        socket.on('joinRoom', (roomId : string, callback : Function) => {
            if (socket.roomId) {
                callback({
                    status: "You are already in a room"
                });
                return
            }

            let roominfo = data['ROOM_' + roomId]
            if (roominfo) {
                socket.join(roomId);
                roomUpdate(roomId)
                socket.roomId = roomId

                roominfo.connectedIds.push(
                    {id: socket.handshake.query.id, socketId: socket.id, role: 'Peer', joined: Date.now()}
                )

                callback({
                    status: "success",
                    data: roominfo.data,
                    roomSize: io.sockets.adapter.rooms.get(roomId).size,
                    createdAt: roominfo.createdAt
                });
            } else {
                callback({
                    status: "This room does not exist"
                });
                socket.disconnect() 
            }
        });

        socket.on('createRoom', (currentData : Array<roomData>, callback : Function) => {
            if (socket.roomId) {
                callback({
                    status: "You are already in a room"
                });
                return
            }

            let roomId = generateRandomString()
            data['ROOM_' + roomId] = {
                masterId: socket.id,
                createdAt: Date.now(),
                data: currentData,
                connectedIds: [
                    {id: socket.handshake.query.id, socketId: socket.id, role: 'Master', joined: Date.now()}
                ]
            }

            socket.join(roomId);
            roomUpdate(roomId)
            socket.roomId = roomId

            callback({
                status: "success",
                code: roomId
            });
        });

        // Manage data

        socket.on('entryAdd', (newitem : roomData) => {
            data['ROOM_' + socket.roomId].data["E_" + newitem.Id] = newitem
            io.to(socket.roomId).emit("entryAdd", newitem)
        });

        socket.on('entryModify', (modifications : any) => {
            switch (modifications.type) {
                case 'route':
                    data['ROOM_' + socket.roomId].data["E_" + modifications.id].route = modifications.data
                  break;
                case 'delete':
                    delete data['ROOM_' + socket.roomId].data["E_" + modifications.id]
                  break;
                case 'dead':
                    data['ROOM_' + socket.roomId].data["E_" + modifications.id].dead = true
                break;
                case 'checked':
                    data['ROOM_' + socket.roomId].data["E_" + modifications.id].assigned = modifications.data
                break;
                case 'towing':
                    data['ROOM_' + socket.roomId].data["E_" + modifications.id].towing = modifications.data
                break;
            }

            io.to(socket.roomId).emit("entryModify", modifications)
        });

        socket.on("ping", (callback : Function) => {
            callback();
        });

        socket.on("getUsers", (callback : Function) => {
            const room = data['ROOM_' + socket.roomId].connectedIds
            callback({'data' : room});
        });

        // Manage leaving

        socket.on("disconnect", () => { 
            if (!socket.roomId || !data['ROOM_' + socket.roomId]) return // check if the user is in a real room
            
            if (data['ROOM_' + socket.roomId].masterId == socket.id) {
                delete data['ROOM_' + socket.roomId];
                io.in(socket.roomId).disconnectSockets();
            } else {
                const room = data['ROOM_' + socket.roomId].connectedIds
                const userindex = findIndexByName(room, socket.id)
                if (userindex != -1) {
                    delete room[userindex]
                }
                roomUpdate(socket.roomId)
            }
        });
    });
};

router.get('/get', async (req, res) => {
    const roomid = req.query.roomid
    if (!roomid) {res.status(400).send('bad request'); return}
    const room : room = data['ROOM_' + req.query.roomid]
    if (!room) {res.status(404).send('room not found'); return}
    res.send(room.data)
});

module.exports = {socket: socketIO, router: router};