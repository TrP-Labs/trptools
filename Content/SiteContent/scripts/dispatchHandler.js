let dispatchTracker = {}
let loadeddispatchstring = ""

const Ajv = window.ajv7
const ajv = new Ajv();

const routecolors = {
    "6" : "#d5a55d",
    "9" : "#64ce7b",
    "10" : "#bbce64",
    "14" : "#6e6ec4",
    "16" : "#c86a6a"
}

const schema = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "Id": { "type": "integer" },
            "OwnerId": { "type": "integer" },
            "Name": { "type": "string" },
            "Depot": { "type": "string" }
        },
        "required": ["Id", "OwnerId", "Name", "Depot"],
    }
}

const schema2 = {
    "type": "object",
    "properties": {
      "N/A": {
        "type": "array",
        "items": {
          "type": "integer"
        }
      },
      "Hardbass Island Depot": {
        "type": "array",
        "items": {
          "type": "integer"
        }
      },
      "Main Island Depot": {
        "type": "array",
        "items": {
          "type": "integer"
        }
      }
    },
    "required": ["N/A", "Hardbass Island Depot", "Main Island Depot"]
  }

const validate = ajv.compile(schema);
const validate2 = ajv.compile(schema2);

function importdata(data) {
    $('#table').empty()
    dispatchTracker = {}

    loadAll(Object.values(data))
}

function appendEntry(numindex) {
    const number = dispatchTracker["E_" + numindex].Id
    const info = dispatchTracker["E_" + numindex]

    // Create entry parent
    const entry = $('<tr>', {
        id: number,
    }).appendTo('#table');

    if (info.dead == true) {
        entry.css("background-color","#E37979");
    }

    // Set Vehicle ID
    $('<td>', {
        class: "number",
        text: number,
    }).appendTo(entry);

    // Set Owner Name
    let ownerName = $('<td>', {
        text: "Loading...",
    })

    ownerName.appendTo(entry);

    if (!info.username) {
        $.ajax({url: "/proxy/name?id="+info.OwnerId, success: function(result){
            ownerName.html(result.data);
            info.username = result.data
        }});
    } else {
        ownerName.html(info.username)
    }

    // load route (if it exists)

    let route
    if (!info.route) {
        route = " - "
    } else {
        route = info.route
    }
    const routeobj = $('<td>', {
        text: route,
        class: "route",
    }).appendTo(entry);

    if (route != ' - ') {modifyEntry({id: number, type: 'route', data: route})}

    // Manage checkbox

    let checkboxholder = $('<td>')
    checkboxholder.appendTo(entry);

    const checkbox = $('<input>', {
        type: 'checkbox',
        class: 'checkbox',
        change: function() {
            modifyEntry({id: number, type: 'checked', data: $(this).is(':checked')})
        }
    }).appendTo(checkboxholder);

    if (info.assigned == true) {
        checkbox.prop("checked", true)
    }

    const buttonholder = $('<td>', {
        class: 'buttonholder',
    }).appendTo(entry);

    // Add buttons
    $('<button>', {
        class: 'inputbutton solvebutton',
        text: 'Solve',
        style: 'background-color: #4CAF50;',
        click: function() {
            autoSolve(info, routeobj.text()).then((solvedroute) => {
                modifyEntry({
                    id: number,
                    type: 'route',
                    data: solvedroute
                })
            })
        }
    }).appendTo(buttonholder);

    $('<button>', {
        class: 'inputbutton',
        text: 'Delete',
        style: 'background-color: #802c2c;',
        click: function() {
            function yes_delete() {
                modifyEntry({id: number, type: 'delete'})
                closewindow()
            }
        
            showCustom({
                title: "Delete " + number + "?",
                description: "Are you sure you want to delete bus " + number + " owned by " + dispatchTracker["E_" + number].username + "?",
                buttons: [
                    {text: "No", color: "#802c2c", function: closewindow},
                    {text: "Yes", color: "#4CAF50", function: yes_delete}
                ]
            })   
        }
    }).appendTo(buttonholder);

    $('<button>', {
        class: 'inputbutton',
        text: 'Edit',
        style: 'background-color: #81693d;',
        click: function() { 
            showCustom({
                title: "Apply edits for vehicle " + number,
                description: "",
                input: [
                    {title: "Route", id: "prompt-route", focus: true},
                ],
                buttons: [
                    {text: "Cancel", color: "#802c2c", function: closewindow},
                    {text: "Apply", color: "#4CAF50", function: apply}
                ]
            })

            $('#prompt-route').val(info.route)

            function apply() {
                modifyEntry({id: number, type: 'route', data: $('#prompt-route').val()})
                closewindow()
            }
        }
    }).appendTo(buttonholder);

    $('<button>', {
        class: 'inputbutton',
        text: 'Information',
        style: 'background-color: #326da8;',
        click: function() {
            showCustom({
                title: "Vehicle information for " + number + ":",
                description: `Owner: ${info.username} <br> Depot: ${info.Depot} <br> Vehicle: ${info.Name}`,
                buttons: [
                    {text: "Close", color: "#4CAF50", function: closewindow}
                ]
            })
        }
    }).appendTo(buttonholder);
}

function createEntry(information, dnr) {
    if (dispatchTracker["E_" + information.Id]) return
    dispatchTracker["E_" + information.Id] = information
    appendEntry(information.Id)
    if (!dnr) {
        replicateEntry(information)
    }
}

