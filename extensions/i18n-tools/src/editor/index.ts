import * as vscode from 'vscode';
import completion from './completion';

export function editorsActive(ctx: vscode.ExtensionContext) {
  completion(ctx);
}