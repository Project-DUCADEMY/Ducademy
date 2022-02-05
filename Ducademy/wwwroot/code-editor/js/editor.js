// Retrieve Elements
const consoleLogList = document.querySelector('.editor__console-logs');
const executeCodeBtn = document.querySelector('.editor__run');
const resetCodeBtn = document.querySelector('.editor__reset');

// Setup Ace
let codeEditor = ace.edit("editorCode");
const defaultCode = '#include <stdio.h>\nint main()\n{\n\tprintf("Hello World!\\n");\n}';
let consoleMessages = [];
let editorSetting = {
    theme: 'ace/theme/dracula',
    language: 'ace/mode/c_cpp',
    fontFamily: 'Consolas',
    fontSize: 12,
    code: defaultCode
}

let editorLib = {
    clearConsoleScreen() {
        // consoleMessages.length = 0;

        // Remove all elements in the log list
        while (consoleLogList.firstChild) {
            consoleLogList.removeChild(consoleLogList.firstChild);
        }
    },
    printToConsole() {
        consoleMessages.forEach(log => {
            const newLogItem = document.createElement('li');
            const newLogText = document.createElement('pre');

            newLogText.className = `log log--string`;
            newLogText.textContent = `> ${log}`;

            newLogItem.appendChild(newLogText);
            consoleLogList.appendChild(newLogItem);
        })
    },
    init(setting) {
        // Configure Ace
        // Theme
        codeEditor.setTheme(setting.theme);

        // Set language
        codeEditor.session.setMode(setting.language);

        // Set Options
        codeEditor.setOptions({
            fontFamily: setting.fontFamily,
            fontSize: `${setting.fontSize}pt`,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
        });
        // Set Default Code
        codeEditor.setValue(setting.code);
    }
}
editorLib.init(editorSetting);