import { window, Disposable, FileDecoration, FileDecorationProvider, EventEmitter, Uri, Event, CancellationToken, ThemeColor } from 'vscode';
import { isOriginFile, hasOriginFileReDevelop } from '../utils';

export class ViewFileDecorationProvider implements FileDecorationProvider, Disposable {
  private readonly _onDidChange = new EventEmitter<undefined | Uri | Uri[]>();
	get onDidChange(): Event<undefined | Uri | Uri[]> {
		return this._onDidChange.event;
	}

  private readonly disposable: Disposable;
  constructor() {
		this.disposable = Disposable.from(
			window.registerFileDecorationProvider(this),
		);
	}

  dispose(): void {
		this.disposable.dispose();
	}

  provideFileDecoration(uri: Uri, token: CancellationToken): FileDecoration | undefined {
    if (isOriginFile(uri) && hasOriginFileReDevelop(uri)) {
      return {
        badge: 'R',
        color: new ThemeColor('gitDecoration.ignoredResourceForeground'),
        tooltip: '该文件已二开',
      };
    }
    return undefined;
  }
}
