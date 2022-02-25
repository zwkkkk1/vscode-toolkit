import { Uri } from 'vscode';
import { Core } from 'core';
import Config from 'core/config';
import I18nMessage from 'core/i18n-message';
import { getMessagesByPid, getProjectByPid } from 'services/i18n';
import JsonParser from 'parsers/json';
import { LocaleConfigType } from 'core/types';
import { REASON_LABEL } from 'core/validator/constants';

type ProjectInfo = {
  id: number, // 项目id
  createAt: number, // 创建时间
  updateAt: number, // 更新时间
  name: string,     // 名称
  description: string,  // 描述
};

export type RemoteMessage = {
  id: string, // 文案 id
  createAt: number, // 创建时间
  updateAt: number, // 更新时间
  key: string,  // 文案 key 值
  zh_cn: string,  // 中文文案
  en_us: string,  // 英文文案
};

// 一个实例对应 i18n 后台一个项目
class I18nProject {
  constructor(pid: string, parsedProject: any) {
    this.pid = pid;
    this.localPaths = parsedProject.localPaths;
    this.localMessages = this.convertLocalMessages(parsedProject.localPaths);
  }

  pid: string;  // 项目 id
  projectInfo: ProjectInfo | undefined; // 国际化后台中的项目信息
  localMessages: {[key: string]: I18nMessage} = {}; // 本地文件翻译情况
  localPaths: {[key: string]: string}; // 本地文件路径
  remoteMessages: {[key: string]: I18nMessage} = {}; // 国际化后台的文案集合
  isExtract: boolean = false; // 是否扫描过
  isFetchRemote: boolean = false; // 是否获取后台数据

  noInitLocalMessages: I18nMessage[] = []; // 扫描结果中 存在未在本地 messages.json 的文案
  noInitRemoteMessages: I18nMessage[] = []; // 远程后台 存在未在本地 messages.json 的文案

  get localConfig(): LocaleConfigType {
    const localIndex = Core.localePaths.findIndex((path: LocaleConfigType) => this.pid === path.name);
    return localIndex > -1 ? Core.localePaths[localIndex] : {};
  }

  setLocalConfig(
    config: ((prevConfig: Readonly<LocaleConfigType>) => (LocaleConfigType | null) | LocaleConfigType | null)
  ): void {
    const newConfig = typeof config === 'function' ? config(this.localConfig) : config;
    const newLocalePaths = [...Core.localePaths];
    const localIndex = Core.localePaths.findIndex((path: LocaleConfigType) => this.pid === path.name);
    localIndex > -1 ? (newLocalePaths[localIndex] = newConfig) : newLocalePaths.push(newConfig);
    Core.localePaths = newLocalePaths;
  }

  get successMessages() {
    const messages: {[key: string]: I18nMessage} = {};
    Object.entries(this.localMessages).forEach(([id, message]) => {
      if (message.validator.isSuccess) {
        messages[message.key] = message;
      }
    });
    return messages;
  }
  
  get warnings() {
    const messages: Partial<Record<keyof typeof REASON_LABEL, I18nMessage[]>> = {};
    Object.entries(this.localMessages).forEach(([id, message]) => {
      const keys = Object.keys(message.validator.warnings) as Array<keyof typeof REASON_LABEL>;
      if (keys.length) {
        const messageItem = this.localMessages[id];
        keys.forEach((warningKey: keyof typeof REASON_LABEL) => {
          Array.isArray(messages[warningKey]) ? messages[warningKey]?.push(messageItem) : (messages[warningKey] = [messageItem]);
        });
      }
    });

    if (this.isExtract && this.noInitLocalMessages.length > 0) {
      messages.used_not_in_local = this.noInitLocalMessages;
    }

    if (this.isFetchRemote && this.noInitRemoteMessages.length > 0) {
      messages.remote_not_in_local  = this.noInitRemoteMessages;
    }
    
    return messages;
  }

  get fails() {
    return this.noInitLocalMessages;
  }

  get label() {
    if (this.projectInfo) {
      return `${this.projectInfo.name}  id: ${this.pid}`;
    }
    return `id: ${this.pid}`;
  }

  // 根据本地国际化文案组装生成 localMessages
  convertLocalMessages(localPaths: any) {
    const messages: {[key: string]: I18nMessage} = {};
    Object.keys(localPaths).forEach((localeKey: string) => {
      // 根据 path 获取文案集合
      const localMessages = JsonParser.read(localPaths[localeKey]);

      // 遍历文案集合，创建 I18nMessage，或者向已有 instance 中塞入文案
      Object.keys(localMessages).forEach(key => {
        if (messages[key]) {
          messages[key].setLocale(localeKey, localMessages[key]);
        } else {
          const message = new I18nMessage(key, this);
          message.setLocale(localeKey, localMessages[key]);
          messages[key] = message;
        }
      });
    });

    return messages;
  }

  // 根据 pid 从国际化后台获取项目信息
  async getProjectInfoByPid() {
    this.projectInfo = await getProjectByPid(this.pid);
  }

  // 根据 pid，从国际化后台获取文案
  async getMessagesFromRemote() {
    const data = await getMessagesByPid(this.pid) || {};
    
    data.data?.forEach((item: RemoteMessage) => {
      const { key, zh_cn, en_us } = item;
      if (this.localMessages[key]) {
        this.localMessages[key].remoteRecords = {
          'zh-CN': zh_cn,
          'en-US': en_us
        };
      } else {
        const message = new I18nMessage(key, this);
        message.setLocale('zh-CN', zh_cn);
        message.setLocale('en-US', en_us);
        this.noInitRemoteMessages.push(message);
      }
    });

    this.isFetchRemote = true;
  }
}

export default I18nProject;