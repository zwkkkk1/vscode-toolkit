import { ExtensionContext, commands, window, Uri } from 'vscode';
import * as globby from 'globby';
import { extract } from 'commands/extractLocal/extract';
import _flatten from 'lodash/flatten';
import { ProjectItem } from 'views/items';
import Log from 'utils/log';
import I18nMessage from 'core/i18n-message';
import { Core } from 'core';

export type localUsageType = {
  defaultMessage: string,
  file: string,
  id: string,
  start: number,
  end: number,
};

async function extractLocal(item: ProjectItem) {
  const extractPattern = item.project.localConfig.extractPattern;
  if (!Array.isArray(extractPattern) || extractPattern.length === 0) {
    window.showInformationMessage('请先选择待扫描文件夹', { modal: true }, '选择').then(async (res) => {
      const files = await window.showOpenDialog({ 
        title: '请选择扫描文件夹', 
        canSelectFiles: false, 
        canSelectFolders: true, 
        canSelectMany: true, 
        openLabel: '选择',
        defaultUri: Uri.file(Core.rootPath)
      });

      if (files?.length) {
        const filePaths = files.map((file: Uri) => `${file.path}/**/*.{ts,tsx,js,jsx}`);
        item.project.setLocalConfig((prev) => ({ ...prev, extractPattern: filePaths }));
      }
    });
    return;
  }
  try {
    Log.loading('扫描本地项目中...');
    console.time('start extract');

    const paths = globby.sync(extractPattern);

    const result = await extract(paths, {
      extractSourceLocation: true,  // 展示具体扫描的文件、位置
    });

    console.timeEnd('start extract');

    Object.entries(result).forEach(([key, value]) => {
      const localMessage = item.project.localMessages[key];
      if (localMessage) {
        localMessage.localUsage = value;
      } else {
        // 若扫描结果中存在本地文案没有的 key 值
        item.project.noInitLocalMessages.push(new I18nMessage(key, item.project));
      }

      item.project.isExtract = true;

      Core.onDidChangeLocalEmitter.fire({});
    });

    Log.loadingEnd();
  } catch(err) {
    console.log('extract local failed >>> ', err);
  }
}

export default function(ctx: ExtensionContext) {
  ctx.subscriptions.push(commands.registerCommand('i18n-plugin.extractLocal', extractLocal));
}