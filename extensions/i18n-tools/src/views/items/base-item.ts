import * as vscode from 'vscode';
import * as path from 'path';

class BaseItem extends vscode.TreeItem {
  constructor(ctx: vscode.ExtensionContext, label: string, collapsibleState?: vscode.TreeItemCollapsibleState, private children?: BaseItem[]) {
    super(label, collapsibleState);

    this.ctx = ctx;

    this.label = label;
  }

  ctx: vscode.ExtensionContext;

  label: string;
  
  async getChildren(element?: BaseItem | undefined): Promise<BaseItem[]> {
    return this.children || [];
  }

  getIcon(type: string) {
    return this.ctx.asAbsolutePath(path.join(`resources/${type}`));
  }
}

export default BaseItem;