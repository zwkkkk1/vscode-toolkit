export type LocaleConfigType = {
  name: string, // 项目标识
  files: {[key: string]: string},  // 文件
  extractPattern?: string[], // 待扫描文件夹
};