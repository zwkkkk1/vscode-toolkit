import { ExtensionContext, commands, workspace, window, Disposable } from 'vscode';
import removeCompAndRef from './commands/removeCompAndRef';
import { ViewFileDecorationProvider } from './views/ViewFileDecorationProvider';
import { Core } from './core';

import { OverviewProvider } from './overview';
import UnusedExportsProvider from './unusedExports';
import { TDependency } from './tdependency';
import { showOutputWindow } from './unused-exports/log';

import { startAnalyze } from './utils/analyzer/index';

function refreshAllCores(cores: Core[]) {
  cores.forEach((core) => core.refresh());
}

export function activate(context: ExtensionContext) {
	console.log('Congratulations, your extension "developer-tools" is now active!');

  const rootPath = workspace.rootPath || '';

  // const options = {
  //   dictionaryPath: rootPath,
  //   alias: {},
  //   tsconfigPath: `${rootPath}/tsconfig.json`,
  // };

  // startAnalyze(options);

  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders?.length > 0) {
    const cores = workspaceFolders.map((wsf) => new Core(wsf.name, wsf.uri.fsPath));

    window.registerTreeDataProvider('project-overview.overview', new OverviewProvider(cores));
    const unusedExportsProvider = new UnusedExportsProvider(cores);
    window.registerTreeDataProvider('project-overview.unusedExport', unusedExportsProvider);


  let disposable: Disposable;
  context.subscriptions.push(commands.registerCommand('unusedExports.refresh', () => refreshAllCores(cores)));

  context.subscriptions.push(commands.registerCommand('unusedExports.showOutput', () => showOutputWindow()));

  context.subscriptions.push(commands.registerCommand('unusedExports.expandAllUnusedExports', () => {
    unusedExportsProvider.expandAll();
  }));

  context.subscriptions.push(commands.registerCommand('unusedExports.collapseAllUnusedExports', () => {
    unusedExportsProvider.collapseAll();
  }));

  // context.subscriptions.push(commands.registerCommand('unusedExports.expandAllCircularImports', () => {
  //   circularImportsProvider.expandAll();
  // }));

  // context.subscriptions.push(commands.registerCommand('unusedExports.collapseAllCircularImports', () => {
  //   circularImportsProvider.collapseAll();
  // }));

  // context.subscriptions.push(commands.registerCommand('unusedExports.enableCircularImports', () => {
  //   workspace
  //     .getConfiguration()
  //     .update('findUnusedExports.detectCircularImports', true)
  //     .then(() => refreshAllCores(cores));
  // }));

  // context.subscriptions.push(commands.registerCommand('unusedExports.disableCircularImports', () => {
  //   workspace
  //     .getConfiguration()
  //     .update('findUnusedExports.detectCircularImports', false)
  //     .then(() => refreshAllCores(cores));
  // }));

  // context.subscriptions.push(commands.registerCommand('unusedExports.hideFile', (node: TDependency) =>
  //   circularImportsProvider.hideFileOrExport(node)
  // ));

  context.subscriptions.push(commands.registerCommand('unusedExports.openFile', (filePath: string) => Core.open(filePath)));

  context.subscriptions.push(commands.registerCommand('unusedExports.hideFileOrExport', (node: TDependency) =>
    unusedExportsProvider.hideFileOrExport(node)
  ));


  context.subscriptions.push(commands.registerCommand('unusedExports.deleteFile', (node: TDependency) =>
    unusedExportsProvider.deleteFile(node)
  ));

  context.subscriptions.push(commands.registerCommand(
    'unusedExports.findInFile',
    (filePath: string, unusedExportOrCircularImport: string) => Core.findInFile(filePath, unusedExportOrCircularImport)
  ));
  }

  context.subscriptions.push(new ViewFileDecorationProvider());

  commands.registerCommand('developer-tool.re-develop-file', removeCompAndRef);
}

// this method is called when your extension is deactivated
export function deactivate() {}
