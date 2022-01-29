const operator = new Array('(', ')', '=', '+', '-', '/', '%', '*', ';', ' ', '!')
const numbers = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
class Memory {
    constructor(_funcs, _datas) {
        this.stackSegment = new Stack()
        this.dataSegment = _datas
        this.codeSegment = _funcs
        this.heapSegment = null;
        // this.resister = new Resister()
    }
    executeFunc(_func, _params) {
        let func = this.codeSegment.find(element => { return element.name == _func })
        this.stackSegment.push(new Data(func.type, func.name, 0x21312da))
        //console.log(func.args)
        func.args.forEach((element, idx) => {
            this.stackSegment.push(new Data(element.type, element.name, _params[idx]))
        })
    }
    executeCline(_line) { 
        
        _line = _line.substring(_line.jumpArgs(0, [' ']), _line.length)
        console.log(_line)
        let keyWord = _line.withKeyWord()
        //console.log(keyWord)
        if(keyWord == 'char' || keyWord == 'unsigned char' ||
        keyWord == 'short' || keyWord == 'int' || keyWord == 'long' || keyWord == 'long long' ||
        keyWord == 'unsigned short' || keyWord == 'unsigned int' || 
        keyWord == 'unsigned long' || keyWord == ' unsigned long long' ||
        keyWord == 'float' || keyWord == 'double' || keyWord == 'unsigned float' || keyWord == 'unsigned double') {
            this.stackSegment.push(new Data(keyWord, _line.cutTo(keyWord.length - 1, [' ']).replace(' ', ''), null))
            //console.log(this.stackSegment.topData())
        }
        else if(keyWord == 'if' || keyWord == 'while') {
            this.stackSegment.push('int', 'if', null)
            let start = _line.jumpToArgs(0, ['('])
            let end = _line.jumpEndofBracket(start)
            return this.calculateAll(_line.substring(start + 1, end)) ? 'NEXT' : 'SKIP'
        }
        else if(keyWord == 'for') {
            console.log(this.stackSegment.topData())
        }
        else {
            this.calculateAll(_line)
        }
        return 'NEXT'
    }
    command(_string) {
        console.log(_string)
    }
    calculate(_line, _idx, _oper) {
        let fir = _line.cutTo(_idx, [' ', ';'], true)
        let sec = _line.cutTo(_idx, [' ', ';'], false)
        fir = fir.isNumber() ? fir * 1 : this.accessVariable(fir)
        sec = sec.isNumber() ? sec * 1 : this.accessVariable(sec)
        let range = _line.influnceSize(_idx)
        _line = _line.remove(range[0], range[1])
        return _line.insert(range[0], _oper(fir, sec))
    }
    compare(_line, _idx, _oper) {
        let fir = _line.cutTo(_idx, [' ', ';'], true)
        let sec = _line.cutTo(_idx + 1, [' ', ';'], false)
        fir = fir.isNumber() ? fir * 1 : this.accessVariable(fir)
        sec = sec.isNumber() ? sec * 1 : this.accessVariable(sec)
        let range = _line.influnceSize(_idx)
        _line = _line.remove(range[0], range[1])
        return _line.insert(range[0], _oper(fir, sec))
    }
    accessMemory(_location) {
        if(_location < 100) { return this.resister.body[_location] }
        else if(_location < 10000) { return this.stackSegment.body[_location - 100] }
        else return -1
    }
    accessVariable(_name) {
        let ret = this.stackSegment.body.find(element => { return element.name == _name })
        if(ret == undefined) { ret = this.dataSegment.find(element => { return element.name == _name })}
        return ret
    }

