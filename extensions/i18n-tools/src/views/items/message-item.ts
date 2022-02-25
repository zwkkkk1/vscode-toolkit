import { ExtensionContext, TreeItemCollapsibleState, workspace, Range, Location } from 'vscode';
import { BaseItem, TextItem } from '.';
import I18nMessage from 'core/i18n-message';
import LocationItem from './location-item';

class MessageItem extends BaseItem {
  constructor(ctx: ExtensionContext, message: I18nMessage, collapsibleState: TreeItemCollapsibleState) {
    super(ctx, message.key, collapsibleState);

    this.message = message;
  }

  iconPath = this.getIcon('string.svg');
  message: I18nMessage;

  // @ts-expect-error
  get contextValue() {
    const result = ['messageItem', 'normal'];

    return result.join('-');
  }

  async getChildren(element?: BaseItem | undefined) {
    const { localUsage, records } = this.message;
    const children: any[] = Object.entries(records).map(([locale]) => {
      return new TextItem(this.ctx, locale, this.message);
    });
    this.message;

    for (const usage of localUsage) {
      const document = await workspace.openTextDocument(usage.file);
      const range = new Range(
        document.positionAt(usage.start),
        document.positionAt(usage.end)
      );

      children.push(new LocationItem(new Location(document.uri, range)));
    }

    return children;
  }
}

export default MessageItem;