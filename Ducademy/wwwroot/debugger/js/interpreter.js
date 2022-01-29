let interpreter;
let memory;
class Interpreter{
    constructor(_arg) {
        this.code = _arg
        this.splited = _arg.split('\n')
        this.idx = 0;
        this.line = 0;

        this.funcs = new Array()
        this.datas = new Array()
    }
    idxptr() { return this.code[this.idx] }
    preProcessing() {
        this.idx = 0
        let max_length = this.code.length
        let mainIdx = -1
        while(max_length > this.idx) {
            this.jumpSpaEnd()
            if(this.idxptr() == '#') { //전처리 구문 실행
                this.jumpToArg(['\n'])
            }
            else {
                let idx = this.idx
                let temp_mainIdx = idx
                this.jumpToArg([')', ';'])

                if(this.idxptr() == ')') {
                    this.idx = idx
                    let type = this.subByArg(100, ' ')
                    this.jumpSpaEnd()
                    let name = this.subByArg(100, ' ', '(')
                    this.jumpSpaEnd()
                    this.idx++
                    let arg = this.subByArg(100, ')')
                    arg = arg.split(',')
                    let args = new Array()
                    arg.forEach((element) => {
                        let arg_type, arg_name, counter = 0;
                        element.split(' ').forEach(data => {
                            if(data != '') {
                                if(counter == 0){ 
                                    arg_type = data 
                                    counter++
                                }
                                else{ 
                                    arg_name = data
                                    counter = 0
                                    return false 
                                }
                            }
                        })
                        if(element != '') args.push(new Data(arg_type, arg_name, null))
                    })
                    if(name == 'main') mainIdx = temp_mainIdx
                    this.funcs.push(new _Function_(type, name, args))
                    this.jumpToArg(['{'])
                    this.jumpEndofBracket()
                }
                else if(this.idxptr() == ';') {
                    this.idx = idx
                    let type = this.subByArg(100, ' ')
                    this.jumpSpaEnd()
                    this.subByArg(100, ';').split(',').forEach(element => {
                        this.datas.push(new Data(type, element.replace(/ /g, ''), null, null))
                    })
                }
            }
            this.idx++;
        }
        memory = new Memory(this.funcs, this.datas)
        mainIdx = this.code.jumpToArgs(mainIdx, ['{']) + 1
        mainIdx = this.code.jumpArgs(mainIdx, [' ', '\n'])
        return mainIdx
    }
    jumpSpaEnd() { //스페이스와 개행문자를 점부 건너뛰는 함수
        let i = 0;
        while(this.idxptr() == '\n' || this.idxptr() == ' ' || this.idx > this.code.length) {
            this.idx++
            i++
            if(i > 100) {
                this.idx -= i;
                return -1
            }
        }
        return i
    }
    jumpToArg(args) { //특정 매개변수가 나올 때 까지만 인덱스를 증가시키는 함수
        let i = 0;
        while(!valueExist(args.map(element => { return (this.idxptr() == element) }), true)) {
            this.idx++
            i++
            if(i > 100) {
                this.idx -= i;
                return -1
            }
        }
        return i
    }
    jumpEndofBracket() {
        let beginBracket = this.idxptr()
        let endBracket
        if(beginBracket == '{') { endBracket = '}' }
        else if(beginBracket == '[') { endBracket = ']' }
        else if(beginBracket == '(') { endBracket = ')'}
        else { return -1 }
        let counter = 1

        while(1) {
            this.idx++
            if(this.idxptr() == beginBracket) { counter++ }
            else if(this.idxptr() == endBracket) { if(--counter == 0) { break; }}
        }
 
    }
    subByArg(maximun, ...args) {
        let fir = this.idx
        let val = this.jumpToArg(args)
        if(val > maximun || val == -1) {
            console.log(this.idxptr())
            return -1
        }
        return this.code.substring(fir, this.idx)
    }
    idxToLine(arg) {
        let ret = 0
        let i = 0
        while(i++ < arg){ if(this.code[i] == '\n') { ret++ } }
        return ret;
    }
    lineToIdx(arg) {
        let i = 0
        let length = this.code.length
        while(i++ < length){
            if(this.code[i] == '\n') {
                if(--arg <= 0) {
                    return i + 1;
                }
            }
        }
        return -1;
    }

}

const textarea = document.querySelector('.textarea')
const codearea = document.querySelector('.code')
let pointer = document.createElement('div')
let dom_codes = new Array() //DOM에서 보여지는 것들의 배열
pointer.classList.add('pointer')
textarea.value = '#include <stdio.h>\nint main()\n{\nint a;\na = 10;\n}\n';

document.querySelector('.run_button').addEventListener('click', () => {

    //interpreter = new Interpreter(textarea.value)
    
    textarea.value.split('\n').forEach((element, idx) => { //코드를 삽입하는 그래픽 작업
        let tag = document.createElement('div')
        tag.classList.add('line')
        tag.appendChild(document.createTextNode(element));
        codearea.appendChild(tag)
        dom_codes[idx] = tag
    })

    interpreter.idx = interpreter.preProcessing() //전처리 구문 실행
    console.log(interpreter.idxptr())
    memory.executeFunc('main', [])
    drawAllStackFrame(memory.stackSegment.body)
    dom_codes[interpreter.idxToLine(interpreter.idx)].appendChild(pointer)


})
pointer.addEventListener('click', () => {
    let Ccode = interpreter.subByArg(300, ';', '{')
    interpreter.idx++
    interpreter.jumpSpaEnd()
    while(interpreter.idxptr() == '}') {
        memory.command('IMP_RET')
        interpreter.idx++
        interpreter.jumpSpaEnd()
    }
    memory.executeCline(Ccode)
    dom_codes[interpreter.idxToLine(interpreter.idx)].appendChild(pointer)
    drawAllStackFrame(memory.stackSegment.body)
})
function valueExist(arr, val) {
    return arr.some(arrVal => val === arrVal);
}