    ADD(_data1, _data2) {
        if(typeof(_data1) == 'object') _data1 = _data1.value()
        if(typeof(_data2) == 'object') _data2 = _data2.value()
        return _data1 + _data2
        return this.resister.enroll(new Data(_data1.type, 'res', _data1.value() + _data2.value(), null))
    }
    SUB(_data1, _data2) {
        if(typeof(_data1) == 'object') _data1 = _data1.value()
        if(typeof(_data2) == 'object') _data2 = _data2.value()
        return _data1 - _data2
        return this.resister.enroll(new Data(_data1.type, 'res', _data1.value() - _data2.value(), null))
    }
    MUL(_data1, _data2) {
        if(typeof(_data1) == 'object') _data1 = _data1.value()
        if(typeof(_data2) == 'object') _data2 = _data2.value()
        return _data1 * _data2
        return this.resister.enroll(new Data(_data1.type, 'res', _data1.value() * _data2.value(), null))
    }
    DIV(_data1, _data2) {
        if(typeof(_data1) == 'object') _data1 = _data1.value()
        if(typeof(_data2) == 'object') _data2 = _data2.value()
        return _data1 / _data2
        return this.resister.enroll(new Data(_data1.type, 'res', _data1.value() / _data2.value(), null))
    }
    MOD(_data1, _data2) {
        if(typeof(_data1) == 'object') _data1 = _data1.value()
        if(typeof(_data2) == 'object') _data2 = _data2.value()
        return _data1 % _data2
        return this.resister.enroll(new Data(_data1.type, 'res', _data1.value() % _data2.value(), null))
    }
    INC(_location) {
        let oper = this.accessMemory(_location)
        oper.setValue(oper.value() + 1)
    }
    DEC(_location) {
        let oper = this.accessMemory(_location)
        oper.setValue(oper.value() - 1)
    }
    MOV(_location, _data) {
        if(typeof(_location) != 'object') return -1
        if(typeof(_data) == 'object') _data = _data.value()
        try{ _location.setValue(_data) }
        catch(error) {
            console.error(error)
            return error;
        }
    }
    AND(_data1, _data2) {
        if(typeof(_data1) == 'object') _data1 = _data1.value()
        if(typeof(_data2) == 'object') _data2 = _data2.value()
        return _data1 & _data2
        return this.resister.enroll(new Data(_data1.type, 'res', _data1.value() & _data2.value(), null))
    }
    OR(_data1, _data2) {
        if(typeof(_data1) == 'object') _data1 = _data1.value()
        if(typeof(_data2) == 'object') _data2 = _data2.value()
        return _data1 | _data2
        return this.resister.enroll(new Data(_data1.type, 'res', _data1.value() | _data2.value(), null))
    }
    NOT(_data) {
        if(typeof(_data) == 'object') _data = _data.value()
        return !_data
        return this.resister.enroll(new Data(_data.type, 'res', !_data.value(), null))
    }
    EQU(_data1, _data2) {
        if(typeof(_data1) == 'object') _data1 = _data1.value()
        if(typeof(_data2) == 'object') _data2 = _data2.value()
        return _data1.value() == _data2() ? 1 : 0
    }
    LBIG(_data1, _data2) {
        if(typeof(_data1) == 'object') _data1 = _data1.value()
        if(typeof(_data2) == 'object') _data2 = _data2.value()
        return _data1.value() > _data2() ? 1 : 0
    }
    RBIG(_data1, _data2) {
        if(typeof(_data1) == 'object') _data1 = _data1.value()
        if(typeof(_data2) == 'object') _data2 = _data2.value()
        return _data1.value() < _data2() ? 1 : 0
    }
    calculateAll(_line) {
        let equal = _line.indexOf('=')
        if(_line[equal + 1] == '=' || _line[equal - 1] == '!') equal = -1 
        let operation_line = equal == -1 ? _line : _line.substring(equal + 1, _line.length)
        let idx = 0
        
        while(true) {
            let begin = operation_line.jumpArgs(idx, new Array().concat(operator, numbers))
            let end = operation_line.jumpToArgs(begin, new Array().concat(operator, numbers))
            if(begin >= operation_line.length || begin == end) break
            let vari = operation_line.substring(begin, end)
            operation_line = operation_line.remove(begin, end)
            console.log(vari)
            operation_line = operation_line.insert(begin, this.accessVariable(vari).value())
        } 
        console.log(operation_line)
        console.log(equal)
        let ret
        try {
            ret = new Function('return ' + operation_line)()
        } catch (err) {
            console.error(err);
        }

        let mov_calc = _line[equal - 1]
        let inputData = this.accessVariable(_line.substring(0, equal - 1).replace(' ', ''))
        if((mov_calc == '+' || mov_calc == '-' || mov_calc == '*' || mov_calc == '/') && equal != -1) {
            let func = new Function('inputData,ret,func','func(inputData, inputData.value()' + mov_calc + 'ret)')
            try {  func(inputData, ret, this.MOV) }
            catch (err) { console.error(err) }
        }
        else if(true) {
            this.MOV(inputData, ret)
        }
        else {
            return ret
        }
        return ret

        // _line.split('').forEach((element, idx) => {
        //     if(element == '=') {
        //         let fir = _line.cutTo(idx, [' ', ';'], true)
        //         let sec = _line.cutTo(idx, [' ', ';'], false)
        //         fir = fir.isNumber() ? fir * 1 : this.accessVariable(fir)
        //         sec = sec.isNumber() ? sec * 1 : this.accessVariable(sec)
        //         this.MOV(fir, sec)
        //         let range = _line.influnceSize(idx)
        //         _line = _line.remove(range[0], range[1])  
        //     }
        // })
    }
}

