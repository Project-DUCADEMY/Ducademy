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
    alert('close connnection')
})
connection.on('ReceiveMessage',(message) => {
    console.log(message)
});
connection.on('StackDatas',(now, message) => {
    console.log(now)
    dom_codes[now * 1 - 1].appendChild(pointer)
    drawAllStackFrame(message.split('\n'))
});

document.querySelector('.run_button').addEventListener('click', () => {
    connection.invoke('RunCode', textarea.value).catch(function (err) {
        return console.error(err.toString());
    });
})

pointer.addEventListener('click', () => {
    connection.invoke('ExecuteGdbCmd', "next\n").catch(function (err) {
        return console.error(err.toString());
    });
})

// connection.on("logMessage", function (user, message, time) {
//     insertChating(user, message, timeParser(time))
// });