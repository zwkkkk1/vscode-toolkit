import * as path from 'path';
import * as vscode from 'vscode';
import { Core, TFileDataType } from './core';
import {BaseProvider} from './views/BaseProvider';
import { DEPENDENCY_TYPE, TDependency } from './tdependency';
import { TNotUsed } from './unused-exports/notUsed';

export default class ProjectOverviewProvider extends BaseProvider {
  constructor(cores: Core[]) {
    super(cores, undefined, TFileDataType.UNUSED_EXPORTS, mapFile2Dependency, getNoUnusedExports);
  }
}

function mapFile2Dependency(
  parent: TDependency,
  node: TNotUsed,
  collapsibleState: vscode.TreeItemCollapsibleState,
  isNotHidden: (node: TDependency) => boolean
): TDependency {
  const { filePath, isCompletelyUnused, notUsedExports } = node;

  const pathToPrj = parent.core?.getOverviewContext().pathToPrj;
  const absFilePath = pathToPrj ? path.resolve(pathToPrj, filePath) : filePath;

  const row = new TDependency(
    parent,
    `${parent.id}::${filePath}`,
    DEPENDENCY_TYPE.FILE,
    filePath,
    isCompletelyUnused,
    notUsedExports,
    undefined,
    collapsibleState,
    {
      command: 'unusedExports.openFile',
      title: 'Open',
      arguments: [absFilePath],
    }
  );
  row.absFilePath = absFilePath;
  row.children = unusedExportsInFile(row, isNotHidden);
  return row;
}

function unusedExportsInFile(parent: TDependency, isNotHidden: (node: TDependency) => boolean): TDependency[] {
  const mapFn = mapUnusedExport2Dependency(parent);
  return parent.notUsedExports?.map(mapFn).filter(isNotHidden) ?? [];
}

function mapUnusedExport2Dependency(parent: TDependency) {
  return (notUsedExport: string): TDependency => {
    return new TDependency(
      parent,
      `${parent.id}::${notUsedExport}`,
      DEPENDENCY_TYPE.UNUSED_EXPORT,
      notUsedExport,
      false,
      undefined,
      undefined,
      vscode.TreeItemCollapsibleState.None,
      {
        command: 'unusedExports.findInFile',
        title: 'Find the unused export in file',
        arguments: [parent.absFilePath, notUsedExport],
      }
    );
  };
}

function getNoUnusedExports(core: Core) {
  return new TDependency(
    undefined,
    core.getOverviewContext().workspaceName + '::NoUnusedExports',
    DEPENDENCY_TYPE.EMPTY,
    'No unused exports'
  );
}
