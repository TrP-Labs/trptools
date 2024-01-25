// Server code for dispatch socket
const data = {}

function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
  
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
  
    return randomString;
  }

const socketIO = (server) => {
    const io = require('socket.io')(server);

    function roomUpdate(roomName) {
        const count = io.sockets.adapter.rooms.get(roomName).size
        io.to(roomName).emit('userCountChange', count)
    }

    io.on('connection', (socket) => {
        // Manage Joining

        socket.on('joinRoom', (roomId, callback) => {
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

        socket.on('createRoom', (currentData, callback) => {
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
                data: currentData
            }

            socket.join(roomId);
            roomUpdate(roomId)
            socket.roomId = roomId

            callback({
                status: "success",
                code: roomId
            });
        });

        socket.on('entryAdd', (newitem) => {
            data['ROOM_' + socket.roomId].data["E_" + newitem.Id] = newitem
            io.to(socket.roomId).emit("entryAdd", newitem)
        });

        socket.on('entryModify', (modifications) => {
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
            }

            io.to(socket.roomId).emit("entryModify", modifications)
        });

        socket.on("ping", (callback) => {
            callback();
          });

        // Manage leaving

        socket.on("disconnect", () => { 
            if (!socket.roomId || !data['ROOM_' + socket.roomId]) return // check if the user is in a real room
            
            if (data['ROOM_' + socket.roomId].masterId == socket.id) {
                delete data['ROOM_' + socket.roomId];
                io.in(socket.roomId).disconnectSockets();
            } else {
                roomUpdate(socket.roomId)
            }
        });
    });
};

module.exports = socketIO;