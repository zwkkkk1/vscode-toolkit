import * as ts from 'typescript';

export function jsResolveOptions(options: any) {
  const host = ts.createCompilerHost({ ...options.optionsTsconfig, moduleResolution: ts.ModuleResolutionKind.NodeJs });
  const resolvedModule = ts.resolveModuleName(options.moduleName, options.containlingFile, Object.assign({}, options.optionsTsconfig, { moduleResolution: ts.ModuleResolutionKind.NodeJs }), host).resolvedModule;

  return resolvedModule;
}
