async function promptContent(type) {
    switch(type) {
        case 'sound':
            showCustom({
                title: "Sound ID",
                description: "Paste a Sound ID from create.roblox.com",
                input: [
                    {title: '', id: 'prompt-data', textarea: false, focus: true}
                ],
                buttons: [
                    {text: "Cancel", color: "#802c2c", function: closewindow},
                    {text: "Submit", color: "#4CAF50", function: acceptID}
                ]
            })

            async function acceptID() {
                const id = $('#prompt-data').val()
                showCustom({
                    title: "Downloading sound ID",
                    loading: true
                })
                const res = await input('sound', id)
                if (res == true) {
                    showCustom({
                        title: "Successfully downloaded sound",
                        buttons: [
                            {text: "Ok", color: "#4CAF50", function: closewindow},
                        ]
                    })
                } else {
                    showCustom({
                        title: "Failed to downloaded sound",
                        buttons: [
                            {text: "Close", color: "#802c2c", function: closewindow},
                        ]
                    })
                }
            }
        break;
        case 'file':
            const id = $('#prompt-data').val()
            showCustom({
                title: "Waiting for file",
                loading: true
            })
            const res = await input('file')
            if (res == true) {
                showCustom({
                    title: "Successfully loaded file",
                    buttons: [
                        { text: "Ok", color: "#4CAF50", function: closewindow },
                    ]
                })
            } else {
                showCustom({
                    title: "Failed to load file",
                    buttons: [
                        { text: "Close", color: "#802c2c", function: closewindow },
                    ]
                })
            }
        break;
    }
}