class _Function_ {
    constructor(_type, _name,  _args) {
        this.type = _type
        this.name = _name
        this.args = _args
    }
}

class Data {
    constructor(_type, _name, _value) {
        this.type = _type
        this.name = _name
        this.size = 0;
        this.binary
        if(_type == 'char') this.size = 1
        else if(_type == 'short') this.size = 2;
        else if(_type == 'int' || _type == 'long' || _type == 'float') this.size = 4
        else if(_type == 'double' || _type == 'long long') this.size = 8
        else this.size = 4
        this.binary = new ArrayBuffer(this.size)

        this.setValue(_value)
    }
    toAccessableData(_type) {
        if(_type == 'char') {
            return new Int8Array(this.binary)
        }
        else if(_type == 'short') {
            return new Int16Array(this.binary)
        } 
        else if(_type == 'int' || _type == 'long' || _type == 'float') {
            return  _type == 'float' ? new Float32Array(this.binary) : new Int32Array(this.binary)
        }
        else if(_type == 'double' || _type == 'long long') {
            return _type == 'double' ? new Float64Array(this.binary) : new Int32Array(this.binary)
        }
        else {
            return new Int32Array(this.binary)
        }
    }
    value(_type) {
        if(_type == undefined) {
            return this.toAccessableData(this.type)[0]
        }
        else {
            return this.toAccessableData(_type)[0]
        }
    }
    setValue(_value) {
        if(typeof(_value) == 'string') {
            this.toAccessableData(this.type).set([_value.charCodeAt(0)])
        }
        else if(typeof(_value) == 'number') {
            this.toAccessableData(this.type).set([_value])
        }
        else if(_value === null){}
        else {
            console.log('type Error')
            console.log(typeof(_value))
            console.log(_value)
        }
    }
}

class Stack {
    constructor() {
        this.body = new Array()
        this.top = 99;
    }
    topData() {
        return this.idx(this.top)
    }
    top_idx() {
        return this.top - 100
    }
    idx(_index) {
        return this.body[_index - 100]
    }
    pop() {
        this.top--
        return this.body.pop;
    }
    push(_data) {
        this.body.push(_data);
        return ++this.top
    }
}
class Resister {
    constructor() {
        this.body = new Array(100)
        for(let i = 0; i < 100 ;i++) {
            this.body[i] = new Data('void', 'null', null)
        }
    }
    enroll(_data) {
        for(let i = 0; i < 100; i++) {
            if(this.body[i].name === 'null') {
                console.log(_data)
                this.body[i].type = _data.type
                this.body[i].name = 'enrolled'
                this.body[i].setValue(_data.value())
                return i
            }
        }
        return -1
    }
    cancel (_idxs) {
        let i = 0
        _idxs.forEach(element => {
            i++
            this.body[element].name = 'null'
        })
        return i
    }
}