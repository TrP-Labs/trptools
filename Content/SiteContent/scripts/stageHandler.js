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
    const wavesurfer = window.WaveSurfer
    surfer = wavesurfer.create({
        container: '#waveform',
        waveColor: '#628FC4',
        progressColor: '#718093',
        url: url,
        dragToSeek: true,
        plugins: [wavesurfer.Timeline.create({
            style: "color: white;",
            container: '#timeline'
        }), wavesurfer.Hover.create(), wavesurfer.Zoom.create()],
    })

    surfer.once('decode', () => {
        const slider = document.querySelector('input[type="range"]')
      
        slider.addEventListener('input', (e) => {
          const px = e.target.valueAsNumber / 2
          surfer.zoom(px)
        })
      })
}