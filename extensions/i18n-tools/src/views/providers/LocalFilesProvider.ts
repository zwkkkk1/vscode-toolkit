import * as vscode from 'vscode';
import { Core } from 'core';
import { ProjectItem, BaseItem } from 'views/items';
import _throttle from 'lodash/throttle';

class LocalFilesProvider implements vscode.TreeDataProvider<BaseItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<BaseItem | undefined | null | void> = new vscode.EventEmitter<BaseItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<BaseItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private ctx: vscode.ExtensionContext) {
    const throttleRefresh = _throttle(() => this.refresh(), 800);

    Core.onDidChangeLocal(throttleRefresh);
  }

  refresh (offset?: ProjectItem): void {
    if (offset) {
      const { project } = offset;
      Promise.all([
        project.getProjectInfoByPid(),
        project.getMessagesFromRemote()
      ]).then(() => {
        this._onDidChangeTreeData.fire();
      });
    } else {
      this._onDidChangeTreeData.fire();
    }
  }

  getTreeItem(element: BaseItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element: BaseItem): Promise<BaseItem[]> {
    if (element) {
      return element.getChildren();
    }

    return Object.entries(Core.i18nProjects).map(([pid, project]) => {
      return new ProjectItem(this.ctx, project, vscode.TreeItemCollapsibleState.Collapsed);
    });
  }
}

export default LocalFilesProvider;