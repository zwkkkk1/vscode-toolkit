export const REASON_LABEL = {
  // I18nMessage 中定义
  missing_text: '文案缺失',   // 本地 message.json 文案缺失
  cn_key: '中文 key', // 本地 message.json key值为中文
  no_use: '项目未使用', // 通过 extract 扫描后，本地 message.json 中未使用的值

  remote_not_set: '未上传至后台', // 未上传至国际化后台

  // I18nProject 中定义
  used_not_in_local: '使用未在本地文件定义的文案', // 通过 extract 扫描后，存在 messageItem 未在本地 message.json 中设置
  remote_not_in_local: '后台文案未在本地文件定义' // 国际化后台中存在未在本地 message.json 中的key值
};