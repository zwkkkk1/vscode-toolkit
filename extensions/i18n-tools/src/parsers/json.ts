// @ts-expect-error
import JsonMap from 'json-source-map';
import * as fse from 'fs-extra';

type rangeType = {
  keyStart: number,
  keyEnd: number,
  valueStart: number,
  valueEnd: number,
};

class JsonParser{
  static parseAST(text: string) {
    const range: {[key: string]: rangeType} = {};
    Object.entries<any>(JsonMap.parse(text).pointers)
      .forEach(([key, value]) => {
        if (key) {
          range[key.replace(/\//, '')] = {
            keyStart: value.key.pos,
            keyEnd: value.keyEnd.pos,
            valueStart: value.value.pos,
            valueEnd: value.value.pos,
          };
        }
      });
    return range;
  }

  static read(filePath: string): any {
    return fse.readJsonSync(filePath, { encoding: 'utf-8' });
  }

  static save(filePath: string, newText: string) {
    fse.writeJsonSync(filePath, newText, { spaces: 2 });
  }
}

export default JsonParser;