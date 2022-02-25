import * as path from 'path';
import * as fse from 'fs-extra';
import * as spawn from 'cross-spawn';

function extensionDepsInstall() {
  const extensionsPath = path.join(__dirname, '..', 'extensions');
  const extensionFiles = fse.readdirSync(extensionsPath);
  const installCommonds = ['install'];

  for (let i = 0; i < extensionFiles.length; i++) {
    const cwd = path.join(extensionsPath, extensionFiles[i]);
    // eslint-disable-next-line quotes
    console.log("Installing extension's dependencies", cwd);

    spawn.sync('npm', installCommonds, {
      stdio: 'inherit',
      cwd,
    });
    const webviewPath = path.join(cwd, 'web');
    if (fse.existsSync(webviewPath)) {
      // eslint-disable-next-line quotes
      console.log("Installing extension webview's dependencies", webviewPath);
      spawn.sync('npm', installCommonds, {
        stdio: 'inherit',
        cwd: webviewPath,
      });
    }
  }
}

try {
  extensionDepsInstall();
} catch (e) {
  console.trace(e);
  process.exit(128);
}
