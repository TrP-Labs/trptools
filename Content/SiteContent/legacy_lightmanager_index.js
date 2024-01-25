let currentAudioFile = null;
let lastrightclick = null;
let lastrightclick2 = null

let timelinetracker = []

const lightlist = [
    'DecorativeRoof',
    'DecorativeFront',
    'Default',
    'Static',
    'DecorativeDiagonal',
    'Background',
    'Tracking',
    'Audience'
]

const colorlist = [
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

// utils

function padZero(number) {
    return (number < 10 ? '0' : '') + number;
}

function findIndexByValue(arr, value) {
    return arr.findIndex(item => item[0] == value);
}

function processArray(inputArray) {
    // Step 1: Remove null entries with entries after them
    for (let i = 0; i < inputArray.length; i++) {
        if (inputArray[i] === null && i < inputArray.length - 1) {
            inputArray.splice(i, 1);
            i--; // Decrement index to recheck the current position
        }
    }

    // Step 2: Sort entries by the number stored in their own index [0]
    inputArray.sort((a, b) => {
        const numA = a[0] || 0;
        const numB = b[0] || 0;
        return numA - numB;
    });

    return inputArray;
}

// event functions
window.addEventListener('DOMContentLoaded', () => {
    const timeline = document.getElementById('timeline');
    const audioPlayer = document.getElementById('audioPlayer');
    const exportbutton = document.getElementById('exportbutton');
    const importbutton = document.getElementById('importbutton');

    timeline.addEventListener('mousemove', function (event) {
        if (event.buttons === 1) {
            const clickX = event.clientX - timeline.getBoundingClientRect().left;

            const percentFromLeft = (clickX / timeline.clientWidth) * 100;

            const totalTime = audioPlayer.duration;
            const newTime = (percentFromLeft / 100) * totalTime;

            audioPlayer.currentTime = newTime;
        }
    });

    timeline.addEventListener('click', function (event) {
        const clickX = event.clientX - timeline.getBoundingClientRect().left;

        const percentFromLeft = (clickX / timeline.clientWidth) * 100;

        const totalTime = audioPlayer.duration;
        const newTime = (percentFromLeft / 100) * totalTime;

        audioPlayer.currentTime = newTime;
    });

    exportbutton.addEventListener('click', function (event) {
        const prettyarray = processArray(timelinetracker)
        const jsonarray = JSON.stringify(prettyarray)
        navigator.clipboard.writeText(jsonarray);
        showDialog("Exported data", `
            The following information has been automatically copied to your clipboard: <br> <br>
            ${jsonarray}
        `)
    });

    importbutton.addEventListener('click', async function (event) {
        document.getElementById('prompt-input').style.display = 'block';
        const promptstring = await showDialog("Import data", "Paste JSON data:")
        const promptjson = JSON.parse(promptstring);
        if (!promptjson) return
        timelinetracker = promptjson

        let i = 0;
        while (i < timelinetracker.length) {
            LoadMarkerFromID(timelinetracker[i][0])
            i++;
        }
    });
});

// button functions

function handleMusicUpload() {
    // get dom
    const audioPlayer = document.getElementById('audioPlayer');
    const musicInput = document.getElementById('musicInput');
    const info = document.getElementById('musicinputinfo');
    const timeline = document.getElementById('timeline');

    // handle files
    const file = musicInput.files[0];
    if (file) {
        audioPlayer.src = URL.createObjectURL(file);
        currentAudioFile = file;
    }

    // add stuff
    info.innerHTML = "Choose new file"
    timeline.style.display = 'block'
    const sourceElement = document.createElement('source');
    sourceElement.src = currentAudioFile;
    sourceElement.type = 'audio/mpeg';
    audioPlayer.appendChild(sourceElement);

    // generate waveform
    createWaveform(audioPlayer, timeline)
}

function playPause() {
    const audioPlayer = document.getElementById('audioPlayer');
    const button = document.getElementById('playpause');
    if (audioPlayer.paused) {
        audioPlayer.play()
        button.innerHTML = "pause"
    } else {
        audioPlayer.pause()
        button.innerHTML = "play_arrow"
    }
}

function LoadMarkerFromID(id) {
    const audioPlayer = document.getElementById('audioPlayer');
    const timeline = document.getElementById('timeline');

    const div = document.createElement('div');
    div.className = 'ticker markingticker'
    div.style.left = ((id / audioPlayer.duration) * 100).toString() + "%"
    div.innerHTML = '.'
    div.dataset.id = id
    div.addEventListener("contextmenu", (e) => { showContextMenu2(e) });
    timeline.appendChild(div);
}

async function createMarker(timeposition) {
    const results = await showPrompt("What event would you like to insert", ['Lights', 'Color', 'Action', 'Tracking'], false)
    let newinfo

    if (results[0] == 'Lights') {
        const results2 = await showPrompt("Would you like to enable or disable the lights", ['Enable', 'Disable'], false)
        const results3 = await showPrompt('Which lights would you like to ' + results2[0].toLowerCase(), lightlist, true)
        newinfo = [timeposition, results2[0], results3]
    }
    if (results[0] == 'Color') {
        const results2 = await showPrompt("What color would you like to set", colorlist, false)
        const results3 = await showPrompt('Which lights would you like to set to ' + results2[0].toLowerCase(), lightlist, true)
        newinfo = [timeposition, 'Color ' + results2[0], results3]
    }
    if (results[0] == 'Action') {
        const results2 = await showPrompt("Which action would you like to perform", ['Light throw', "Small flash", "Big flash"], false)
        newinfo = [timeposition, results2[0]]
    }
    if (results[0] == 'Tracking') {
        const results2 = await showPrompt("Enable or disable tracking", ['Tracking Enable', "Tracking Disable"], false)
        newinfo = [timeposition, results2]
    }

    timelinetracker.push(newinfo)
    LoadMarkerFromID(newinfo[0])
}


function showContextMenu(event) {
    // get clicked time
    const timeline = document.getElementById('timeline');
    const audioPlayer = document.getElementById('audioPlayer');
    hideContextMenu2()

    const clickX = event.clientX - timeline.getBoundingClientRect().left;

    const percentFromLeft = (clickX / timeline.clientWidth) * 100;

    const totalTime = audioPlayer.duration;
    lastrightclick = (percentFromLeft / 100) * totalTime;

    // display menu

    event.preventDefault();

    const contextMenu = document.getElementById('contextMenu');
    const x = event.clientX;
    const y = event.clientY;

    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.display = 'block';

    // Hide the context menu when clicking anywhere else
    document.addEventListener('click', hideContextMenu);
}

function showContextMenu2(event) {
    lastrightclick2 = event.target
    event.stopPropagation();
    event.preventDefault();
    hideContextMenu()

    const contextMenu = document.getElementById('contextMenu2');
    const x = event.clientX;
    const y = event.clientY;

    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.display = 'block';

    // Hide the context menu when clicking anywhere else
    document.addEventListener('click', hideContextMenu2);
}


function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'none';
    document.removeEventListener('click', hideContextMenu);
}

