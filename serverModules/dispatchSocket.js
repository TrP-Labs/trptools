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
                console.log('found')
                callback({
                    status: "fail"
                });
                return
            } else {
                console.log(socket.pingCount)
            }

            let roominfo = data['ROOM_' + roomId]
            if (roominfo) {
                socket.join(roomId);
                roomUpdate(roomId)
                socket.roomId = roomId

                callback({
                    status: "success",
                    data: roominfo.data,
                    roomSize: io.sockets.adapter.rooms.get(roomId).size
                });
            } else {
                callback({
                    status: "fail"
                });
                socket.disconnect() 
            }
        });

        socket.on('createRoom', (currentData, callback) => {
            if (socket.roomId) {
                console.log('found')
                callback({
                    status: "fail"
                });
                return
            } else {
                console.log(socket.pingCount)
            }

            let roomId = generateRandomString()
            data['ROOM_' + roomId] = {
                masterId: socket.Id,
                createdAt: Date.now() / 1000 | 0,
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
            if (!socket.pingCount) {socket.pingCount = 0}
            console.log(socket.pingCount = socket.pingCount + 1)
            callback();
          });

        // Manage leaving

        socket.on("disconnect", () => {
            if (!io.sockets.adapter.rooms.get(socket.roomId)) return
            roomUpdate(socket.roomId)
        });
    });
};

module.exports = socketIO;