import { Uri, workspace } from 'vscode';
import Config from '../core/config';

function removeCompAndRef(uri: Uri) {
  const config = Config.getConfig('originPath');
  const rootPath = workspace.rootPath || '';
  console.log('uri >>> ', uri, config, rootPath);
}

export default removeCompAndRef;