function hideContextMenu2() {
    const contextMenu = document.getElementById('contextMenu2');
    contextMenu.style.display = 'none';
    document.removeEventListener('click', hideContextMenu2);
}

function handleMenuOption(option) {
    if (option == 'event') {
        createMarker(lastrightclick)
    }
    hideContextMenu();
}

function handleMenuOption2(option) {
   




    if (option == 'details') {
        const object = timelinetracker[findIndexByValue(timelinetracker, lastrightclick2.dataset.id)]
        const currentTime = object[0]
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        const ms = Math.floor((currentTime % 1) * 1000);

        let objects = JSON.stringify(object[2])

        if (!objects) {objects = "All"}

        console.log(object)
        showDialog("Action info", `
        Action to perform: ${object[1]} <br>
        Lights for the action to be performed on: ${objects} <br>
        At: ${padZero(minutes) + ':' + padZero(seconds) + ':' + ms}
        `)
    }

    if (option == 'delete') {
        const objectindex = findIndexByValue(timelinetracker, lastrightclick2.dataset.id)
        timelinetracker[objectindex] = null
        lastrightclick2.remove()
    }
    hideContextMenu2();
}


// interval functions

function tracktime(audio, timetracker) {
    const currentTime = audio.currentTime;

    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const ms = Math.floor((currentTime % 1) * 1000);

    const formattedTime = padZero(minutes) + ':' + padZero(seconds) + ':' + ms;
    console.log(formattedTime)

    timetracker.innerHTML = formattedTime
}

