const audioendpoint = 'https://api.hyra.io/audio/'
let surfer = null
let regions = null

let stateTracker = {}

const markerTypeColors = {
    lights: "#a5a5a599",
    colors: "#cb5f7e99",
    action: "#bbab7d99",
    other: "#92bb7d99",
    notFound: "#80808099"
}

const data = {
    lights: [
        'DecorativeRoof',
        'DecorativeFront',
        'Default',
        'Static',
        'DecorativeDiagonal',
        'Background',
        'Tracking',
        'Audience'
    ],
    colors: [
        'Random',
        'Red',
        'Green',
        'Blue',
        'Cyan',
        'Magenta',
        'Yellow',
        'White',
        'Orange'
    ],
    actions: [
        "Light throw",
        "Small flash",
        "Big flash",
    ],
    other: [
        "Tracking Disable",
        "Tracking Enable",
        "Animated background Disable",
        "Animated background Enable"
    ]
}

const commandToColor = {
    Color : 'colors',
    Disable: 'lights',
    Enable: 'lights',
    Light : 'action',
    Small : 'action',
    Big :'action',
    Tracking :'other',
    Animated :'other',
}

function getChoiceFromCommand(command) {
    const split = command.split(" ")[0]
    const res = commandToColor[split]
    if (res) {
        return res
    } else {
        return 'notFound'
    }
}

function convertObject(arr) { // Utility function to convert data to checkbox inputs
    return arr.map(value => ({ label: value }));
}

function timeFormat(duration) { // Creates formatted time from seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;

    let ret = "";
    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;

    return ret;
}

async function handleFileSelect() {
    let promise = new Promise(function (resolve) {
        document.body.onfocus = function () {
            let files = $('#fileInput').prop('files');
            if (!files[0]) {

                setTimeout(() => {
                    let files = $('#fileInput').prop('files');
                    if (!files) {
                        resolve(false)
                    } else {
                        resolve(files[0])
                    }
                }, 500);

            } else {
                resolve(files[0])
            }
        }
    });
    return promise
}

async function input(type, data) {
    switch (type) {
        case 'sound':
            try {
                const netRes = await fetch(audioendpoint + data)
                if (netRes.status != 200) { return false }
                const reader = await netRes.arrayBuffer();

                var blob = new Blob([reader], { type: 'audio/mp3' });
                var url = window.URL.createObjectURL(blob)

                return url
            } catch {
                return false
            }
        case 'file':
            $('#fileInput').click();
            const res = await handleFileSelect()
            if (res) {
                const url = window.URL.createObjectURL(res);

                return url
            } else {
                return false
            }
    }
}

function insertMarker(regions, info) {
    $('#select-data').hide()
    $('#select-export').show()

    const markersize = info.duration / 500

    const reg = regions.addRegion({
        id: info.markerid,
        start: info.time - markersize,
        end: info.time + markersize,
        drag: true,
        resize: false,
        color: markerTypeColors[info.type]
    })

    reg.on('dblclick', function (e) {
        const data = stateTracker[reg.id]
        const time = timeFormat(reg.start + (reg.end - reg.start) / 2)

        showCustom({
            title: "Information for marker at " + time,
            description: `
                Command: <span style="color: #696969; overflow-wrap: anywhere;"> ${JSON.stringify(data)} </span> <br> <br>
                ID: ${reg.id}
            `,
            buttons: [
                { text: "Ok", color: "#4CAF50", function: closewindow },
                { text: "Delete", color: "#802c2c", function: deleteMarker }
            ]
        })
    });

    function deleteMarker() {
        closewindow()
        stateTracker[reg.id] = null
        reg.remove()
    }
}

