"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const CONFIG_SECTION = 'piTerminal';
const COMMAND_SETTING = 'command';
const OPEN_COMMAND = 'piTerminal.open';
const SEND_REFERENCE_COMMAND = 'piTerminal.sendReference';
const SEND_SELECTION_COMMAND = 'piTerminal.sendSelection';
const TERMINAL_NAME = 'Pi';
const BRACKETED_PASTE_START = '\u001b[200~';
const BRACKETED_PASTE_END = '\u001b[201~';
let piTerminal;
function activate(context) {
    const openDisposable = vscode.commands.registerCommand(OPEN_COMMAND, () => {
        openOrShowPiTerminal();
    });
    const sendReferenceDisposable = vscode.commands.registerCommand(SEND_REFERENCE_COMMAND, () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            void vscode.window.showInformationMessage('Open a file before sending a code reference to Pi Terminal Bridge.');
            return;
        }
        sendToPiTerminal(formatCodeReference(editor));
    });
    const sendSelectionDisposable = vscode.commands.registerCommand(SEND_SELECTION_COMMAND, () => {
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
    });
    const closeDisposable = vscode.window.onDidCloseTerminal((terminal) => {
        if (terminal === piTerminal) {
            piTerminal = undefined;
        }
    });
    context.subscriptions.push(openDisposable, sendReferenceDisposable, sendSelectionDisposable, closeDisposable);
}
function deactivate() { }
function openPiTerminal() {
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
function openOrShowPiTerminal() {
    if (piTerminal) {
        piTerminal.show();
        return piTerminal;
    }
    return openPiTerminal();
}
function getOrOpenPiTerminal() {
    return openOrShowPiTerminal();
}
function sendToPiTerminal(text) {
    const terminal = getOrOpenPiTerminal();
    terminal.sendText(text, false);
}
function getPiCommand() {
    return vscode.workspace
        .getConfiguration(CONFIG_SECTION)
        .get(COMMAND_SETTING, 'pi')
        .trim();
}
function formatSelectedCodeMessage(editor, text) {
    return `${formatCodeReference(editor)} ${formatSelectedCodeForTerminal(text)}`;
}
function formatSelectedCodeForTerminal(text) {
    return `${BRACKETED_PASTE_START}${text}${BRACKETED_PASTE_END}`;
}
function formatCodeReference(editor) {
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
function getReferencePath(uri) {
    if (uri.scheme !== 'file') {
        return uri.toString();
    }
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (!workspaceFolder) {
        return uri.fsPath;
    }
    return vscode.workspace.asRelativePath(uri, false);
}
function getInclusiveEndLine(selection) {
    if (selection.end.character === 0 && selection.end.line > selection.start.line) {
        return selection.end.line;
    }
    return selection.end.line + 1;
}
//# sourceMappingURL=extension.js.map