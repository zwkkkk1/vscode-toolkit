import { EventEmitter, FileSystemWatcher, ExtensionContext, workspace, window, RelativePattern } from 'vscode';
import * as path from 'path';
// import { initRequestConfig } from 'services';
import Config from 'core/config';
import I18nProject from 'core/i18n-project';
import _uniq from 'lodash/uniq';
import Log from 'utils/log';
import { autoSetLocales } from 'core/utils';

export class Core {
  static onDidChangeLocalEmitter = new EventEmitter();
  static readonly onDidChangeLocal = Core.onDidChangeLocalEmitter.event;

  static rootPath: string;
  static get localePaths() {
    return Config.getConfig('localePaths') || autoSetLocales();
  }

  static set localePaths(newLocalePaths) {
    Config.setConfig('localePaths', newLocalePaths);
  }

  static fileWatcher: FileSystemWatcher;

  static async init(ctx: ExtensionContext) {
    Core.updateRootPath();
    // TODO: 初始化 request 配置项
    // initRequestConfig();

    ctx.subscriptions.push(workspace.onDidChangeWorkspaceFolders(this.updateRootPath));

    ctx.subscriptions.push(window.onDidChangeActiveTextEditor(this.updateRootPath));
    ctx.subscriptions.push(workspace.onDidChangeConfiguration(e => console.log('onDidChangeConfiguration >>> ', e)));
  }

  static onFileChange(event: any) {
    if (Core.projectFiles.includes(event.path)) {
      this.updateI18nProjects();

      Core.onDidChangeLocalEmitter.fire({});
    }
  }

  // 更新 rootPath
  static updateRootPath() {
    const editor = window.activeTextEditor;

    if (!editor || !workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
      return;
    }

    let rootPath = '';
    const resources = editor.document.uri;
    if (resources.scheme === 'file') {
      const folder = workspace.getWorkspaceFolder(resources);
      folder && (rootPath = folder.uri.fsPath);
    }

    !rootPath && workspace.rootPath && (rootPath = workspace.rootPath);

    if (rootPath && rootPath !== Core.rootPath) {
      Core.rootPath = rootPath;
      Log.info(`rootPath changed to ${rootPath}`);

      Core.fileWatcher?.dispose();

      Core.fileWatcher = workspace.createFileSystemWatcher(
        new RelativePattern(Core.rootPath, '**/*')
      );
      Core.fileWatcher.onDidChange((e) => Core.onFileChange(e));
      // TODO: 补充本地文案文件新建、删除逻辑
      Core.fileWatcher.onDidCreate((e) => console.log('file create >>> ', e));
      Core.fileWatcher.onDidDelete((e) => console.log('file delete >>> ', e));

      Core.updateI18nProjects();
    }
  }

  // 初始化国际化后台中项目对应的数据
  private static async updateI18nProjects() {
    const parsedProjects: {[pid: string]: any} = {};
    this.localePaths.forEach((file: any) => {
      const { files, name, pid, extractPattern } = file;

      let project = { ...parsedProjects[pid || name] };

      project.localPaths = files;

      if (extractPattern) {
        project.extractPattern = [ ...(parsedProjects[pid]?.extractPattern || []), extractPattern ];
      }

      parsedProjects[pid || name] = project;

      Core.projectFiles.push(`${Core.rootPath}/${file.path}`);
    });

    Object.keys(parsedProjects).forEach(pid => {
      this.i18nProjects[pid] = new I18nProject(pid, parsedProjects[pid]);
    }); 

    Core.projectFiles = _uniq(Core.projectFiles);
  }

  static i18nProjects: {[key: string]: I18nProject} = {};
  static projectFiles: string[] = [];  // 项目本地国际化文案路径
}