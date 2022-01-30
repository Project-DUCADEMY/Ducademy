const textarea = document.querySelector('.textarea')
const codearea = document.querySelector('.code')

var pointer = document.createElement('div')
pointer.classList.add('pointer')

// textarea.value = '#include <stdio.h>\nint main()\n{\nint a;\na = 10;\n}\n';

// document.querySelector('.run_button').addEventListener('click', () => {

//     textarea.value.split('\n').forEach((element, idx) => { //코드를 삽입하는 그래픽 작업
//         let tag = document.createElement('div')
//         tag.classList.add('line')
//         tag.appendChild(document.createTextNode(element));
//         codearea.appendChild(tag)
//         dom_codes[idx] = tag
//     })
//     document.querySelector('.run_button').disabled = true
// })

let stack_frame = document.querySelector('.stackframe')
function drawAllStackFrame(_stack) {
    document.querySelectorAll('.test').forEach(element => {
        stack_frame.removeChild(element)
    })
    for(let i = _stack.length - 1; i >= 0; i--) {
        let stack_member = document.createElement('p')
        let element = _stack[i]
        console.log(element)
        stack_member.innerText = element
        stack_member.classList.add('test')
        stack_frame.appendChild(stack_member)
    }

}


function drawPointer(line) {
    line *= 1
    document.querySelectorAll('.ace_gutter-cell').forEach(element => {
        if(element.textContent * 1 === line) {
            element.appendChild(pointer)
        }
    });
}
