import * as fs from 'fs';
import * as vscode from 'vscode';
import { Core, TFileDataType } from '../core';
import { DEPENDENCY_TYPE, TDependency } from '../tdependency';
import { log } from '../unused-exports/log';
import { TNotUsed } from '../unused-exports/notUsed';
import { isResultExpanded } from '../unused-exports/settings';

export class BaseProvider implements vscode.TreeDataProvider<TDependency> {
  /* We need to have it also undefined as an empty array means that the user removed all entries */
  private cacheFolders: TDependency[] | undefined;
  private cacheHidden: string[];

  protected isNotHidden = (node: TDependency): boolean => {
    return this.cacheHidden.includes(node.id) === false;
  };

  private _onDidChangeTreeData: vscode.EventEmitter<TDependency | undefined> = new vscode.EventEmitter<
    TDependency | undefined
  >();
  public readonly onDidChangeTreeData: vscode.Event<TDependency | undefined> = this._onDidChangeTreeData.event;

  constructor(
    private cores: Core[],
    private getNodeIfDisabled: (() => TDependency | undefined) | undefined,
    private fileDataType: TFileDataType,
    private mapFile2Dependency: (
      parent: TDependency,
      node: TNotUsed,
      collapsibleState: vscode.TreeItemCollapsibleState,
      isNotHidden: (node: TDependency) => boolean
    ) => TDependency,
    private getNoResultsNode: (core: Core) => TDependency
  ) {
    this.cacheHidden = [];
    cores.forEach((core) => core.registerListener(this.refresh));
    this.refresh();
  }

  public refresh = () => {
    const node = this.getNodeIfDisabled?.();
    if (node) {
      this.cacheFolders = [node];
      this._onDidChangeTreeData.fire(undefined);
      return;
    }

    const collapsibleState = isResultExpanded()
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.Collapsed;

    /* We add the folders */
    this.cacheFolders = this.cores.map((core) => {
      const node = new TDependency(
        undefined,
        core.getOverviewContext().workspaceName,
        DEPENDENCY_TYPE.FOLDER,
        core.getOverviewContext().workspaceName,
        false,
        undefined,
        undefined,
        collapsibleState
      );
      node.core = core;
      return node;
    });

    /* We add the files */
    this.cacheFolders.forEach((folder) => {
      folder.children = this.getFiles(folder);
    });

    this.cacheHidden = [];
    this._onDidChangeTreeData.fire(undefined);
  };

  private getFiles(parent: TDependency): TDependency[] | undefined {
    const core = parent.core;
    if (core === undefined) {
      return;
    }

    const files = core.getFilesData(this.fileDataType);

    if (files.length === 0) {
      return [this.getNoResultsNode(core)];
    }

    const collapsibleState = isResultExpanded()
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.Collapsed;
    const rows = files
      .map((file) => this.mapFile2Dependency(parent, file, collapsibleState, this.isNotHidden))
      .filter(this.isNotHidden);
    return rows;
  }

  public hideFileOrExport(node: TDependency): void {
    /* Strange enough, node can also be undefined */
    if (node === undefined || this.cacheFolders === undefined) {
      return;
    }

    if (node.parent === undefined) {
      this.cacheFolders = this.cacheFolders.filter((folder) => folder.id !== node.id);
      this._onDidChangeTreeData.fire(undefined);
      return;
    }

    node.parent.children = node.parent.children?.filter((file) => file.id !== node.id);
    this._onDidChangeTreeData.fire(node.parent);
  }

  public deleteFile(node: TDependency): void {
    const filePath = node.absFilePath;
    if (filePath === undefined) {
      return;
    }

    fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => {
      if (err) {
        vscode.window.showInformationMessage(`Cannot delete ${filePath}`);
        return;
      }

      this.hideFileOrExport(node);
    });
  }

  public expandAll() {
    this.setExpandForAll(true);
  }

  public collapseAll() {
    this.setExpandForAll(false);
  }

  private setExpandForAll(isExpanded: boolean) {
    if (this.cacheFolders === undefined) {
      return;
    }

    this.cacheFolders = this.cacheFolders.map((folder) => {
      folder.children = folder.children?.map((file) => file.clone(isExpanded));
      return folder.clone(isExpanded);
    });

    /* As a folder has nothing as parent we need to provide null to fire() */
    this._onDidChangeTreeData.fire(undefined);
  }

  /* TreeDataProvider specific functions */

  public getParent(element: TDependency) {
    return element.parent;
  }

  public getTreeItem(element: TDependency): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: TDependency): Thenable<TDependency[]> {
    if (element?.children) {
      return Promise.resolve(element?.children);
    }

    /* If we are in a workspace automaticaly created by VSCode for a folder or a workspace with only one folder we skip one level  */
    if (this.cacheFolders?.length === 1 && this.cacheFolders?.[0].children) {
      return Promise.resolve(this.cacheFolders?.[0].children || []);
    }

    return Promise.resolve(this.cacheFolders || []);
  }

}
