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
        console.log(roomName + " now has " + count)
        io.to(roomName).emit('userCountChange', count)
    }

    io.on('connection', (socket) => {
        let currentjoin = null

        // Manage Joining

        socket.on('joinRoom', (roomId, callback) => {
            if (currentjoin) {
                callback({
                    status: "fail"
                });
                return
            }

            let roominfo = data['ROOM_' + roomId]
            if (roominfo) {
                socket.join(roomId);
                roomUpdate(roomId)
                currentjoin = roomId

                callback({
                    status: "success",
                    data: roominfo.data,
                    roomSize: io.sockets.adapter.rooms.get(roomId).size
                });
            } else {
                console.log('room does not exist')
                callback({
                    status: "fail"
                });
                socket.disconnect() 
            }
        });

        socket.on('createRoom', (currentData, callback) => {
            if (currentjoin) {
                callback({
                    status: "fail"
                });
                return
            }

            let roomId = generateRandomString()
            data['ROOM_' + roomId] = {
                masterId: socket.Id,
                createdAt: Date.now() / 1000 | 0,
                data: currentData
            }

            socket.join(roomId);
            roomUpdate(roomId)
            currentjoin = roomId

            callback({
                status: "success",
                code: roomId
            });
        });

        // Manage leaving

        socket.on("disconnect", () => {
            if (!io.sockets.adapter.rooms.get(currentjoin)) return
            roomUpdate(currentjoin)
        });
    });
};

module.exports = socketIO;