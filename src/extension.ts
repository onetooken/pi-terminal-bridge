import * as vscode from 'vscode';

const CONFIG_SECTION = 'piTerminal';
const COMMAND_SETTING = 'command';
const OPEN_COMMAND = 'piTerminal.open';
const SEND_REFERENCE_COMMAND = 'piTerminal.sendReference';
const SEND_SELECTION_COMMAND = 'piTerminal.sendSelection';
const TERMINAL_NAME = 'Pi';
const BRACKETED_PASTE_START = '\u001b[200~';
const BRACKETED_PASTE_END = '\u001b[201~';

let piTerminal: vscode.Terminal | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const openDisposable = vscode.commands.registerCommand(OPEN_COMMAND, () => {
    openOrShowPiTerminal();
  });

  const sendReferenceDisposable = vscode.commands.registerCommand(
    SEND_REFERENCE_COMMAND,
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        void vscode.window.showInformationMessage('Open a file before sending a code reference to Pi Terminal Bridge.');
        return;
      }

      sendToPiTerminal(formatCodeReference(editor));
    },
  );

  const sendSelectionDisposable = vscode.commands.registerCommand(
    SEND_SELECTION_COMMAND,
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        void vscode.window.showInformationMessage('Select code before sending it to Pi Terminal Bridge.');
        return;
      }

      const selection = editor.selection;
      if (selection.isEmpty) {
        void vscode.window.showInformationMessage('Select code before sending it to Pi Terminal Bridge.');
        return;
      }

      sendToPiTerminal(formatSelectedCodeMessage(editor, editor.document.getText(selection)));
    },
  );

  const closeDisposable = vscode.window.onDidCloseTerminal((terminal) => {
    if (terminal === piTerminal) {
      piTerminal = undefined;
    }
  });

  context.subscriptions.push(
    openDisposable,
    sendReferenceDisposable,
    sendSelectionDisposable,
    closeDisposable,
  );
}

export function deactivate(): void {}

function openPiTerminal(): vscode.Terminal {
  piTerminal = vscode.window.createTerminal({
    name: TERMINAL_NAME,
    location: vscode.TerminalLocation.Editor,
  });
  piTerminal.show();

  const command = getPiCommand();
  if (command.length > 0) {
    piTerminal.sendText(command, true);
  }

  return piTerminal;
}

function openOrShowPiTerminal(): vscode.Terminal {
  if (piTerminal) {
    piTerminal.show();
    return piTerminal;
  }

  return openPiTerminal();
}

function getOrOpenPiTerminal(): vscode.Terminal {
  return openOrShowPiTerminal();
}

function sendToPiTerminal(text: string): void {
  const terminal = getOrOpenPiTerminal();
  terminal.sendText(text, false);
}

function getPiCommand(): string {
  return vscode.workspace
    .getConfiguration(CONFIG_SECTION)
    .get<string>(COMMAND_SETTING, 'pi')
    .trim();
}

function formatSelectedCodeMessage(editor: vscode.TextEditor, text: string): string {
  return `${formatCodeReference(editor)} ${formatSelectedCodeForTerminal(text)}`;
}

function formatSelectedCodeForTerminal(text: string): string {
  return `${BRACKETED_PASTE_START}${text}${BRACKETED_PASTE_END}`;
}

function formatCodeReference(editor: vscode.TextEditor): string {
  const document = editor.document;
  const filePath = getReferencePath(document.uri);
  const selection = editor.selection;

  if (selection.isEmpty) {
    return `@${filePath}`;
  }

  const startLine = selection.start.line + 1;
  const endLine = getInclusiveEndLine(selection);

  if (startLine === endLine) {
    return `@${filePath}:${startLine}`;
  }

  return `@${filePath}:${startLine}-${endLine}`;
}

function getReferencePath(uri: vscode.Uri): string {
  if (uri.scheme !== 'file') {
    return uri.toString();
  }

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  if (!workspaceFolder) {
    return uri.fsPath;
  }

  return vscode.workspace.asRelativePath(uri, false);
}

function getInclusiveEndLine(selection: vscode.Selection): number {
  if (selection.end.character === 0 && selection.end.line > selection.start.line) {
    return selection.end.line;
  }

  return selection.end.line + 1;
}
