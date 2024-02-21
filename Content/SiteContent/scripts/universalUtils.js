let loggedInUser = 0

function showCustom(info) { // Responsible for creating prompts
    closewindow()
    $("#prompt-title").text(info.title)

    // Set description or loading box
    if (info.loading == true) {
        $("#prompt-desc").html('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>')
    } else {
        $("#prompt-desc").html('') 
        $("#prompt-desc").html(info.description) 
    }
    
    let focusbox = null

    // Add input
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

    // Add checkboxes or radio buttons
    const ch = $("#prompt-choiceholder")
    ch.empty()
    if (info.choices) {
        let lid = 0
        if (info.choices.type == 'checkboxes') {    
            info.choices.data.forEach((cb) => {
                let dv = $('<div>', {class: 'choicediv'}).appendTo(ch);

                $('<input>', {
                    type: 'checkbox',
                    name: "prompt",
                    class: 'checkbox',
                    checked: cb.default,
                    id: 'pi_' + lid,
                    'data-label': cb.label
                }).appendTo(dv);
                $('<label>', {
                    for: 'pi_' + lid,
                    class: "choicelabel",
                    text: cb.label
                }).appendTo(dv);

                lid = lid + 1
            });
        } else if (info.choices.type == 'radiobuttons') {
            info.choices.data.forEach((cb) => {
                let dv = $('<div>', {class: 'choicediv'}).appendTo(ch);

                $('<input>', {
                    type: 'radio',
                    name: "prompt",
                    class: 'checkbox',
                    checked: cb.default,
                    id: 'pi_' + lid,
                    'data-label': cb.label
                }).appendTo(dv);
                $('<label>', {
                    for: 'pi_' + lid,
                    class: "choicelabel",
                    text: cb.label
                }).appendTo(dv);

                lid = lid + 1
            });
        }
    }

    // Add buttons
    const bh = $("#prompt-buttonholder")
    bh.empty()
    if (info.buttons) {
        info.buttons.forEach((button) => {
            if (!button.width) { button.width = '25%' }
            $('<button>', {
                class: 'inputbutton',
                text: button.text,
                style: `background-color: ${button.color}; width: ${button.width};`,
                click: function() {button.function(button.functionParam)},
            }).appendTo(bh);
        });
    }

    // Make the prompt visible
    $('#prompt-parent').show();
    $('#overlay').show()
    if (focusbox) {focusbox.focus()}
}

function getChoicesInput() {
    const checkboxResults = $('input[name="prompt"]:checked').map(function () {
        return $(this).data('label');
    }).get();

    const radioButtonResult = $('input[name="prompt"]:checked').data('label')

    return {checkboxes: checkboxResults, radiobuttons: radioButtonResult}
}

function closewindow() { // Hides prompts
    let item = $('#prompt-parent');
    const input = $('#prompt-data')
    $('#overlay').hide()
    item.hide();
    input.val("")
}

// Async prompt system
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
                setTimeout(checkCondition, 100);
            }
        }

        checkCondition();
    });
}

// Wrapper for forcing radio button selection
async function radioForceSelect(data) {
        showCustom(data)

        await waitForPrompt()
        let type = getChoicesInput().radiobuttons
        if (type) {
            return type;
        } else {
            $('#alert-parent').show()
            $('#alert-text').text("You must select an option")
            return await radioForceSelect(data)
        }
}

// uuidv4 generator
function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

async function loadLogin() {
    let info

    try {
        info = await fetch('/auth/info')
        if (info.status != 200) {return}
        info = await info.json()
    } catch {}

    loggedInUser = info.id

    let element = document.getElementById('loginAccount')
    const par = element.parentElement
    element.remove()
    element = document.createElement('span')
    par.append(element)
    
    const img = document.createElement('img')
    img.style.height = '50px';
    img.style.width = 'auto';
    img.src = info.imageUrl
    element.style.height = '100%'
    element.append(img)
    element.append(info.username)
}

loadLogin()

// Console warnings and information
console.log('%c STOP!', 'color: red; font-size: 100px;');
console.log('%c Sharing information found in this window can give people access to your TrPTools account or break the page!', 'color: #7CB9E8; font-size: 15px;');
console.log('%c Unless you understand exactly what you are doing, close this window.', 'color: #7CB9E8; font-size: 15px;');
console.log("%c If you know what you're doing, check out our open-for-contributions repo: https://github.com/Ticko-Grey/trptools", 'color: #7CB9E8; font-size: 12px;');
console.log('\n \n');
console.log("%c This output window should be error-free, If you spot any errors, open an issue on our github 🥺", 'color: #7CB9E8; font-size: 12px;');