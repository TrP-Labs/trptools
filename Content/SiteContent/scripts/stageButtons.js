const audioendpoint = 'https://api.hyra.io/audio/'

async function input(type) {
    switch(type) {
        case 'sound':
            const netRes = await fetch(audioendpoint + 5410080926)

            console.log('result recieved')

            const reader = netRes.body.getReader();
            let result = null

            while (true) { // reads the netRes body until its done (last read is undefined but done is true)
                const read = await reader.read();
                if (read.done) {
                    break;
                } else {
                    result = read.value;
                }
            }

            console.log('finished reading')

            console.log(result)

            const audioPlayer = $('#audioPlayer')[0]

            var blob = new Blob([result], { type: 'audio/mp3' });
            var url = window.URL.createObjectURL(blob)
            console.log(url)
            audioPlayer.src = url;
            audioPlayer.play();
            break;
        case 'file':
            break;
    }
}