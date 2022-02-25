// import Project, { ts, ScriptTarget, SyntaxKind } from 'ts-simple-ast';
import { Project, ts, SyntaxKind, ScriptTarget } from 'ts-morph';
import * as fse from 'fs-extra';

function getTsDeps(filePath: string, project: Project, res: string[] = []) {
  if (filePath) {
    let sourceFile = project.addSourceFileAtPath(filePath);
    const imports = sourceFile.getImportDeclarations();
    for (let i = 0; i < imports.length; i++) {
      const importDeclaration = imports[i];
      const des = importDeclaration.getModuleSpecifierValue();
      res.push(des);
    }
  }

  return res;
}

function walk(sourceFile: ts.Node) {
  const denpendences: string[] = [];

  function _walk(node: ts.Node) {
    if (node.kind === SyntaxKind.ImportDeclaration) {
      return;
  }

  if (node.kind === SyntaxKind.CallExpression) {
      // 非贪婪
      const matched = node.getText().match(/(import|require)\((.+?)\)/);
      // tslint:disable-next-line:no-unused-expression
      matched && denpendences.push(matched[2].replace(/'|"/g, ''));
    }
    ts.forEachChild(node, _walk);
  }

  _walk(sourceFile);
  return denpendences;
}

let project: Project;
function getProject(tsconfigPath?: string) {
  if (!project) {
    project = new Project({ tsConfigFilePath: tsconfigPath });
  }
  return project;
}

export function parse(filePath: string, tsconfigPath: string) {
  const sourceFile = ts.createSourceFile(filePath, fse.readFileSync(filePath).toString(), ScriptTarget.ESNext, true);
  const project = getProject(tsconfigPath);
  const denpendencesWithoutWalker = getTsDeps(filePath, project, []);

  const denpendences = [...denpendencesWithoutWalker, ...walk(sourceFile)];

  return denpendences;
}
