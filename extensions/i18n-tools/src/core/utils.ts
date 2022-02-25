import { Core } from 'core';
import Config from 'core/config';
import * as fastGlob from 'fast-glob';
import * as path from 'path';

export function autoSetLocales() {
  // 项目所有的 locale 文件夹
  const localeDirs = fastGlob.sync(['**/**/locale'], {
    cwd: Core.rootPath,
    ignore: [
      '**/node_modules',
      "**/ios",
      "**/android",
      "**/dist",
      "**/public",
      "**/lib"
    ],
    onlyDirectories: true,
  });

  const basicConfig: any[] = [];
  localeDirs.forEach((dir) => {
    const messages = fastGlob.sync('**/*.json', { cwd: path.join(Core.rootPath, dir) });
    const locales: any = { name: dir, files: {} };
    messages.forEach((file) => {
      const localeKey = file.split('/')[0];
      locales.files[localeKey] = path.join(Core.rootPath, dir, file);
    });

    basicConfig.push(locales);
  });

  Config.setConfig('localePaths', basicConfig);

  return basicConfig;
}