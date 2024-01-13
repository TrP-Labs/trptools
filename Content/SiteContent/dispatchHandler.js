let dispatchTracker = {}

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
    $('<td>',{
        text: number,
    }).appendTo('#'+parentid);

    // Set Vehicle Name
    $('<td>',{
        text: dispatchTracker[number].Name,
    }).appendTo('#'+parentid);

    // Set Depot Name
    $('<td>',{
        text: dispatchTracker[number].Depot,
    }).appendTo('#'+parentid);

    // Set Owner Name
    let ownerName = $('<td>',{
        text: "Loading...",
    })

    ownerName.appendTo('#'+parentid);

    /* Currently disabled because proxy system is not implemented yet

    $.ajax({url: "/proxy/name?id="+dispatchTracker[number].OwnerId, success: function(result){
        ownerName.html(result);
    }});
    */

    // Add empty stuff

    $('<td>',{
        html: '<input type="checkbox">',
    }).appendTo('#'+parentid);

    $('<td>',{
        text: ' - ',
    }).appendTo('#'+parentid);

    // Add buttons


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