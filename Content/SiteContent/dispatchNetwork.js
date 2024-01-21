// Client code for dispatch socket
let currentsocket = null

const readableDisconnectionReasons = {
    'io client disconnect' : 'Client disconnected',
    'io server disconnect' : 'Room has closed',
}

function getConnectionStatus() {
    if (!currentsocket) return null
    return currentsocket.connected
}

async function createRoom() {
    if (!currentsocket) {
        currentsocket = io();
    }
    return new Promise((resolve, reject) => {
        currentsocket.emit('createRoom', dispatchTracker, (response) => {
            if (response.status == 'success') {
                resolve(response.code)
                operateSocket(currentsocket)
                currentsocket.roomId = response.code
                currentsocket.established = new Date();
                currentsocket.roomCreated = new Date();
            } else {
                reject(response.status)
            }
        })
    })
}

function connectRoom(roomId) {
    if (!currentsocket) {
        currentsocket = io();
    }
    return new Promise((resolve, reject) => {
        currentsocket.emit('joinRoom', roomId, (response) => {
            if (response.status == 'success') {
                operateSocket(currentsocket)
                currentsocket.roomId = roomId
                currentsocket.established = new Date();
                currentsocket.roomCreated = new Date(response.createdAt);
                $('#bottombar .connected').text(response.roomSize + " Connected")
                $('#bottombar .connectiontype').text('Peer')
                importdata(response.data)
                resolve('success')
            } else {
                reject(response.status)
            }
        })
    });
}

function replicateEntry(entry) {
    if (!currentsocket) return
    currentsocket.emit('entryAdd', entry)
}

function replicateChange(change) {
    if (!currentsocket) return
    currentsocket.emit('entryModify', change)
}

function getPing() {
    return new Promise((resolve, reject) => {
        if (!currentsocket) {reject(); return}
        const start = Date.now();

        currentsocket.emit("ping", () => {
            const duration = Date.now() - start;
            resolve(duration)
        });
    })
}

function disconnect() {
    $('#bottombar .network').hide()
    currentsocket.disconnect()
    currentsocket = null
}

function operateSocket(socket) {
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

    socket.on("disconnect", (reason) => {
        console.log(reason)
        $('#bottombar .network').hide()
        currentsocket = null

        console.log(readableDisconnectionReasons[reason])

        let readablename = readableDisconnectionReasons[reason] || reason


        showCustom({
            title: "Disconnected from server",
            description: 'Reason: ' + readablename,
            buttons: [
                {text: "Close", color: "#802c2c", function: closewindow}
            ]
        })
    });
}