'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const shelljs = require('shelljs');
// ---- END OF IMPORTS -----
// --- EXTRAS ---
class Console {
    constructor() {
        this.verbose = false;
    }
    say(msg) {
        if (this.verbose == true) {
            console.log(msg);
        }
    }
}
const consl = new Console();
// ---- FUNCTION STACK -----
class _FunctionStack {
    constructor() {
        this.__PushStack = [];
        this.__PopStack = [];
        this.__PullStack = [];
        this.__PushStack.push(_defaultFunc);
        this.__PullStack.push(_defaultFunc);
        this.__PopStack.push(_defaultFunc);
    }
}
const fStack = new _FunctionStack();
function _defaultFunc(xinp) {
    return xinp;
}
// _________________________________________
// --- MOON NAMESPACE ---
var Moon;
(function (Moon) {
    class _routine_ {
        constructor() {
            this.doExecute = [];
        }
    }
    Moon._routine_ = _routine_;
    class _function_ {
        constructor() {
            this.outP = [];
            this.argArr = [];
        }
        docommand(ins) {
            this.argArr.forEach(arg => {
            });
        }
    }
    Moon._function_ = _function_;
    class Stack {
        constructor(enact) {
            this.__Stack = [];
            this.__FuncStack = [];
            this._Push = enact.onPush;
            this._Pop = enact.onPop;
            this._Pull = enact.onPull;
        }
        Push(what) {
            this.__Stack.push(this._Push(what));
        }
        Pop() {
            return this._Pop(this.__Stack.pop());
        }
        Pull() {
            const putBack = this.__Stack.pop();
            this.__Stack.push(this._Pull(putBack));
        }
        Peek() {
            const putBack = this.__Stack.pop();
            this.__Stack.push(putBack);
            return putBack;
        }
    }
    Moon.Stack = Stack;
    function GetStack(Sfunc) {
        return new Stack(Sfunc);
    }
    Moon.GetStack = GetStack;
    function whenpush(xxt) {
        const _dofunc = fStack.__PushStack.pop();
        fStack.__PushStack.push(_defaultFunc);
        return _dofunc(xxt);
    }
    Moon.whenpush = whenpush;
    function whenpop(xxt) {
        const _dopopfunc = fStack.__PushStack.pop();
        fStack.__PopStack.push(_defaultFunc);
        return _dopopfunc(xxt);
    }
    Moon.whenpop = whenpop;
    function whenpull(xxt) {
        const _dopullfunc = fStack.__PullStack.pop();
        fStack.__PullStack.push(_defaultFunc);
        return _dopullfunc(xxt);
    }
    Moon.whenpull = whenpull;
})(Moon = exports.Moon || (exports.Moon = {}));
// __________________________________________
// ---- CHILD PROCESS NAMESPACE -----
function getExec(command) {
    return shelljs.exec(command, { silent: true }).stdout;
}
// ---- VISUAL STUDIO INTERACTION -----
function activate(context) {
    consl.verbose = true;
    let Active = Moon.GetStack({ onPush: Moon.whenpush, onPop: Moon.whenpop, onPull: Moon.whenpull });
    consl.say('Moonscript Tools are active');
    Active.Push(vscode.window.activeTextEditor.document.getText());
    console.log(getExec('ls ~/'));
}
exports.activate = activate;
// ---- DEACTIVATE EXTENSION FUNCTION -----
function deactivate() {
    console.log('Moonscript exited');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map