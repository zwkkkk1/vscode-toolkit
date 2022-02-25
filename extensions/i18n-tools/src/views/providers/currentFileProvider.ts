import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, EventEmitter, Event, ExtensionContext } from 'vscode';
import { Core } from 'core';
import CurrentFile from 'core/currentFile';
import { ProjectItem, BaseItem } from 'views/items';
import _throttle from 'lodash/throttle';

class CurrentFileProvider implements TreeDataProvider<BaseItem> {
  private _onDidChangeTreeData: EventEmitter<BaseItem | undefined | null | void> = new EventEmitter<BaseItem | undefined | null | void>();
  readonly onDidChangeTreeData: Event<BaseItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private ctx: ExtensionContext) {
    const throttleRefresh = _throttle(() => this.refresh(), 800);

    CurrentFile.onChange(() => { console.log('handle change >>>'); });

    Core.onDidChangeLocal(throttleRefresh);
  }

  refresh (offset?: any): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: BaseItem): TreeItem {
    return element;
  }

  async getChildren(element: BaseItem): Promise<BaseItem[]> {
    if (element) {
      return element.getChildren();
    }

    return Object.entries(Core.i18nProjects).map(([pid, project]) => {
      return new ProjectItem(this.ctx, project, TreeItemCollapsibleState.Collapsed);
    });
  }
}

export default CurrentFileProvider;