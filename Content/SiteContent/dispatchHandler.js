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
        "required": ["Id", "OwnerId", "Name", "Depot"]
    }
}

const validate = ajv.compile(schema);

function importTrack(track) {
    dispatchTracker = JSON.parse(track)
}

function exportTrack() {
    return JSON.stringify(dispatchTracker)
}

function appendEntry(number) {
    const parentid = number

    // Create entry parent
    $('<tr>', {
        id: parentid,
    }).appendTo('#table');

    // Set Vehicle ID
    $('<td>', {
        text: number,
    }).appendTo('#' + parentid);

    // Set Owner Name
    let ownerName = $('<td>', {
        text: "Loading...",
    })

    ownerName.appendTo('#' + parentid);

    if (!dispatchTracker["E_" + number].username) {
        $.ajax({url: "/proxy/name?id="+dispatchTracker["E_" + number].OwnerId, success: function(result){
            ownerName.html(result.data);
            dispatchTracker["E_" + number].username = result.data
        }});
    } else {
        ownerName.html(dispatchTracker["E_" + number].username)
    }

    // load route (if it exists)

    let route
    if (!dispatchTracker["E_" + number].route) {
        route = " - "
    } else {
        route = dispatchTracker["E_" + number].route
    }
    const routeobj = $('<td>', {
        text: route,
        class: "route",
    }).appendTo('#' + parentid);

    // Manage checkbox

    let checkbox = $('<td>', {
        html: '<input type="checkbox">',
    })
    checkbox.appendTo('#' + parentid);

    if (dispatchTracker["E_" + number].assigned == true) {
        checkbox.find(":first-child").prop("checked", true)
    }

    checkbox.find(":first-child").change(function () {
        if ($(this).is(":checked")) {
            dispatchTracker["E_" + number].assigned = true
        } else {
            dispatchTracker["E_" + number].assigned = false
        }
    });

    const buttonholder = $('<td>').appendTo('#' + parentid);

    // Add buttons
    $('<button>', {
        class: 'inputbutton',
        text: 'Solve',
        style: 'background-color: #4CAF50;',
        click: function() {
            console.log(dispatchTracker["E_" + number])
            const solvedroute = autoSolve(dispatchTracker["E_" + number])

            modifyEntry(number, {
                type : 'route', 
                data : solvedroute
            })
        }
    }).appendTo(buttonholder);

    $('<button>', {
        class: 'inputbutton',
        text: 'Delete',
        style: 'background-color: #802c2c;',
        click: function() {
            deleteEntry($(this).parent().parent().attr('id'));
        }
    }).appendTo(buttonholder);

    $('<button>', {
        class: 'inputbutton',
        text: 'Edit',
        style: 'background-color: #81693d;',
    }).appendTo(buttonholder);

    $('<button>', {
        class: 'inputbutton',
        text: 'Information',
        style: 'background-color: #326da8;',
        click: function() {
            showCustom({
                title: "Vehicle information for vehicle " + number + ":",
                description: `Owner: ${dispatchTracker["E_" + number].username} <br> Depot: ${dispatchTracker["E_" + number].Depot} <br> Vehicle: ${dispatchTracker["E_" + number].Name}`,
                input: false,
                buttons: [
                    {text: "Close", color: "#4CAF50", function: closewindow}
                ]
            })
        }
    }).appendTo(buttonholder);
}

function createEntry(information) {
    if (dispatchTracker["E_" + information.Id]) return
    dispatchTracker["E_" + information.Id] = information
    appendEntry(information.Id)
}

function deleteEntry(number) {
    function yes_delete() {
        $("#" + number).remove();
        delete dispatchTracker["E_" + number]
        closewindow()
    }

    showCustom({
        title: "Delete " + number + "?",
        description: "Are you sure you want to delete bus " + number + " owned by " + dispatchTracker["E_" + number].username + "?",
        input: false,
        buttons: [
            {text: "No", color: "#802c2c", function: closewindow},
            {text: "Yes", color: "#4CAF50", function: yes_delete}
        ]
    })
}

function modifyEntry(number, modifications) {
    switch (modifications.type) {
        case 'route':
            const routeobj = $("#" + number).find('.route')
            dispatchTracker["E_" + number].route = modifications.data
            routeobj.text(modifications.data)
            routeobj.css('background-color', routecolors[modifications.data])
          break;
        case 'number':
            dispatchTracker["E_" + modifications.data] = dispatchTracker["E_" + number]
            delete dispatchTracker["E_" + number]
          break;
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
           const obj = $("#" + item.Id) 
           obj.css("background-color","#E37979");
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

// Button Proccessors

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


function closewindow() {
    let item = $('#prompt-parent');
    const input = $('#prompt-data')
    $('#overlay').hide()
    item.hide();
    input.val("")
}

function show() {
    showCustom({
        title: "Input JSON",
        description: "Paste JSON data from ExportVehicleList command",
        input: true,
        buttons: [
            {text: "Cancel", color: "#802c2c", function: closewindow},
            {text: "Paste", color: "#2c4980", width: "15%", function: paste},
            {text: "Submit", color: "#4CAF50", function: submit}
        ]
    })
}

function solveAll() {
    let i = 0;
    for (const i in dispatchTracker) {
        const item = dispatchTracker[i];
        if (item && !item.route) {
            const solvedroute = autoSolve(item)
            dispatchTracker[i].route = solvedroute

            modifyEntry(item.Id, {
                type : 'route', 
                data : solvedroute
            })
        }
    }
}


function showCustom(info) {
    $("#prompt-title").text(info.title)
    $("#prompt-desc").html(info.description)

    const bh = $("#prompt-buttonholder")
    bh.empty()
    info.buttons.forEach((button) => {
        console.log('button')
        if (!button.width) {button.width = '25%'}
        $('<button>', {
            class: 'inputbutton',
            text: button.text,
            style: `background-color: ${button.color}; width: ${button.width};`,
            click: button.function,
        }).appendTo(bh);
    });

    $('#prompt-parent').show();
    $('#overlay').show()

    const input = $('#prompt-data')
    if (info.input == true) {
        input.show();
        input.focus();
    } else {
        input.hide();
    }
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
        if (item) {
            calcroutestatus[item.toString()] = calcroutestatus[item.toString()] + 1
        }
    }

    routestatus = calcroutestatus

    // set route stats
    $('#bottombar .6').text("R6: " + routestatus['6'])
    $('#bottombar .9').text("R9: " + routestatus['9'])
    $('#bottombar .10').text("R10: " + routestatus['10'])
    $('#bottombar .14').text("R14: " + routestatus['14'])
    $('#bottombar .16').text("R16: " + routestatus['16'])
}, 500);