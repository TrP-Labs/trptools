async function solveAll() { // Solve all unsolved route entries
    let i = 0;
    for (const i in dispatchTracker) {
        const item = dispatchTracker[i];
        if (item && !item.route) {
            const solvedroute = await autoSolve(item)
            dispatchTracker[i].route = solvedroute
            modifyEntry({
                id: item.Id,
                type: 'route',
                data: solvedroute
            })
        }
    }
}

function connectButton() { // Fired when the connect button is pressed
    if (currentsocket) {
        manageConnection()
    } else {
        initializeConnection() 
    }
}

function showInput() {
    showCustom({
        title: "Input JSON",
        description: "Paste JSON data from ExportVehicleList command",
        input: [
            {title: '', id: 'prompt-data', textarea: true, focus: true}
        ],
        buttons: [
            {text: "Cancel", color: "#802c2c", function: closewindow},
            {text: "Paste", color: "#2c4980", width: "15%", function: paste},
            {text: "Submit", color: "#4CAF50", function: submit}
        ]
    })
}

function initializeConnection() { // Begin prompt tree for creating a room
    showCustom({
        title: "Would you like to join or create a room?",
        description: "",
        buttons: [
            {text: "Cancel", color: "#802c2c", function: closewindow},
            {text: "Join", color: "#af8c4c", function: join},
            {text: "Create", color: "#4CAF50", function: create}
        ]
    })

    function join() {
        closewindow()
        showCustom({
            title: "Connect to a dispatching room",
            description: "",
            input: [
                { title: 'Join code', id: 'prompt-data', textarea: false, focus: true }
            ],
            buttons: [
                { text: "Cancel", color: "#802c2c", function: closewindow },
                { text: "Connect", color: "#4CAF50", function: runConnect }
            ]
        })
        function runConnect() {
            const joincode = $('#prompt-data').val()
            closewindow()      
           connectRoom(joincode).then(
            function() {
                showCustom({
                    title: "You have successfully joined the room",
                    description: '',
                    buttons: [
                        { text: "Ok", color: "#4CAF50", function: closewindow }
                    ]
                })
            },
            function(error) {
                showCustom({
                    title: "Room join failed",
                    description: 'Error: ' + error,
                    buttons: [
                        { text: "Close", color: "#802c2c", function: closewindow }
                    ]
                })
            }
          );
        }
    }

    async function create() {
        closewindow()

        createRoom().then(

            function(roomid) {
                showCustom({
                    title: "Join code:",
                    description: roomid,
                    buttons: [
                        { text: "Ok", color: "#4CAF50", function: closewindow }
                    ]
                })
            },

            function(error) {
                showCustom({
                    title: "Room creation failed",
                    description: 'Error: ' + error,
                    buttons: [
                        { text: "Close", color: "#802c2c", function: closewindow }
                    ]
                })
            }
        )
    }
}

function manageConnection() { // Begin prompt tree managing your connection
    showCustom({
        title: "Manage or view connection info",
        description: '',
        buttons: [
            {text: "Close", color: "#802c2c", function: closewindow},
            {text: "Manage", color: "#af8c4c", function: manage},     
            {text: "View", color: "#4cacaf", function: view},
        ]
    })

    function manage() {
        showCustom({
            title: "Connection options",
            description: '',
            buttons: [
                {text: "Close", color: "#802c2c", function: closewindow},
                {text: "Disconnect", color: "#802c2c", function: function() {closewindow(); disconnect()}},
            ]
        })
    }

    async function view() {

        const connectedTable = await generateConnectedTable()

        showCustom({
            title: "Connection info",
            description: `
                <h3>Room</h3>
                Room ID: ${currentsocket.roomId} <br>
                Connection established since: ${currentsocket.established.getHours()}:${currentsocket.established.getMinutes()} <br>
                Room created at: ${currentsocket.roomCreated.getHours()}:${currentsocket.roomCreated.getMinutes()}
                <h3>Connected users</h3>
                ${connectedTable.prop('outerHTML')}
                <h3>Debug</h3>
                Transport: ${currentsocket.io.engine.transport.name} <br>
                Server location: US-WEST <br>
            `,
            buttons: [
                { text: "Ok", color: "#4CAF50", function: closewindow }
            ]
        })
    }
}

function openSettings() {
    showCustom({
        title: "Settings",
        description: "Configure how your portal will behave (currently does not save) <br> <sub> Please note advanced route assignment will not be available for custom routes </sub>",
        input: [
            {title: 'Custom route API', id: 'prompt-api', textarea: false},
            {title: 'Custom route listings', id: 'prompt-routes', textarea: true}
        ],
        buttons: [
            {text: "Close", color: "#802c2c", function: closewindow},
            {text: "Save", color: "#4CAF50", function: function() {
                const routeEntry = $('#prompt-routes').val()
                const apiEntry = $('#prompt-api').val()
                const canSet = canSetNewRoutes(routeEntry)
                if (canSet) {
                    routeAPI = apiEntry
                    spawnlocations = JSON.parse(routeEntry)
                    closewindow()
                }
            }},
        ]
    })
    $('#prompt-routes').val(JSON.stringify(spawnlocations))
}

function canSetNewRoutes(data) {
    try {
        data = JSON.parse(data)

        if (validate2(data)) {
            return true
        } else {
            $('#alert-parent').show()
            $('#alert-text').text("Invalid JSON")
            return false;
        }
    } catch {
        $('#alert-parent').show()
        $('#alert-text').text("Could not parse JSON")
        return false;
    }
}

async function paste() {
    const text = await navigator.clipboard.readText()
    let input = $('#prompt-data')
    input.val(text)
}

async function submit() {
    const input = $('#prompt-data')
    const val = input.val()
    const valid = validateString(val)
    if (valid == true) {
        loadeddispatchstring = JSON.parse(val);
        closewindow()

        compare(loadeddispatchstring)
        loadAll(loadeddispatchstring)
    }
}