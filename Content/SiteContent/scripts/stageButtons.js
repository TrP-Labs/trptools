const audioendpoint = 'https://api.hyra.io/audio/'

async function input(type, data) {
    switch(type) {
        case 'sound':
            const netRes = await fetch(audioendpoint + data)
            const reader = await netRes.arrayBuffer();
            const audioPlayer = $('#audioPlayer')[0]

            var blob = new Blob([reader], { type: 'audio/mp3' });
            var url = window.URL.createObjectURL(blob)

            audioPlayer.src = url;
            audioPlayer.play();
            break;
        case 'file':
            break;
    }
}