import JsonParser from 'parsers/json';
import { MessageItem, TextItem } from 'views/items';
import * as vscode from 'vscode';

async function editValue(filePath: string, key: string) {
  const result = JsonParser.read(filePath);
  let placeHolder = '';
  result[key] && (placeHolder += `当前文案：${result[key]}，`);
  placeHolder += '请输入新文案';

  const newValue = await vscode.window.showInputBox({ placeHolder });

  if (result) {
    result[key] = newValue;
    JsonParser.save(filePath, result);
  }
}

async function editKey(item: TextItem | MessageItem) {
  if (item instanceof MessageItem) {
    // messageItem 选择修改key值 or 具体哪个 locale 的文案
    const itemKey = item.message.key;
    const result = await vscode.window.showQuickPick(['key', ...Object.keys(item.message.records)], {
      placeHolder: '请选择要修改的值'
    });

    if(!result) { return; }

    if (result === 'key') {
      const newKey = await vscode.window.showInputBox({ placeHolder: '请输入新 key 值' });
      if (newKey) {
        // 遍历 message 所有 locale 文件，修改此 key 值
        item.message.getFilePaths().forEach((path) => {
          const result = JsonParser.read(path);
          result[newKey] = result[itemKey];
          delete result[itemKey];
          JsonParser.save(path, result);
        });
      }
    } else {
      editValue(item.message.getFilePath(result), itemKey);
    }
  } else if (item instanceof TextItem) {
    // textItem 直接开始修改对应文案
    editValue(item.filePath, item.message.key);
  }
}

export default function(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(vscode.commands.registerCommand('i18n-plugin.editKey', editKey));
}