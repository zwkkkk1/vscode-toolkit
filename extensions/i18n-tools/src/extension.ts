import { ExtensionContext, commands, window } from 'vscode';
import { Core } from 'core/index';
import CurrentFile from 'core/currentFile';
import { commandsActivate } from 'commands';
import { editorPanelActivate } from 'editor-panel';
import LocalFilesProvider from 'views/providers/LocalFilesProvider';
import CurrentFileProvider from 'views/providers/currentFileProvider';

export function activate(context: ExtensionContext) {
	console.log('Congratulations, your extension "i18n-plugin" is now active!');

	Core.init(context);

	CurrentFile.watch(context);

	commandsActivate(context);
	editorPanelActivate(context);

	const localFilesProvider = new LocalFilesProvider(context);
	const currentFileProvider = new CurrentFileProvider(context);

	context.subscriptions.push(window.registerTreeDataProvider('i18n-plugin-local-files', localFilesProvider));
	context.subscriptions.push(window.registerTreeDataProvider('i18n-plugin-current-file', currentFileProvider));
	context.subscriptions.push(commands.registerCommand('i18n-plugin.refreshProject', (item: any) => localFilesProvider.refresh(item)));
}

// this method is called when your extension is deactivated
export function deactivate() {}
