function showCustom(info) { // Responsible for creating prompts
    $("#prompt-title").text(info.title)
    if (info.loading == true) {
        $("#prompt-desc").html('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>')
    } else {
        $("#prompt-desc").html('') 
        $("#prompt-desc").html(info.description) 
    }
    
    let focusbox = null

    const ih = $("#prompt-inputholder")
    ih.empty()
    if (info.input) {
        info.input.forEach((input) => {
            $('<h2>', {
                text: input.title
            }).appendTo(ih);


            if (input.textarea == true) {
                let obj = $('<textarea>', {
                    rows: 4,
                    cols: 50,
                    id: input.id,
                })
                if (input.focus == true) {focusbox = obj}
                obj.appendTo(ih);
            } else {
                let obj = $('<input>', {
                    id: input.id,
                })
                if (input.focus == true) {focusbox = obj}
                obj.appendTo(ih);
            }

        });
    }

    const bh = $("#prompt-buttonholder")
    bh.empty()
    if (info.buttons) {
        info.buttons.forEach((button) => {
            if (!button.width) { button.width = '25%' }
            $('<button>', {
                class: 'inputbutton',
                text: button.text,
                style: `background-color: ${button.color}; width: ${button.width};`,
                click: button.function,
            }).appendTo(bh);
        });
    }

    $('#prompt-parent').show();
    $('#overlay').show()
    if (focusbox) {focusbox.focus()}
}

function closewindow() { // Hides prompts
    let item = $('#prompt-parent');
    const input = $('#prompt-data')
    $('#overlay').hide()
    item.hide();
    input.val("")
}

// Console warnings and information
console.log('%c STOP!', 'color: red; font-size: 100px;');
console.log('%c Sharing information found in this window can give people access to your TrPTools account or break the page!', 'color: #7CB9E8; font-size: 15px;');
console.log('%c Unless you understand exactly what you are doing, close this window.', 'color: #7CB9E8; font-size: 15px;');
console.log("%c If you know what you're doing, check out our open-for-contributions repo: https://github.com/Ticko-Grey/trptools", 'color: #7CB9E8; font-size: 12px;');
console.log('\n \n');
console.log("%c This output window should be error-free, If you spot any errors, open an issue on our github 🥺", 'color: #7CB9E8; font-size: 12px;');