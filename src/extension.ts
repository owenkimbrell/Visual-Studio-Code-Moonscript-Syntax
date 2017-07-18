'use strict';

import * as vscode from 'vscode';
import { isNegativeNumberLiteral } from 'tslint/lib';
import { objectify } from 'tslint/lib/utils';
import * as util from 'util';


const shelljs = require('shelljs');
// ---- END OF IMPORTS -----
let diag: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection();
function filterActive(wlineNumber: number, wsymbS: string, wSymb: string): vscode.Range {
    console.log(wlineNumber + wSymb + '\n' + 'Getting text');
    let active: string = vscode.window.activeTextEditor.document.getText();
    console.log('Got text ' + '\n' + active);
    let gRange: vscode.Range;
    let gPos: vscode.Position = vscode.window.activeTextEditor.document.positionAt(active.indexOf(wSymb));
    let ngPos: vscode.Position = gPos.with(wlineNumber,active.indexOf(wSymb.charAt(wSymb.length)));
    gRange = new vscode.Range(gPos.line,gPos.character,ngPos.line,ngPos.character);
    console.log('Finished range finding : is empty = ' + gRange.isEmpty + '\n' + gRange + ' \n gpos ' + gPos + '\n linenumber ' + wlineNumber + '\n');
    return gRange;

}
class OfSymbol {
    public documentName: string;
    public documentUri: vscode.Uri;
    public lineNumber: number;
    public symbolActual: string;
    public symbolLine: string;
    public diagnostic: vscode.Diagnostic[] = [];
    constructor(wlineNumber: number, wsymbS: string, wSymb: string) {
        let active: string = vscode.window.activeTextEditor.document.getText();
        const rangeFindFromLine = filterActive(wlineNumber,wsymbS,wSymb);
        this.lineNumber = wlineNumber;
        this.documentName = vscode.window.activeTextEditor.document.fileName;
        this.documentUri = vscode.window.activeTextEditor.document.uri;
        this.symbolActual = wSymb;
        this.symbolLine = wsymbS;
        this.diagnostic.push(new vscode.Diagnostic(rangeFindFromLine, wsymbS, vscode.DiagnosticSeverity.Error));
    }
}


