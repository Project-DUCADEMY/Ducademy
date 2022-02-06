let myid = document.querySelector('#userid').value
let connection = new signalR.HubConnectionBuilder().withUrl("/debuggerhub").build();

connection.start().then(() => {
    connection.invoke('StartMessage', myid*1).catch(function (err) {
        return console.error(err.toString());
    });
}).catch(function (err) {
    return console.error(err.toString());
});

connection.onclose(e =>{
    //alert('close connnection')
    document.querySelector('.run_button').disabled = true
})

connection.on('ReceiveMessage',(message) => {
    console.log(message)
});

connection.on('StackDatas',(now, message) => {
    console.log(now)
    drawPointer(now)
    drawAllStackFrame(message.split('\n'))
});

connection.on('standardOut', (message) => {
    consoleMessages.push(message)
    editorLib.clearConsoleScreen()
    editorLib.printToConsole(message)
})


document.querySelector('.editor__run').addEventListener('click', () => {
    console.log(codeEditor.getValue())
    connection.invoke('RunCode', codeEditor.getValue()).catch(function (err) {
        return console.error(err.toString());
    });
})

function themeChange() {
    let theme = document.querySelector('.editor__selector').value
    if(theme === 'default') {
        editorSetting.theme = `ace/theme/xcode`
    }
    else if(theme === 'dark') {
        editorSetting.theme = `ace/theme/dracula`
    }
    editorSetting.code = codeEditor.getValue()
    editorLib.init(editorSetting)
}

function fontSizeChange() {
    editorSetting.fontSize = document.querySelector('.editor__fontsize_bar').value
    editorSetting.code = codeEditor.getValue()
    editorLib.init(editorSetting)
}


pointer.addEventListener('click', () => {
    connection.invoke('ExecuteGdbCmd', "next\n").catch(function (err) {
        return console.error(err.toString());
    });
})