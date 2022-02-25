import * as vscode from 'vscode';
import { LOG_PREFIX } from 'utils/constants';

class Log {
  private static _channel: vscode.OutputChannel;
  private static _loadingItem: vscode.StatusBarItem;

  static get loadingItem() {
    if (!Log._loadingItem) {
      Log._loadingItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 5);
    }
    return Log._loadingItem;
  }

  static get outputChannel() {
    if (!Log._channel) {
      Log._channel = vscode.window.createOutputChannel(LOG_PREFIX);
    }
    return Log._channel;
  }

  static info(message: string) {
    Log.outputChannel.appendLine(`\t ${message}`);
  }

  static warning(message: string, prompt?: boolean) {
    if (prompt) {
      vscode.window.showWarningMessage(message);
    }
    Log.info(message);
  }

  static error(error: Error | string, prompt: boolean = true) {
    if (typeof error !== 'string')
    {Log.info(`🐛 ERROR: ${error.name}: ${error.message}\n${error.stack}`);};

    if (prompt) {
      const message = typeof error === 'string'
        ? error : `i18n-plugin Error: ${error.toString()}`;

      vscode.window.showErrorMessage(message);
    }
  }

  // 在 statusbar 展示 loading 状态
  static loading(message?: string) {
    Log.loadingItem.text = `$(loading~spin) [${LOG_PREFIX}] ${message || 'loading...'}`;

    Log.loadingItem.show();
  }

  // 隐藏 statusbar loading
  static loadingEnd() {
    Log.loadingItem.hide();
  }
}

export default Log;