async function createMarker(surfer, hoverpos, regions) { // this is where the prompt tree for what type of marker you want will exist
    // Establish current values for the marker
    const duration = surfer.getDuration()
    const time = hoverpos * duration

    // Prompt the user for the type of marker that will be added
    let type = await radioForceSelect({
        title: "What would you like to add at " + timeFormat(time),
        choices: {
            type: 'radiobuttons',
            data: [
                { label: 'Lights' },
                { label: 'Colors' },
                { label: 'Action' },
                { label: 'Other' }
            ]
        },
        buttons: [
            { text: "Ok", color: "#4CAF50", function: promptYield }
        ]
    })
    type = type.toLowerCase()

    const markerid = uuidv4()

    switch (type) { // Switch to handle different types of data
        case 'lights':
            const onoff = await radioForceSelect({
                title: "What would you like to do to the lights",
                choices: {
                    type: 'radiobuttons',
                    data: [{ label: 'Enable' }, { label: 'Disable' }]
                },
                buttons: [
                    { text: "Ok", color: "#4CAF50", function: promptYield },
                ]
            })

            showCustom({
                title: "Which lights would you like to modify",
                choices: {
                    type: 'checkboxes',
                    data: convertObject(data.lights)
                },
                buttons: [
                    { text: "Ok", color: "#4CAF50", function: promptYield },
                ]
            })

            await waitForPrompt()
            const lightsToModify = getChoicesInput().checkboxes

            stateTracker[markerid] = [onoff, lightsToModify]

            closewindow()
            break;
        case 'colors':
            const colors = await radioForceSelect({
                title: "What color would you like to set the lights to",
                choices: {
                    type: 'radiobuttons',
                    data: convertObject(data.colors)
                },
                buttons: [
                    { text: "Ok", color: "#4CAF50", function: promptYield },
                ]
            })

            showCustom({
                title: "Which lights would you like to set to " + colors.toLowerCase(),
                choices: {
                    type: 'checkboxes',
                    data: convertObject(data.lights)
                },
                buttons: [
                    { text: "Ok", color: "#4CAF50", function: promptYield },
                ]
            })

            await waitForPrompt()
            const lightsToColor = getChoicesInput().checkboxes

            stateTracker[markerid] = ['Color ' + colors, lightsToColor]

            closewindow()
            break;
        case 'action':
            const action = await radioForceSelect({
                title: "Which action would you like to perform",
                choices: {
                    type: 'radiobuttons',
                    data: convertObject(data.actions)
                },
                buttons: [
                    { text: "Ok", color: "#4CAF50", function: promptYield },
                ]
            })

            stateTracker[markerid] = [action]

            closewindow()
            break;
        case 'other':
            const otheraction = await radioForceSelect({
                title: "What would you like to do",
                choices: {
                    type: 'radiobuttons',
                    data: convertObject(data.other)
                },
                buttons: [
                    { text: "Ok", color: "#4CAF50", function: promptYield },
                ]
            })

            stateTracker[markerid] = [otheraction]

            closewindow()
            break;
            break;
    }

    insertMarker(regions, {
        markerid: markerid,
        time: time,
        duration: duration,
        type: type
    })
}

function insertMarkers() {
    dataToImport.forEach(function (item) {
        const markerid = uuidv4()
        let noTimeCopy = item.slice()
        noTimeCopy.shift()
        stateTracker[markerid] = noTimeCopy

        insertMarker(regions, {
            markerid: markerid,
            time: item[0],
            duration: surfer.getDuration(),
            type: getChoiceFromCommand(item[1])
        })
    });
}

function insertFile(url) {
    $('#select-file').hide()
    $('#select-id').hide()

    $('#select-play').show()
    $('#select-slider').show()

    const wavesurfer = window.WaveSurfer
    const hover = wavesurfer.Hover.create()
    regions = wavesurfer.Regions.create()
    surfer = wavesurfer.create({
        container: '#waveform',
        waveColor: '#628FC4',
        progressColor: '#718093',
        url: url,
        dragToSeek: true,
        plugins: [wavesurfer.Timeline.create({
            style: "color: white;",
            container: '#timeline'
        }), hover, wavesurfer.Zoom.create(), regions],
    })

    surfer.once('decode', () => {
        const slider = document.querySelector('input[type="range"]')

        slider.addEventListener('input', (e) => {
            const px = e.target.valueAsNumber / 2

            if (px == 0) {
                $('#timeline').show()
            } else {
                $('#timeline').hide()
            }

            surfer.zoom(px)
        })
    })


    let lasthover = 0
    hover.on('hover', function (e) {
        lasthover = e
    });

    $('#waveform').bind('contextmenu', function (e) {
        e.preventDefault();
        createMarker(surfer, lasthover, regions)
    });


    surfer.on('ready', function (e) {
        if (dataToImport) {
            insertMarkers()
        } 
    });
}