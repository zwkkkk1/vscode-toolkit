import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import { MessageItem, TextItem } from 'views/items';

class EditorPanel {
  private static _ctx: vscode.ExtensionContext | undefined;
  private static _disposables: vscode.Disposable[] = [];
  static currentPanel: vscode.WebviewPanel | undefined | null;
  private static _storeMessage: any;

  static createOnShow(ctx: vscode.ExtensionContext) {
    this._ctx = ctx;
    const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    if (EditorPanel.currentPanel) {
      EditorPanel.currentPanel.reveal(columnToShowIn);
    } else {
      const panel = vscode.window.createWebviewPanel(
        'editorPanel',
        'editor panel',
        columnToShowIn || vscode.ViewColumn.One,
        { enableScripts: true }
      );

      panel.webview.html = fse.readFileSync(this._ctx.asAbsolutePath('./dist/editor-panel/index.html'), { encoding: 'utf-8' });

      EditorPanel.currentPanel = panel;
    }

    EditorPanel.currentPanel.webview.onDidReceiveMessage((msg) => {
      if (msg.type === 'ready') {
        this.postMessage(this._storeMessage);
      }
    }, null, this._disposables);

    EditorPanel.currentPanel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  static dispose() {
    EditorPanel.currentPanel?.dispose();

    EditorPanel.currentPanel = null;

    this._disposables.forEach((x) => { x.dispose(); });
  }

  static postMessage(data: any) {
    this._storeMessage = data;

    EditorPanel.currentPanel?.webview.postMessage({ data, type: 'message' });
  }
}

export function editorPanelActivate(ctx: vscode.ExtensionContext) {
	ctx.subscriptions.push(vscode.commands.registerCommand('i18n-plugin.openEditorPanel', (item) => {
    try{
      EditorPanel.createOnShow(ctx);
      if (item instanceof MessageItem || item instanceof TextItem) {
        const { key, records, remoteRecords, validator } = item.message;
        EditorPanel.postMessage({ key, records, remoteRecords, warnings: validator.warnings });
      }
    } catch(err) {
      console.log('open editor >>> ', err);
    }
	}));

}

export default EditorPanel;