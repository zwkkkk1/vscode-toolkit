import * as bcp47 from 'bcp-47';

const flagAlias: {[key: string]: string} = {
  'en': 'us',
  'zh': 'cn',
  'tw': 'cn'
};

// 国际化标识根据 bcp-47 标准 https://www.techonthenet.com/js/language_tags.php
// 国旗 svg 名称采用 region.toLowerCase 展示，国旗svg可从此处下载 https://github.com/hampusborgos/country-flags
export function getFlag(locale: string) {
  if (flagAlias[locale]) {
    return flagAlias[locale];
  }
  const { region, language } = bcp47.parse(locale, { normalize: true, forgiving: true });

  if (!language) { return ''; }

  return (region|| language || '').toLowerCase();
}