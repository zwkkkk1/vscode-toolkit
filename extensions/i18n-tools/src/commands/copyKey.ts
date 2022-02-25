import * as vscode from 'vscode';
import { TextItem, MessageItem } from 'views/items';

async function copyKey(item: TextItem | MessageItem) {
  const text = item instanceof TextItem ? item.description : item.label;

  vscode.env.clipboard.writeText(text);
  vscode.window.showInformationMessage('文本复制成功');
}

export default function(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(vscode.commands.registerCommand('i18n-plugin.copyKey', copyKey));
}