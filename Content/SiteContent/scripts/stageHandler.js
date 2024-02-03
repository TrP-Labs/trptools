const audioendpoint = 'https://api.hyra.io/audio/'
let surfer = null

const markerTypeColors = {
    lights: "#a5a5a5",
    color: "#cb5f7e",
    action: "#bbab7d",
    other: "#92bb7d"
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
    ]
}

function convertObject(arr) { // Utility function to convert data to checkbox inputs
    return arr.map(value => ({ label: value }));
}

let isConditionMet = false;

function promptYield() {
  isConditionMet = true;
}

function waitForPrompt() {
  return new Promise(resolve => {

    function checkCondition() {
      if (isConditionMet == true) {
        resolve();
        isConditionMet = false
      } else {
        setTimeout(checkCondition, 100); // Adjust the timeout as needed
      }
    }

    checkCondition();
  });
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
    let promise = new Promise(function(resolve){
        document.body.onfocus = function() {
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
    switch(type) {
        case 'sound':
            try {
                const netRes = await fetch(audioendpoint + data)
                if (netRes.status != 200) {return false}
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

function createMarker(surfer, hoverpos, regions) { // this is where the prompt tree for what type of marker you want will exist, refer to legacy for option listings
    // Establish current values for the marker
    const duration = surfer.getDuration()
    const time = hoverpos * duration
    const markersize = duration / 200

    // Prompt the user for the type of marker that will be added
    showCustom({
        title: "What would you like to add at " + timeFormat(time),
        buttons: [
            { text: "Lights", color: markerTypeColors.lights, function: makeMarkerOfType, functionParam: 'lights' },
            { text: "Color", color: markerTypeColors.color, function: makeMarkerOfType, functionParam: 'colors' },
            { text: "Action", color: markerTypeColors.action, function: makeMarkerOfType, functionParam: 'action' },
            { text: "Other", color: markerTypeColors.other, function: makeMarkerOfType, functionParam: 'other' },
        ]
    })

    // Called once the user decides the marker type, this switch statement simply collects the details before the regions code is ran
    async function makeMarkerOfType(type) {
        closewindow()
        switch(type) {
            case 'lights':
                showCustom({
                    title: "Would you like to turn the lights on or off",
                    choices: {
                        type: 'radiobuttons',
                        data: [{label: 'On'}, {label: 'Off'}]
                    },
                    buttons: [
                        { text: "Ok", color: "#4CAF50", function: promptYield},
                    ]
                })

                await waitForPrompt()
                console.log(getChoicesInput())

                showCustom({
                    title: "Which lights would you like to modify",
                    choices: {
                        type: 'checkboxes',
                        data: convertObject(data.lights)
                    },
                    buttons: [
                        { text: "Ok", color: "#4CAF50", function: promptYield},
                    ]
                })

                await waitForPrompt()
                console.log(getChoicesInput())

                closewindow()
            break;
            case 'colors':
            break;
            case 'action':
            break;
            case 'other':  
            break;
        }
    }

    regions.addRegion({
        start: time - markersize,
        end: time + markersize,
        drag: true,
        resize: false
    })
}

function insertFile(url) {
    $('#select-file').hide()
    $('#select-id').hide()

    $('#select-play').show()
    $('#select-export').show()
    $('#select-slider').show()

    const wavesurfer = window.WaveSurfer
    const hover = wavesurfer.Hover.create()
    const regions = wavesurfer.Regions.create()
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

      $('#waveform').bind('contextmenu', function(e) {
        e.preventDefault();
        createMarker(surfer, lasthover, regions)
   });
}