function SetTrackLoop(audioplayer, ticker) {
    ticker.style.left = ((audioplayer.currentTime / audioplayer.duration) * 100).toString() + "%"
}

function Main() {
    const audioPlayer = document.getElementById('audioPlayer');
    const ticker = document.getElementById('ticker');
    const timetracker = document.getElementById('timeelapsed');
    SetTrackLoop(audioPlayer, ticker)
    tracktime(audioPlayer, timetracker)
}

setInterval(Main, 25);


// prompt system

function showPrompt(message, options, allowMultiple) {
    return new Promise((resolve, reject) => {
        var promptContainer = document.getElementById('prompt-container');
        var promptMessage = document.getElementById('prompt-message');
        var optionsContainer = document.getElementById('options-container');

        promptMessage.textContent = message;
        optionsContainer.innerHTML = '';

        options.forEach(function (option) {
            var inputType = allowMultiple ? 'checkbox' : 'radio';

            var input = document.createElement('input');
            input.type = inputType;
            input.name = 'options';
            input.value = option;

            var label = document.createElement('label');
            label.appendChild(input);
            label.appendChild(document.createTextNode(option));
            optionsContainer.appendChild(label);
        });

        promptContainer.style.display = 'block';

        // Resolve the promise with selected options when the user clicks submit
        submitPrompt = function () {
            var selectedOptions = [];
            var checkboxes = document.getElementsByName('options');

            checkboxes.forEach(function (checkbox) {
                if (checkbox.checked) {
                    selectedOptions.push(checkbox.value);
                }
            });

            hidePrompt();

            if (selectedOptions.length > 0) {
                resolve(selectedOptions);
            } else {
                reject('Please select at least one option.');
            }
        };
    });
}

function hidePrompt() {
    var promptContainer = document.getElementById('prompt-container');
    promptContainer.style.display = 'none';
}

// non questioning prompt system (data)

let promptResolve;

function showDialog(title, message) {
    // Set dialog title and message
    document.getElementById('dialog-title').textContent = title;
    document.getElementById('dialog-message').innerHTML = message;

    // Show overlay and dialog
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('custom-dialog').style.display = 'block';

    return promptAsync();
}

function hideDialog() {
    const inputValue = document.getElementById('prompt-input').value;

    // Hide overlay and dialog
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('custom-dialog').style.display = 'none';

    // Clear input field and hide it for the next prompt
    document.getElementById('prompt-input').value = '';
    document.getElementById('prompt-input').style.display = 'none';

    // Resolve the promise with the entered value
    promptResolve(inputValue);
}

function promptAsync() {
    // Create a promise that resolves with the entered value
    return new Promise((resolve) => {
        promptResolve = resolve;
    });
}

// waveform

function createWaveform(audio, object) {
    // Initialize WaveSurfer
    var wavesurfer = WaveSurfer.create({
      container: object,
      barWidth: 0.5,
      cursorWidth: 0, // Hide the playhead cursor
      hideScrollbar: true, // Hide the scrollbar
      interact: false, // Disable interaction
      normalize: true,
      height: 100,
    });

    console.log(wavesurfer)

    // Load audio file
    wavesurfer.load(audio.src);

    // Return the WaveSurfer instance
    return wavesurfer;
  }