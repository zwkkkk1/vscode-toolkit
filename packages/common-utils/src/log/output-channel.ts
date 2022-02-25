// 在 OutputChannel 输出文本信息 https://code.visualstudio.com/api/references/vscode-api#OutputChannel
import { OutputChannel, window } from "vscode";

const LOG_CHANNEL_PREFIX = 'vscode-toolkit'

let _channel: OutputChannel
function getOutputChannel() {
  if (!_channel) {
    _channel = window.createOutputChannel(LOG_CHANNEL_PREFIX)
  }
  return _channel
}

export function logOutputChannel(msg: string) {
  // TODO: 后续加入 debug 模式，仅在 debug 模式打印文案，提升插件性能
  const channel = getOutputChannel()
  channel.appendLine(msg)

  // TODO: 后续加入日志系统，可将输出文案 作为日志文件留痕
}
