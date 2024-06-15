const groupBase = `|User|Rank|\n|:----------------|:-----:|`

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

async function input() {
    $('#fileInput').click();
    const res = await handleFileSelect()
    if (res) {
        //const url = window.URL.createObjectURL(res);

        return res // not url, url is a blob
    } else {
        return false
    }
}

async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('https://cdn.trptools.com/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            return {result: result.url}
        } else {
            return {status: 'HTTP ' + response.status}
        }
    } catch (error) {
        console.log(error)

        return {status: "Client error"}
    }
}

function surroundSelected(textselected, textarea, specialending) {
    if (textarea.selectionStart != undefined) {
        var startPos = textarea.selectionStart;
        var endPos = textarea.selectionEnd;
        if (startPos == endPos) return
        selectedText = textarea.value.substring(startPos, endPos);
    }

    var newText = textselected + selectedText;

    if (specialending) {
        newText = newText + specialending
    } else {
        newText = newText + textselected
    }

    var beforeText = textarea.value.substring(0, startPos);
    var afterText = textarea.value.substring(endPos, textarea.value.length);
    textarea.value = beforeText + newText + afterText;

    textarea.setSelectionRange(startPos, startPos + newText.length);
}

function lineStartSelect(textselected, textarea, allowEmpty) {
    var startPos = textarea.selectionStart;
    var endPos = textarea.selectionEnd;
    var startOfLine = textarea.value.lastIndexOf("\n", startPos - 1) + 1;
    var endOfLine = textarea.value.indexOf("\n", endPos);

    if (!startOfLine >= 0 && !endOfLine >= 0 && !allowEmpty) return

    var selectedLine = textarea.value.substring(startOfLine, endOfLine);
    var newText = textselected + selectedLine;
    textarea.value = textarea.value.substring(0, startOfLine) + newText + textarea.value.substring(endOfLine);

    var newStartPos = startPos + textselected.length;
    var newEndPos = endPos + textselected.length;
    textarea.setSelectionRange(newStartPos, newEndPos);
}

async function textEditButtonPress(id) {
    const textarea = $('#body')[0]
    const edit = id.split('_')[1]

    switch (edit) {
        // Row 1 
        case 'heading':
            lineStartSelect('# ', textarea)
        break;
        case 'bold':
            surroundSelected('**', textarea)
        break;
        case 'italic':
            surroundSelected('*', textarea)
        break;
        case 'strikethrough':
            surroundSelected('~~', textarea)
        break;
        // Row 2
        case 'code':
            surroundSelected('\n ``` \n', textarea)
        break;
        case 'quote':
            surroundSelected('``', textarea)
        break;
        case 'list':
            lineStartSelect('- ', textarea)
        break;
        case 'link':
            var startPos = textarea.selectionStart;
            var endPos = textarea.selectionEnd;
            if (startPos == endPos) return

            showCustom({
                title: "Input a link",
                input: [{
                    title:"Enter a URL",
                    id: 'url',
                    focus: true
                }],
                buttons: [
                    {text: "Cancel", color: "#802c2c", function: closewindow},
                    {text: "Submit", color: "#4CAF50", function: submit}
                ]
            })

            function submit() {
                closewindow()
                const urlcontent = $('#url').val()
                surroundSelected('[', textarea, '](' + urlcontent + ')')
            }
        break;
        case 'image':
            showCustom({
                title: "Waiting for file",
                loading: true
            })
            const res = await input()
            if (res) {
                showCustom({
                    title: "Uploading file",
                    loading: true
                })
                const upload = await uploadImage(res)
                if (!upload.result) {
                    showCustom({
                        title: "Failed to upload file with response " + upload.status,
                        buttons: [
                            { text: "Close", color: "#802c2c", function: closewindow },
                        ]
                    })
                } else {
                    closewindow()
                    surroundSelected('![', textarea, '](' + upload.result + ')')
                }
            } else {
                showCustom({
                    title: "Failed to load file",
                    buttons: [
                        { text: "Close", color: "#802c2c", function: closewindow },
                    ]
                })
            }
        break; 
        case 'groups':
            showCustom({
                title: "Input data",
                description: "you can get this data by running ExportPlayerList",
                input: [{
                    title:"",
                    id: 'playerExport',
                    focus: true,
                    textarea: true,
                }],
                buttons: [
                    {text: "Cancel", color: "#802c2c", function: closewindow},
                    {text: "Submit", color: "#4CAF50", function: submit2}
                ]
            })

            function submit2() {
                let playerExport = $('#playerExport').val()

                try {
                    playerExport = JSON.parse(playerExport)
                } catch {
                    $('#alert-parent').show()
                    $('#alert-text').text("Could not parse JSON")
                    return
                }

                let currentstring = groupBase + '\n'
                try {
                    playerExport.forEach((item) => {
                        currentstring = currentstring + `|${item.UserId}|${item.Rank}|\n`
                    });
                } catch {
                    $('#alert-parent').show()
                    $('#alert-text').text("Invalid JSON")
                    return
                }

                lineStartSelect(currentstring, textarea, true)
                closewindow()
            }
        break;
    }
}


$(document).ready(function(){
    $(".textEditIcon").each(function(){
        $(this).on( "click", function() {
            textEditButtonPress($(this).attr('id'))
        });
    });

    tags = JSON.parse(tags)
    let i = 0
    tags.forEach((tag) => {
        if (i == 0) {
            $('#tags').val($('#tags').val() + `${tag}`)
        } else {
            $('#tags').val($('#tags').val() + `, ${tag}`)
        }
        i++
    });
});

// Publish and Cancel button handlers
async function Submit() {
    let title = document.getElementById('title').value
    let body = document.getElementById('body').value
    let tags = $('#tags').val().replace(/\s+/g, '').split(',')

    body = body.replace(/(?:\r\n|\r|\n)/g, '\n');

    const thisUrl = new URLSearchParams(window.location.search);
    const articleType = thisUrl.get('articleType');

    if (id) {
        await fetch(`/articles/edit/${id}`, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                title: title,
                body: body,
                tags: JSON.stringify(tags),
            })
        })
        window.location = '/articles/' + id
    } else {
        let response = await fetch(`/articles/post`, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                title: title,
                body: body,
                tags: JSON.stringify(tags),
                articleType: articleType,
            })
        })

        if (response.status == 200) {
            response = await response.json()
            window.location = '/articles/' + response.data
        }
    }        
}

async function Cancel() {
    history.back()
}