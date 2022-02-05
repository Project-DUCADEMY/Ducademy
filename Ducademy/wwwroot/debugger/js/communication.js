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
    console.log(consoleMessages)
    editorLib.clearConsoleScreen()
    editorLib.printToConsole(message)
})
console.log(document.querySelector('.editor__run'))
document.querySelector('.editor__run').addEventListener('click', () => {
    console.log(codeEditor.getValue())
    connection.invoke('RunCode', codeEditor.getValue()).catch(function (err) {
        return console.error(err.toString());
    });
})

pointer.addEventListener('click', () => {
    connection.invoke('ExecuteGdbCmd', "next\n").catch(function (err) {
        return console.error(err.toString());
    });
})