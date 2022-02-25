import I18nProject from "core/i18n-project";
import { localUsageType } from "commands/extractLocal";
import Validator from "core/validator";
 
class I18nMessage {
  constructor(key: string, project: I18nProject) {
    this.key = key;
    this.project = project;
  }

  key: string;
  records: {[key: string]: string | undefined | null} = {};  // 文案 value 集合
  remoteRecords: {[key: string]: string | undefined | null} = {}; // 远程项目文案 value 集合
  project: I18nProject; // 所属项目
  localUsage: localUsageType[] = []; // 当前 Message 本地使用情况

  validator: Validator = new Validator([{ 
      key: 'missing_text', 
      level: 'warning',
      validator: () =>  !!Object.entries(this.records).find(([k, v]) => !v) 
    }, { 
      key: 'cn_key', 
      level: 'warning',
      validator: () => /[\u4e00-\u9fa5]/.test(this.key)
    }, {
      key: 'no_use',
      level: 'warning',
      validator: () => this.project.isExtract && this.localUsage.length === 0
    }, {
      key: 'remote_not_set',
      level: 'warning',
      validator: () => this.project.isFetchRemote && Object.keys(this.remoteRecords).length === 0
    }
  ]);

  // 根据 localKey 获取本地文件
  getFilePath(localKey: string | undefined) {
    if (!localKey) { return ''; }
    
    return this.project.localPaths[localKey] || '';
  }

  // 获取当前所有 locale 对应的文件路径
  getFilePaths(): string[] {
    return Object.entries(this.project.localPaths).map(([k, v]) => v);
  }

  getLocale(key: string) {
    return this.records[key] || '';
  }

  setLocale(key: string, value: string) {
    this.records[key] = value;
  }
}

export default I18nMessage;