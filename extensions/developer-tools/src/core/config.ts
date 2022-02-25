import { workspace } from 'vscode';

// settings.json 注册的字段
const CONFIG_PREFIX = 'vscode-toolkit';

export default class Config {
  static getConfig<T = any>(key: string): T | undefined {
    const config = workspace
      .getConfiguration(CONFIG_PREFIX)
      .get<T>(key);

    return config;
  }

  static async setConfig(key: string, value: any) {
    return await workspace
      .getConfiguration(CONFIG_PREFIX)
      .update(key, value);
  }
}
