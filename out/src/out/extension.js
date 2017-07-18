'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const util = require('util');
const vscode = require("vscode");
const child_process_1 = require("child_process");
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
var consl = new Console();
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
var fStack = new _FunctionStack();
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
            var putBack = this.__Stack.pop();
            this.__Stack.push(this._Pull(putBack));
        }
        Peek() {
            var putBack = this.__Stack.pop();
            this.__Stack.push(putBack);
            return putBack;
        }
    }
    Moon.Stack = Stack;
    function GetStack(Sfunc) {
        let retStack = new Stack(Sfunc);
        return retStack;
    }
    Moon.GetStack = GetStack;
    function whenpush(xxt) {
        var _dofunc = fStack.__PushStack.pop();
        fStack.__PushStack.push(_defaultFunc);
        return _dofunc(xxt);
    }
    Moon.whenpush = whenpush;
    function whenpop(xxt) {
        var _dopopfunc = fStack.__PushStack.pop();
        fStack.__PopStack.push(_defaultFunc);
        return _dopopfunc(xxt);
    }
    Moon.whenpop = whenpop;
    function whenpull(xxt) {
        var _dopullfunc = fStack.__PullStack.pop();
        fStack.__PullStack.push(_defaultFunc);
        return _dopullfunc(xxt);
    }
    Moon.whenpull = whenpull;
})(Moon = exports.Moon || (exports.Moon = {}));
// __________________________________________
// ---- CHILD PROCESS NAMESPACE -----
var Process;
(function (Process) {
    const defaults = {
        encoding: 'utf8',
        timeout: 0,
        shell: true,
        maxBuffer: 200 * 2048,
        stdio: 'stdout',
        killSignal: 'SIGTERM',
        cwd: vscode.workspace.rootPath,
        env: null
    };
    function execute(execName, args) {
        var outP = child_process_1.spawnSync(execName, args);
    }
    Process.execute = execute;
})(Process = exports.Process || (exports.Process = {}));
// ---- VISUAL STUDIO INTERACTION -----
function activate(context) {
    consl.verbose = true;
    let Active = Moon.GetStack({ onPush: Moon.whenpush, onPop: Moon.whenpop, onPull: Moon.whenpull });
    consl.say('Moonscript Tools are active');
    var _window_ = vscode.window.activeTextEditor;
    Active.Push(_window_.document.getText());
    Process.execute('ls', ['/home/lynxish']);
}
exports.activate = activate;
// ---- DEACTIVATE EXTENSION FUNCTION -----
function deactivate() {
    console.log('Moonscript exited');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map