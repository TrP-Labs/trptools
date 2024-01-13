let dispatchTracker = {}
let loadeddispatchstring = ""

const Ajv = window.ajv7
const ajv = new Ajv();

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
    const parentid = "ENTRY" + number

    // Create entry parent
    $('<tr>', {
        id: parentid,
    }).appendTo('#table');

    // Set Vehicle ID
    $('<td>', {
        text: number,
    }).appendTo('#' + parentid);

    // Set Vehicle Name
    $('<td>', {
        text: dispatchTracker[number].Name,
    }).appendTo('#' + parentid);

    // Set Depot Name
    $('<td>', {
        text: dispatchTracker[number].Depot,
    }).appendTo('#' + parentid);

    // Set Owner Name
    let ownerName = $('<td>', {
        text: "Loading...",
    })

    ownerName.appendTo('#' + parentid);

    /* Currently disabled because proxy system is not implemented yet

    $.ajax({url: "/proxy/name?id="+dispatchTracker[number].OwnerId, success: function(result){
        ownerName.html(result);
    }});
    */

    // Add empty stuff

    $('<td>', {
        html: '<input type="checkbox">',
    }).appendTo('#' + parentid);

    $('<td>', {
        text: ' - ',
    }).appendTo('#' + parentid);

    const buttonholder = $('<td>').appendTo('#' + parentid);

    // Add buttons
    $('<button>', {
        class: 'inputbutton',
        text: 'Solve',
        style: 'background-color: #4CAF50;',
    }).appendTo(buttonholder);

    $('<button>', {
        class: 'inputbutton',
        text: 'Delete',
        style: 'background-color: #802c2c;',
    }).appendTo(buttonholder);

    $('<button>', {
        class: 'inputbutton',
        text: 'Edit',
        style: 'background-color: #81693d;',
    }).appendTo(buttonholder);
}

function createEntry(information) {
    dispatchTracker[information.Id] = information
    appendEntry(information.Id)
}

function deleteEntry(number) {
    $("#ENTRY" + number.toString()).remove();
    dispatchTracker[number] = null;
}

function modifyEntry(number, modifications) {

}

function loadAll() {

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
        loadeddispatchstring = val;
        let item = $('#prompt-parent');
        item.hide();
        input.val("")
    }
}

function cancel() {
    let item = $('#prompt-parent');
    const input = $('#prompt-data')
    item.hide();
    input.val("")
}

function show() {
    let item = $('#prompt-parent');
    item.show();
    const input = $('#prompt-data')
    input.focus();
}