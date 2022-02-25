import * as vscode from 'vscode';
import _flatten from 'lodash/flatten';
import translateKey from "./translateKey";
import editKey from './editKey';
import gotoKey from './gotoKey';
import copyKey from './copyKey';
import extractLocal from './extractLocal';

export function commandsActivate (ctx: vscode.ExtensionContext) {
  translateKey(ctx);
  editKey(ctx);
  gotoKey(ctx);
  copyKey(ctx);
  extractLocal(ctx);
}