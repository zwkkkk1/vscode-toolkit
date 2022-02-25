import * as vscode from 'vscode';
import { BaseItem } from '.';
import I18nMessage from 'core/i18n-message';
import { getFlag } from 'utils/helper';

class TextItem extends BaseItem {
  constructor(ctx: vscode.ExtensionContext, locale: string, message: I18nMessage) {
    super(ctx, locale);

    this.message = message;
    this.locale = locale;
  }

  message: I18nMessage;

  locale: string;

  get filePath() {
    return this.message.getFilePath(this.locale);
  }

  async getChildren(element?: BaseItem | undefined) {
    return [];
  }

  // @ts-expect-error
  get description() {
    return this.message.getLocale(this.locale);
  }

  // @ts-expect-error
  get iconPath() {
    return this.getIcon(`flags/${getFlag(this.locale)}.png`);
  }

  // @ts-expect-error
  get contextValue() {
    const result = ['textItem', 'normal'];

    if (this.message.getFilePath(this.locale)) {
      result.push('openable');
    }

    return result.join('-');
  }
}

export default TextItem;