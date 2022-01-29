String.prototype.insert = function(_index, _string) {
    if (_index > 0)
    {
        return this.substring(0, _index) + _string + this.substring(_index, this.length);
    }
    return _string + this;
};

String.prototype.remove = function(_begin, _end) {
    return this.substring(0, _begin) + this.substring(_end, this.length);
};

String.prototype.cutTo = function(_beginning, _args, _reverse) {
    if(_reverse == undefined) {
        _reverse = false
    }
    _beginning = this.jumpArgs(_beginning + (_reverse ? -1 : +1), [' '], _reverse)
    let idx = _beginning
    while(idx >= 0 && idx < this.length) {
        let fal = false
        _args.forEach(element => { if(this[idx] == element) fal = true })
        if(fal) break
        idx += _reverse ? -1 : +1
    }
    return _reverse ? this.substring(idx + 1, _beginning + 1) : this.substring(_beginning, idx)
}
String.prototype.jumpArgs = function(_beginning, _args, _reverse) {
    if(_reverse == undefined) {
        _reverse = false
    }
    while(_beginning >= 0 && _beginning < this.length && valueExist(_args.map(element => { return (this[_beginning] == element) }), true)) {
        _beginning += _reverse ? -1 : +1
    }
    return _beginning
}
String.prototype.jumpToArgs = function(_beginning, _args, _reverse) {
    if(_reverse == undefined) {
        _reverse = false
    }
    while(_beginning >= 0 && _beginning < this.length && !valueExist(_args.map(element => { return (this[_beginning] == element) }), true)) {
        _beginning += _reverse ? -1 : +1
    }
    return _beginning
    // += _reverse ? +1 : -1
}

String.prototype.isNumber = function() {
    return this.charCodeAt(0) >= 48 && this.charCodeAt(0) <= 57
}

String.prototype.isPtr = function (_arg) {
    return _arg[_arg.length - 1] == 'r'
}

String.prototype.influnceSize = function(_arg) {
    let ret = new Array()
    ret[0] = this.jumpToArgs(this.jumpArgs(_arg - 1, [' '], true), operator, true)
    ret[1] = this.jumpToArgs(this.jumpArgs(_arg + 1, [' '], false), operator, false) + 1
    return ret
}
const KeyWord = new Array(
    'if', 'else if', 'else',
    'for', 'while',
    'unsigned', 'void',
    'char',
    'short', 'int', 'long', 'long long',
    'float', 'double',
    'goto', 'continue', 'return'
)
String.prototype.withKeyWord = function(_index) {
    if(_index == undefined) _index = 0
    let string = this.substring(_index, _index + 10)
    let ret = ''
    KeyWord.forEach(element => {
        if(string.indexOf(element) == 0) ret = element
    })
    if(ret == 'unsigned') {
        ret = 'unsigned' + ' ' + this.withKeyWord(this.jumpArgs('unsigned'.length, [' ']))
    }
    return ret
}

String.prototype.jumpEndofBracket = function(_index) {
    if(_index == undefined) _index = 0
    let beginBracket = this[_index]
    let endBracket
    if(beginBracket == '{') { endBracket = '}' }
    else if(beginBracket == '[') { endBracket = ']' }
    else if(beginBracket == '(') { endBracket = ')'}
    else { return -1 }
    let counter = 1
    while(1) {
        if(this[++_index] == beginBracket) { ++counter }
        else if(this[_index] == endBracket) { if(--counter == 0) { break; }}
    }
    return _index

}