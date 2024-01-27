const audioendpoint = 'https://api.hyra.io/audio/'
let surfer = null

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
                const audioPlayer = $('#audioPlayer')[0]

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
                const audioPlayer = $('#audioPlayer')[0]
                const url = window.URL.createObjectURL(res);

                return url  
            } else {
                return false
            } 
    }
}

function insertFile(url) {
    $('#select-file').hide()
    $('#select-id').hide()
    $('#select-play').show()
    $('#select-export').show()
    surfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#4F4A85',
        progressColor: '#383351',
        url: url,
    })
}