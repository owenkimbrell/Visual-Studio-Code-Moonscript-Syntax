'use strict';
import * as vscode from 'vscode';
import * as tmp from 'tmp';
import * as typescript from 'typescript';
import * as shell from 'shelljs';
import * as fs from 'fs-2';
class StreamStack {
    private _tmpArray: string[] = [];
    public _peek() {
        var putBack: string = this._tmpArray.pop();
        this._tmpArray.push(putBack);
        return putBack;
    }
    public _pop() {
        return this._tmpArray.pop();
    }
    constructor(wpath: string) {
        tmp.file(function _tempFileCreated(err,path,fd,cleanupCallback) {
            if(err) {throw err;}
            this._tmpArray.push(path);
        });
    }
}



class _Files {
    private _name: string;
    private _path: string;
    private _scriptOnStart: string[];
    private _obj: Object = new Object([this._name,this._path,this._scriptOnStart]);
    public pushFileObject;
    constructor(wname?: string, wpath?: string,wscript?: string[]) {
        if(wname === undefined) {
           this._name = vscode.window.activeTextEditor.document.fileName;
        }
        else {
            this._name = wname;
        }
        if(wpath === undefined) {
            if(vscode.workspace.rootPath){
                this._path = vscode.workspace.rootPath;
            }
            else
            {
                console.log("Could not open, no folder is availible.")
            }
        }
        else {
            this._path = wpath;
        }
        if(wscript === undefined) {
            this._scriptOnStart = ["moonc -l " + this._name,"moonc " + this._name];
        }
        else
        {
            this._scriptOnStart = wscript;
        }
    }
}








export function activate(context: vscode.ExtensionContext) {

}