function modifyEntry(modifications, dnr) {
    switch (modifications.type) {
        case 'route':
            // internal updates
            const routeobj = $("#" + modifications.id).find('.route')
            dispatchTracker["E_" + modifications.id].route = modifications.data

            if (routestatus[modifications.data.toString()] != null) { // check if it exists as to not create NAN custom route entries
                routestatus[modifications.data.toString()]++
            }

            // visual updates
            routeobj.text(modifications.data)

            let color = routecolors[modifications.data]
            if (!color) {color = '#bc42f5'}
            routeobj.css('background-color', color)

            const solvebutton = $("#" + modifications.id).find('.buttonholder').find('.solvebutton')
            solvebutton.css('background-color', '#7e8f46')
            solvebutton.text('Re-Solve')
          break;
        case 'delete':
            $("#" + modifications.id).remove();
            delete dispatchTracker["E_" + modifications.id]
          break;
        case 'dead':
            let obj1 = $("#" + modifications.id) 
            obj1.css("background-color","#E37979");
            dispatchTracker["E_" + modifications.id].dead = true
        break;
        case 'checked':
            let obj2 = $("#" + modifications.id + ' .checkbox') 
            obj2.prop("checked", modifications.data)
            dispatchTracker["E_" + modifications.id].assigned = modifications.data
        break;
    }

    if (!dnr) {
        replicateChange(modifications)
    } 
}

function loadAll(list) {
    let i = 0;
    while (i < list.length) {
        createEntry(list[i]);
        i++;
    }
}

function compare(current) {
    for (const i in dispatchTracker) {
        const item = dispatchTracker[i];

        let found = false;

        let b = 0;
        while (b < current.length) {
            if (current[b].Id == item.Id) {
                found = true
            }
            b++;
        }
        
        if (found == false) {
            modifyEntry({id: item.Id, type: 'dead'})
        }    
    }
}

function validateString(data) {
    try {
        data = JSON.parse(data)

        if (validate(data)) {
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

async function generateConnectedTable() {
    function getUsersAsync() {
        const myPromise = new Promise((resolve, reject) => {
            currentsocket.emit('getUsers', (response) => {
                resolve(response)
            })
        });
        return myPromise
    }

    const socketResponse = await getUsersAsync()

    const table = $('<table>', {
        html: `<tr>
        <th>User</th>
        <th>Joined</th>
        <th>Action</th>
        </tr>`,
    })

    table.addClass("styled-table");
    table.css('margin', 'auto')

    console.log(table)
    let i = 0

    while (i < socketResponse.data.length) {
        const entry = socketResponse.data[i] // currently errors if you have a null proprety (example being someone leaving)
        let suffix = ''

        if (currentsocket.id == entry.socketId) {
            suffix = ' [YOU]'
        }

        if (entry.role == 'Master') {
            suffix = suffix + ' [MASTER]'
        }

        let userData
        try {
            userData = await fetch('/proxy/profile?id=' + entry.id)
            userData = await userData.json()
        } catch {
            userData = {
                username: 'Anonymous User',
                imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1200px-Default_pfp.svg.png"
            }
        }

        const tr = $('<tr>')
        const name = $('<td>', {
            text: userData.username + suffix
        }).appendTo(tr)

        name.prepend($('<img>', {
            src: userData.imageUrl,
            style: 'height: 20px; width: auto;'
        }))

        entry.joined = new Date(entry.joined);

        $('<td>', {
            text: `${entry.joined.getHours()}:${entry.joined.getMinutes()}`
        }).appendTo(tr)
        $('<td>', {
            text: 'kick'
        }).appendTo(tr)

        tr.appendTo(table)
        i++;
    }

    return table
}

// bottombar updates

setInterval(function() {
    // set total
    const total = Object.keys(dispatchTracker).length;
    $('#bottombar .all').text("Vehicles: " + total)

    // update route stats internally
    const calcroutestatus = {
        ['6'] : 0,
        ['9'] : 0,
        ['10'] : 0,
        ['14'] : 0,
        ['16'] : 0,
    }

    for (const key in dispatchTracker) {
        let item = dispatchTracker[key].route
        if (item) { // Some items dont have a route yet!
            if (calcroutestatus[item.toString()] != null) { // check if it exists as to not create NAN custom route entries
                calcroutestatus[item.toString()] = calcroutestatus[item.toString()] + 1  
            } else {
            }
        }
    }

    routestatus = calcroutestatus

    // set route stats
    $('#bottombar .6').text("R6: " + routestatus['6'])
    $('#bottombar .9').text("R9: " + routestatus['9'])
    $('#bottombar .10').text("R10: " + routestatus['10'])
    $('#bottombar .14').text("R14: " + routestatus['14'])
    $('#bottombar .16').text("R16: " + routestatus['16'])

    // set connection status
    const connection = getConnectionStatus()
    if (connection == true) {
        $('#bottombar .connectionstatus').text('Connection stable')
    } else {
        $('#bottombar .connectionstatus').text('Connection lost')
    }
    
}, 500);

setInterval(function() {
    getPing().then((value) => {
        $('#bottombar .connectionlatency').text("Ping: " + value + "ms")
    }).catch((err) => {
        // this just exists to silence the uncaught promise error when you aren't connected
    })
}, 2500);