function bfunc(wuri: vscode.Uri,diagC: vscode.DiagnosticCollection) {

}
function getSymbolInterface(wSymbol: string, wLineNumber: number, wSymbolLine: string): OfSymbol {

    console.log('Getting symbol interface');
    let ofS: OfSymbol = new OfSymbol(wLineNumber, wSymbolLine, wSymbol);
    console.log(typeof ofS + ofS.documentName);
    console.log('Continuing');
    //diag.set(vscode.window.activeTextEditor.document.uri,ofS.diagnostic);
    return ofS;
}
function symbolize(sym: string) {
    let lineNumber: number = null;
    let lIndx: number = sym.indexOf('[') + 1;
    let indcIndx: number = sym.indexOf('>>');
    let symbolP: string = sym.substring(indcIndx + 5).trim();
    lineNumber = parseInt(sym.substring(lIndx, lIndx + 1));
    console.log('symblz : Sym -> ' + sym + '\n' + 'symblz : SymP -> ' + symbolP);


    let ofs = getSymbolInterface(symbolP, lineNumber, sym);
    diag.set(vscode.window.activeTextEditor.document.uri,ofs.diagnostic);
}
// ---- CHILD PROCESS NAMESPACE -----
class NodeShell {
    public fileContentStack: string[] = [];
    public outputContentStack: string[] = [];
    public pushFileContent(fileName: string) {
        this.fileContentStack.push(shelljs.cat(fileName));
    }
    constructor(additonalFiles?: string[]) {
        this.pushFileContent(vscode.window.activeTextEditor.document.fileName);
    }
    public exe(proc: string, lookfor?: string) {
        if (lookfor !== undefined && lookfor !== null) {
            return shelljs.exec(proc, { silent: true, shell: '/bin/bash', encoding: 'utf8' }).grep(lookfor);
        }
        else {
            return shelljs.exec(proc, { silent: true, shell: '/bin/bash', encoding: 'utf8' }).stdout;
        }
    }
}
class ActiveSession {
    public _errors: number = 0;
    public _message: string[] = [];
    private _getPosition(lookfor: string, lineNumber: number): vscode.Range {
        let newPos: vscode.Position = new vscode.Position(vscode.window.activeTextEditor.document.lineAt(lineNumber).lineNumber, vscode.window.activeTextEditor.document.lineAt(lineNumber).text.indexOf(lookfor));
        let newPosE: vscode.Position = new vscode.Position(vscode.window.activeTextEditor.document.lineAt(lineNumber).lineNumber, vscode.window.activeTextEditor.document.lineAt(lineNumber).text.indexOf(lookfor) + lookfor.length);
        return new vscode.Range(newPos, newPosE);
    }
    private provider: vscode.DiagnosticCollection;
    public _symbol: string[] = [];
    public pushHighlighter() {
        console.log('Symbolizing');

        symbolize(this._symbol.pop());
    }
}
let moonsesh: ActiveSession = new ActiveSession();
function readBusted(content: string): void {
    let njs: NodeShell = new NodeShell();
    const outAR: string[] = content.split('/');
    let contentStack: string[] = [];
    outAR.forEach(elem => {
        contentStack.push(elem.replace(' error' || ' errors', '-E').replace(' ', ''));
    });
    contentStack.forEach(element => {
        if (element.includes('-E')) {
            const getEIndx: number = element.indexOf('-E');
            if (getEIndx !== undefined && getEIndx !== null) {
                moonsesh._errors = parseInt(element.substring(0, getEIndx));
                console.log(element.substring(0,getEIndx) + ' | Errors in ' + vscode.window.activeTextEditor.document.fileName);
            }
        }
    });
}
// ---- VISUAL STUDIO INTERACTION -----
function resolveErrorsBusted(): void {
    moonsesh.pushHighlighter();
}
export function activate(context: vscode.ExtensionContext) {
    console.log('Moonscript Tools are active');
    vscode.workspace.onDidOpenTextDocument(event => {
        diag.clear();
        if (vscode.window.activeTextEditor.document.languageId === 'moonscript') {
            const Njs: NodeShell = new NodeShell();
            let checkErr = readBusted(Njs.exe('busted ' + vscode.window.activeTextEditor.document.fileName, 'success'));
            if (moonsesh._errors > 0) {
                moonsesh._message.push(Njs.exe('busted ' + vscode.window.activeTextEditor.document.fileName, 'Error'));
                moonsesh._symbol.push(Njs.exe('busted ' + vscode.window.activeTextEditor.document.fileName, '>>').trim());
                resolveErrorsBusted();
            }
            else {

                if(vscode.window.activeTextEditor.document.fileName.endsWith('.lua')){console.log('Lua file');}
                else{
                console.log('Compiling ' + vscode.window.activeTextEditor.document.fileName)
                Njs.exe('moonc ' + vscode.window.activeTextEditor.document.fileName);
                }
            }

        }
    });
    let Njs: NodeShell = new NodeShell();
    /*bustedOut.forEach(element => {
        //console.log(element);
    });*/
    vscode.workspace.onDidSaveTextDocument(event => {
        if(vscode.window.activeTextEditor.document.languageId === 'moonscript') {
        diag.clear();
        console.log(vscode.window.activeTextEditor.document.fileName);
        readBusted(Njs.exe('busted ' + vscode.window.activeTextEditor.document.fileName, 'success'));
        if (moonsesh._errors > 0) {
            moonsesh._message.push(Njs.exe('busted ' + vscode.window.activeTextEditor.document.fileName, 'Error'));
            moonsesh._symbol.push(Njs.exe('busted ' + vscode.window.activeTextEditor.document.fileName, '>>'));
            resolveErrorsBusted();
        }
        else {
            
            if(vscode.window.activeTextEditor.document.fileName.endsWith('.lua')) {
                console.log('Lua file');
            }
            else{
            console.log('Compiling ' + vscode.window.activeTextEditor.document.fileName);
            Njs.exe('moonc ' + vscode.window.activeTextEditor.document.fileName);
            }
        }
    }
    });

    //console.log(moonsesh._errors);
}
// ---- DEACTIVATE EXTENSION FUNCTION -----
export function deactivate() {
    console.log('Moonscript exited');
    console.log(moonsesh._errors);
    console.log(moonsesh._message.pop());
    console.log(moonsesh._symbol.pop());
}
