import { window, commands, ExtensionContext } from 'vscode';
import { TextItem } from 'views/items';
import GoogleTranslation from 'translation/google';
import JsonParser from 'parsers/json';

// TODO: 代码需要优化 if 层级太深
async function translate(item: TextItem) {
  let to = item.locale;;

  if (to) {
    const options: any[] = [];
    Object.keys(item.message.records).forEach(it => {
      if (it !== to && item.message.getLocale(it)) {
        options.push({ label: it, description: item.message.getLocale(it) });
      }
    });
    // 如果选项只有一个 则跳过选择
    const from = options.length > 1 ? 
      (await window.showQuickPick(options, { placeHolder: '请选择源语言进行翻译' }))?.label
       : options[0].label;

    if (from) {
      try {
        const originText = item.message.getLocale(from); // 翻译源文案
        const translation = await GoogleTranslation.translate(originText, from, to);
  
        if (translation) {
          const newValue = await window.showInputBox({
            placeHolder: '请输入新文案',
            value: translation,
            title: `源文案：${originText}`
          });
    
          if (newValue) {
            const filePath = item.message.getFilePath(to);
    
            const result = JsonParser.read(filePath);
            result[item.message.key] = newValue;
            JsonParser.save(filePath, result);

            window.showInformationMessage('翻译成功');
          }
        } else {
          window.showWarningMessage('0 translation results!');
        }
      } catch (err: any) {
        console.log('translate failed: ', err);
        window.showWarningMessage(`翻译失败：${err.message}`);
      }
    }
  }
}

export default function (ctx: ExtensionContext) {
  ctx.subscriptions.push(commands.registerCommand('i18n-plugin.translateKey', translate));
}