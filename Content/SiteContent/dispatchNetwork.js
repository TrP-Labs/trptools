// Client code for dispatch socket
let currentsocket = null

function getConnectionStatus() {
    if (!currentsocket) return null
    return currentsocket.connected
}

async function createRoom() {
    const socket = io();
    return new Promise((resolve, reject) => {
        socket.emit('createRoom', dispatchTracker, (response) => {
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
            importdata(response.data)
        }
    })
}

function replicateEntry(entry) {
    if (!currentsocket) return
    currentsocket.emit('entryAdd', entry)
}

function replicateChange(change) {
    if (!currentsocket) return
    currentsocket.emit('entryModify', change)
}

function operateSocket(socket) {
    currentsocket = socket
    $('#bottombar .network').show()
    socket.on('userCountChange', (newcount) => {
        $('#bottombar .connected').text(newcount + " Connected")
    });

    socket.on('entryAdd', (newEntry) => {
        createEntry(newEntry, true)
    });

    socket.on('entryModify', (change) => {
        modifyEntry(change, true)
    });
}