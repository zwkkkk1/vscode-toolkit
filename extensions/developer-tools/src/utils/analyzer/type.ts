export interface OptionType {
  filePath?: string;
  dictionaryPath?: string;
  ignoreDictionaryPath?: RegExp[];
  ignore?: RegExp[];
  match?: RegExp[];
  tsconfigPath?: string;
  alias?: {
      [path: string]: string;
  };
  isJs?: boolean,
}
