import { workspace } from 'vscode';

// .vscode settings.json 设置前缀
export const CONFIG_PREFIX = 'i18n-plugin';

// output channel 前缀
export const LOG_PREFIX = 'i18n-plugin';

// 国际化后台地址
export const I18N_URL = 'http://tools.app.terminus.io';

export const rootPath = workspace.workspaceFolders ? workspace.workspaceFolders[0].uri.fsPath : undefined;