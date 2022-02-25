import I18nProject from 'core/i18n-project';
import { REASON_LABEL } from 'core/validator/constants';
import { ExtensionContext, TreeItemCollapsibleState } from 'vscode';

import { BaseItem, MessageItem } from '.';
import StatusItem from './status-item';

class ProjectItem extends BaseItem {
  constructor(ctx: ExtensionContext, project: I18nProject, collapsibleState: TreeItemCollapsibleState) {
    super(ctx, project.label, collapsibleState);

    this.project = project;
  }

  project: I18nProject;

  async getChildren(element?: ProjectItem | undefined): Promise<BaseItem[]> {
    if (element) {
      return element.getChildren();
    }

    const children = [];

    // 塞入待扫描文件夹选项
    const extractPattern = this.project.localConfig.extractPattern?.map((pattern) => {
      return new BaseItem(this.ctx, pattern);
    });
    extractPattern && (children.push(new BaseItem(this.ctx, '扫描范围', TreeItemCollapsibleState.Collapsed, extractPattern)));

    const successMessages = Object.entries(this.project.successMessages).map(([k, v]) => {
      return new MessageItem(this.ctx, v, TreeItemCollapsibleState.Collapsed);
    });

    children.push(new StatusItem(this.ctx, 'success', successMessages));

    Object.entries(this.project.warnings).forEach(([warningKey, messageItems]) => {
      children.push(
        new StatusItem(this.ctx, 'warning', messageItems.map((item) => {
          return new MessageItem(this.ctx, item, TreeItemCollapsibleState.Collapsed);
        }), REASON_LABEL[warningKey as keyof typeof REASON_LABEL])
      );
    });

    return children;
  }

  contextValue = 'projectItem';
}

export default ProjectItem;