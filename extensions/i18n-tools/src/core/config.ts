import { workspace } from 'vscode';
import { CONFIG_PREFIX } from '../utils/constants';

// settings.json 注册的字段
type presetConfigKey = 'localePaths';

export default class Config {
  static getConfig<T = any>(key: presetConfigKey): T | undefined {
    const config = workspace
      .getConfiguration(CONFIG_PREFIX)
      .get<T>(key);
      
    return config;
  }

  static async setConfig(key: presetConfigKey, value: any) {
    return await workspace
      .getConfiguration(CONFIG_PREFIX)
      .update(key, value);
  }
}