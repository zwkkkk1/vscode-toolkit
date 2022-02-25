import * as vscode from 'vscode';
import BaseItem from './base-item';

const statusTypeMap = {
  success: '已翻译',
  warning: '警告',
  failed: '错误',
};

class StatusItem extends BaseItem {
  constructor(ctx: vscode.ExtensionContext, private type: keyof typeof statusTypeMap, children: BaseItem[], label?: string) {
    super(ctx, `${label || statusTypeMap[type]} (${children.length})`, vscode.TreeItemCollapsibleState.Collapsed, children);
  }

  iconPath = this.getIcon(`${this.type}.svg`);
}

export default StatusItem;