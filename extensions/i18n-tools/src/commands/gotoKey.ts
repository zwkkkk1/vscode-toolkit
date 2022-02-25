import * as vscode from 'vscode';
import JsonParser from 'parsers/json';
import { TextItem } from 'views/items';

async function gotoKey(item: TextItem) {
  const filePath = item.filePath;
  const document = await vscode.workspace.openTextDocument(filePath);
  const editor = await vscode.window.showTextDocument(document);

  const text = editor.document.getText();
  const navigateRange = JsonParser.parseAST(text)[item.message.key];
  editor.selection = new vscode.Selection(document.positionAt(navigateRange.keyStart), document.positionAt(navigateRange.keyEnd));
  
  editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenter);
}

export default function (ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(vscode.commands.registerCommand('i18n-plugin.gotoKey', gotoKey))
}