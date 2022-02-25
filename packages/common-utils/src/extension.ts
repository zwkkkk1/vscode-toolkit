import { ExtensionContext, window } from 'vscode';

export async function initExtension(context: ExtensionContext) {
  onChangeActiveTextEditor(context);
}

function onChangeActiveTextEditor(context: ExtensionContext) {
  window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {

    }
  });
}
