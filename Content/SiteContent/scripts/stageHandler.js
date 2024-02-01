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

function createMarker(surfer, hoverpos) { // this is where the prompt tree for what type of marker you want will exist, refer to legacy for option listings
    const duration = surfer.getDuration()
    const time = hoverpos * duration
    const markersize = duration / 200

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
        createMarker(surfer, lasthover)
   });
}