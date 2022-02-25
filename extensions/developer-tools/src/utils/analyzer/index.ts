import * as fse from 'fs-extra';
import * as path from 'path';
import { OptionType } from './type';
import { parse } from './ts-parser';
import { jsResolveOptions } from './resolver';

const tree: {[filePath: string]: any} = {};

const DEFAULT_IGNORE_FILE = [/.*\.d\.ts/];
const MATCHED_FILE_EXT = [/\.tsx?$/, /\.jsx?$/];
const IGNORE_DIRS = [/node_modules/, /\.vscode/, /\.git/, /\.dice/, /public/];

function analyzeFile(options: OptionType) {
  const { filePath, tsconfigPath } = options;

  console.log(`开始分析 >>> ${filePath}`);
  console.time(`分析完成 >>> ${filePath}`);

  if (filePath && tsconfigPath) {
    const denpendences = parse(filePath, tsconfigPath);

    const resolvedModules = denpendences.map((notResolvedDenpath) => {
      return jsResolveOptions({
          moduleName: notResolvedDenpath,
          containlingFile: options.filePath,
          alias: options.alias,
      });
    });
    tree[filePath] = {
      notResolvedPaths: denpendences,
      resolvedModules,
      denpendencesFileName: resolvedModules.map((item, index) => {
          return item && item.resolvedFileName
              ? path.resolve(item.resolvedFileName)
              : denpendences[index];
      }),
    };

    console.timeEnd(`分析完成 >>> ${filePath}`);

    return tree;
  }
}

async function analyze(options: OptionType) {
  if (options.filePath) {
    return await analyzeFile({
      filePath: options.filePath,
      tsconfigPath: options.tsconfigPath,
      alias: options.alias,
    });
  }
  if (!options.ignore) {
    options.ignore = DEFAULT_IGNORE_FILE;
  }
  if (!options.match) {
    options.match = MATCHED_FILE_EXT;
  }
  if (!options.ignoreDictionaryPath) {
    options.ignoreDictionaryPath = IGNORE_DIRS;
}
  if (options.dictionaryPath) {
    const dirInfos = fse.readdirSync(options.dictionaryPath);
    if (!dirInfos) {
      throw new Error(`请检查 ${options.dictionaryPath}`);
    }

    for (let i = 0; i < dirInfos.length; i++) {
      const fileName = dirInfos[i];
      const filePath = path.resolve(options.dictionaryPath || '', fileName);
      const stat = fse.statSync(filePath);
      const isIgnore = options.ignore?.some((em) => {
        return em.test(filePath);
      });
      const isMatch = options.match?.some((em) => {
          return em.test(filePath);
      });
      if (stat.isFile() && !isIgnore && isMatch) {
        await analyzeFile({
          filePath,
          tsconfigPath: options.tsconfigPath,
          alias: options.alias,
      });
      } else if (stat.isDirectory()) {
        if (!options.ignoreDictionaryPath?.some((em) => {
              return em.test(filePath);
          })) {
              console.log(`开始遍历文件夹 >>> ${filePath}`);
              // filePath是文件夹路径
              await analyze({
                  dictionaryPath: filePath,
                  tsconfigPath: options.tsconfigPath,
                  alias: options.alias,
              });
          }
          else {
              console.log(`遇到 ${filePath} 忽略`);
          }
      }
    }

    return tree;
  }
}

export async function startAnalyze(options: OptionType) {
  console.log('start analyzer >>> ');

  const trees = await analyze(options);

  console.log('trees >>> ', trees);
}

