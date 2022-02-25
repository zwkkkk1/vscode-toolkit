import { ExtensionContext, window, EventEmitter, Uri } from 'vscode';

export default class CurrentFile {
  static _onChange = new EventEmitter<void>();
  static watch(ctx: ExtensionContext) {
    ctx.subscriptions.push(window.onDidChangeActiveTextEditor(e => CurrentFile.update(e?.document.uri)));
  }

  static onChange = CurrentFile._onChange.event;

  static update(uri?: Uri) {
    CurrentFile._onChange.fire();
  }
}