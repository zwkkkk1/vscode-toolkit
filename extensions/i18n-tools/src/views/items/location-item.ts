import * as vscode from 'vscode';

class LocationItem extends vscode.TreeItem {
  constructor(public readonly location: vscode.Location) {
    super(location.uri);
  }

  // @ts-expect-error
  get description() {
    return `${this.location.range.start.line + 1}:${this.location.range.start.character + 1}`;
  }

  // @ts-expect-error
  get command(): vscode.Command {
    return {
      title: '',
      command: 'vscode.open',
      arguments: [
        this.location.uri,
        { selection: this.location.range }
      ]
    };
  }
}

export default LocationItem;