// Client code for dispatch socket
let currentsocket = null

function getConnectionStatus() {
    if (!currentsocket) return null
    return currentsocket.connected
}

async function createRoom() {
    const socket = io();
    return new Promise((resolve, reject) => {
        socket.emit('createRoom', {}, (response) => {
            if (response.status == 'success') {
                resolve(response.code)
                operateSocket(socket)
            } else {
                reject("denied")
            }
        })
    })
}

function connectRoom(roomId) {
    const socket = io();
    socket.emit('joinRoom', roomId, (response) => {
        if (response.status == 'success') {
            operateSocket(socket)
            $('#bottombar .connected').text(response.roomSize + " Connected")
            $('#bottombar .connectiontype').text('Peer')
        }
    })
}

function operateSocket(socket) {
    currentsocket = socket
    $('#bottombar .network').show()
    socket.on('userCountChange', (newcount) => {
        $('#bottombar .connected').text(newcount + " Connected")
    });
}