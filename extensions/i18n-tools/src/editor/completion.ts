import * as vscode from 'vscode';
import * as ts from 'typescript';
import * as tsUtils from 'tsutils';

class CompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const fileText = document.getText();
    const program = ts.createProgram([document.fileName], { allowJs: true });
    const sourceFile = program.getSourceFile(document.fileName);
    console.log('program >>> ', program, sourceFile);

    //@ts-ignore
    const token = tsUtils.getTokenAtPosition(sourceFile, document.offsetAt(position));

    console.log('token >>> ', token);
    return [];
  }
}

export default function(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'].map((i) => ({ scheme: 'file', language: i })), 
      new CompletionProvider(),
      '/', '"', "/"
    ),
  );
}
