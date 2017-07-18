'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const shelljs = require('shelljs');
// ---- END OF IMPORTS -----
let diag = vscode.languages.createDiagnosticCollection();
function filterActive(wlineNumber, wsymbS, wSymb) {
    console.log(wlineNumber + wSymb + '\n' + 'Getting text');
    let active = vscode.window.activeTextEditor.document.getText();
    console.log('Got text ' + '\n' + active);
    let gRange;
    let gPos = vscode.window.activeTextEditor.document.positionAt(active.indexOf(wSymb));
    let ngPos = gPos.with(wlineNumber, active.indexOf(wSymb.charAt(wSymb.length)));
    gRange = new vscode.Range(gPos.line, gPos.character, ngPos.line, ngPos.character);
    console.log('Finished range finding : is empty = ' + gRange.isEmpty + '\n' + gRange + ' \n gpos ' + gPos + '\n linenumber ' + wlineNumber + '\n');
    return gRange;
}
class OfSymbol {
    constructor(wlineNumber, wsymbS, wSymb) {
        this.diagnostic = [];
        let active = vscode.window.activeTextEditor.document.getText();
        const rangeFindFromLine = filterActive(wlineNumber, wsymbS, wSymb);
        this.lineNumber = wlineNumber;
        this.documentName = vscode.window.activeTextEditor.document.fileName;
        this.documentUri = vscode.window.activeTextEditor.document.uri;
        this.symbolActual = wSymb;
        this.symbolLine = wsymbS;
        this.diagnostic.push(new vscode.Diagnostic(rangeFindFromLine, wsymbS, vscode.DiagnosticSeverity.Error));
    }
}
function bfunc(wuri, diagC) {
}
function getSymbolInterface(wSymbol, wLineNumber, wSymbolLine) {
    console.log('Getting symbol interface');
    let ofS = new OfSymbol(wLineNumber, wSymbolLine, wSymbol);
    console.log(typeof ofS + ofS.documentName);
    console.log('Continuing');
    //diag.set(vscode.window.activeTextEditor.document.uri,ofS.diagnostic);
    return ofS;
}
function symbolize(sym) {
    let lineNumber = null;
    let lIndx = sym.indexOf('[') + 1;
    let indcIndx = sym.indexOf('>>');
    let symbolP = sym.substring(indcIndx + 5).trim();
    lineNumber = parseInt(sym.substring(lIndx, lIndx + 1));
    console.log('symblz : Sym -> ' + sym + '\n' + 'symblz : SymP -> ' + symbolP);
    let ofs = getSymbolInterface(symbolP, lineNumber, sym);
    diag.set(vscode.window.activeTextEditor.document.uri, ofs.diagnostic);
}
// ---- CHILD PROCESS NAMESPACE -----
class NodeShell {
    constructor(additonalFiles) {
        this.fileContentStack = [];
        this.outputContentStack = [];
        this.pushFileContent(vscode.window.activeTextEditor.document.fileName);
    }
    pushFileContent(fileName) {
        this.fileContentStack.push(shelljs.cat(fileName));
    }
    exe(proc, lookfor) {
        if (lookfor !== undefined && lookfor !== null) {
            return shelljs.exec(proc, { silent: true, shell: '/bin/bash', encoding: 'utf8' }).grep(lookfor);
        }
        else {
            return shelljs.exec(proc, { silent: true, shell: '/bin/bash', encoding: 'utf8' }).stdout;
        }
    }
}
class ActiveSession {
    constructor() {
        this._errors = 0;
        this._message = [];
        this._symbol = [];
    }
    _getPosition(lookfor, lineNumber) {
        let newPos = new vscode.Position(vscode.window.activeTextEditor.document.lineAt(lineNumber).lineNumber, vscode.window.activeTextEditor.document.lineAt(lineNumber).text.indexOf(lookfor));
        let newPosE = new vscode.Position(vscode.window.activeTextEditor.document.lineAt(lineNumber).lineNumber, vscode.window.activeTextEditor.document.lineAt(lineNumber).text.indexOf(lookfor) + lookfor.length);
        return new vscode.Range(newPos, newPosE);
    }
    pushHighlighter() {
        console.log('Symbolizing');
        symbolize(this._symbol.pop());
    }
}
let moonsesh = new ActiveSession();
function readBusted(content) {
    let njs = new NodeShell();
    const outAR = content.split('/');
    let contentStack = [];
    outAR.forEach(elem => {
        contentStack.push(elem.replace(' error' || ' errors', '-E').replace(' ', ''));
    });
    contentStack.forEach(element => {
        if (element.includes('-E')) {
            const getEIndx = element.indexOf('-E');
            if (getEIndx !== undefined && getEIndx !== null) {
                moonsesh._errors = parseInt(element.substring(0, getEIndx));
                console.log(element.substring(0, getEIndx) + ' | Errors in ' + vscode.window.activeTextEditor.document.fileName);
            }
        }
    });
}
// ---- VISUAL STUDIO INTERACTION -----
function resolveErrorsBusted() {
    moonsesh.pushHighlighter();
}
function activate(context) {
    console.log('Moonscript Tools are active');
    vscode.workspace.onDidOpenTextDocument(event => {
        diag.clear();
        if (vscode.window.activeTextEditor.document.languageId === 'moonscript') {
            const Njs = new NodeShell();
            let checkErr = readBusted(Njs.exe('busted ' + vscode.window.activeTextEditor.document.fileName, 'success'));
            if (moonsesh._errors > 0) {
                moonsesh._message.push(Njs.exe('busted ' + vscode.window.activeTextEditor.document.fileName, 'Error'));
                moonsesh._symbol.push(Njs.exe('busted ' + vscode.window.activeTextEditor.document.fileName, '>>').trim());
                resolveErrorsBusted();
            }
            else {
                if (vscode.window.activeTextEditor.document.fileName.endsWith('.lua')) {
                    console.log('Lua file');
                }
                else {
                    console.log('Compiling ' + vscode.window.activeTextEditor.document.fileName);
                    Njs.exe('moonc ' + vscode.window.activeTextEditor.document.fileName);
                }
            }
        }
    });
    let Njs = new NodeShell();
    /*bustedOut.forEach(element => {
        //console.log(element);
    });*/
    vscode.workspace.onDidSaveTextDocument(event => {
        if (vscode.window.activeTextEditor.document.languageId === 'moonscript') {
            diag.clear();
            console.log(vscode.window.activeTextEditor.document.fileName);
            readBusted(Njs.exe('busted ' + vscode.window.activeTextEditor.document.fileName, 'success'));
            if (moonsesh._errors > 0) {
                moonsesh._message.push(Njs.exe('busted ' + vscode.window.activeTextEditor.document.fileName, 'Error'));
                moonsesh._symbol.push(Njs.exe('busted ' + vscode.window.activeTextEditor.document.fileName, '>>'));
                resolveErrorsBusted();
            }
            else {
                if (vscode.window.activeTextEditor.document.fileName.endsWith('.lua')) {
                    console.log('Lua file');
                }
                else {
                    console.log('Compiling ' + vscode.window.activeTextEditor.document.fileName);
                    Njs.exe('moonc ' + vscode.window.activeTextEditor.document.fileName);
                }
            }
        }
    });
    //console.log(moonsesh._errors);
}
exports.activate = activate;
// ---- DEACTIVATE EXTENSION FUNCTION -----
function deactivate() {
    console.log('Moonscript exited');
    console.log(moonsesh._errors);
    console.log(moonsesh._message.pop());
    console.log(moonsesh._symbol.pop());
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map