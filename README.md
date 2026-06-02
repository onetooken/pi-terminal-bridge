# Pi Terminal Bridge

## 中文

Pi Terminal Bridge 是一个最小化的 VS Code 扩展，用于打开一个共享的内置终端 `Pi`，并执行可配置的启动命令。

### 使用

在命令面板中运行：

```text
Pi Terminal Bridge: Open / 打开 Pi 终端
```

也可以点击编辑器标题栏中的终端图标打开 Pi 终端。

该命令只维护一个共享的 `Pi` 终端实例。如果终端已经打开，会聚焦已有终端，而不是再创建一个新终端。

如果当前没有 `Pi` 终端，扩展会在第一编辑器列打开一个新终端。

默认情况下，扩展会向新终端发送：

```text
pi
```

可以在 VS Code 设置中修改：

```json
{
  "piTerminal.command": "pi"
}
```

例如：

```json
{
  "piTerminal.command": "echo hello"
}
```

### 发送代码到 Pi

Pi Terminal Bridge 会在编辑器右键菜单中添加操作，用于把代码上下文发送到 Pi 终端。

在编辑器中右键运行：

```text
Pi Terminal Bridge: Send Code Reference / 发送代码引用
```

选中代码时，会发送类似这样的引用：

```text
@src/example.ts:10-20
```

如果只选中单行，会发送：

```text
@src/example.ts:10
```

没有选中内容时，会发送当前文件引用：

```text
@src/example.ts
```

如果要发送选中的代码内容，选中代码后右键运行：

```text
Pi Terminal Bridge: Send Selected Code / 发送选中代码
```

发送选中代码时，扩展会先添加代码位置引用，再添加选中的代码内容，例如：

````text
@src/example.ts:10-20
```
<selected code>
```
````

这两个命令都会复用仍然打开的 `Pi` 终端。如果当前没有 `Pi` 终端，扩展会在第一编辑器列打开一个新终端，并启动 `piTerminal.command`。

发送的引用和代码只会粘贴到终端输入区，不会自动按 Enter 提交。

选中代码会通过 bracketed paste 序列发送，因此多行代码会作为编辑器内容插入，不会因为换行被当作 Enter 提交。

### 终端字体大小

本扩展使用 VS Code 内置终端。

VS Code 没有提供只设置某一个内置终端实例字体大小的 API。内置终端字体大小由全局设置控制：

```json
{
  "terminal.integrated.fontSize": 14
}
```

Pi Terminal Bridge 不会写入 `terminal.integrated.fontSize` 或其他全局终端设置，因此不会影响普通终端。

### 开发

安装依赖：

```bash
npm install
```

编译：

```bash
npm run compile
```

本地打包为 VSIX：

```bash
vsce package
```

如果本地没有安装 `vsce`，可以使用：

```bash
npx @vscode/vsce package
```

打包完成后会生成类似 `pi-terminal-bridge-0.0.1.vsix` 的文件。可以在 VS Code 中通过 `Extensions: Install from VSIX...` 安装。

## English

Pi Terminal Bridge is a minimal VS Code extension that opens one shared integrated terminal named `Pi` and runs a configurable command.

### Usage

Run this command from the Command Palette:

```text
Pi Terminal Bridge: Open / 打开 Pi 终端
```

You can also click the terminal icon in the editor title bar to open the Pi terminal.

The command opens one shared `Pi` terminal instance. If it is already open, the command focuses the existing terminal instead of creating another one.

If no `Pi` terminal exists, the extension opens a new terminal in the first editor column.

By default, the extension sends this command to the new terminal:

```text
pi
```

You can change it in VS Code settings:

```json
{
  "piTerminal.command": "pi"
}
```

For example:

```json
{
  "piTerminal.command": "echo hello"
}
```

### Send Code to Pi

Pi Terminal Bridge adds editor context menu actions for sending code context to the Pi terminal.

Right-click in an editor and run:

```text
Pi Terminal Bridge: Send Code Reference / 发送代码引用
```

With a selection, this sends a reference like:

```text
@src/example.ts:10-20
```

For a single selected line, it sends:

```text
@src/example.ts:10
```

Without a selection, it sends the current file reference:

```text
@src/example.ts
```

To send selected code text, select code, right-click, and run:

```text
Pi Terminal Bridge: Send Selected Code / 发送选中代码
```

When sending selected code, the extension prefixes the selected content with its code reference, for example:

````text
@src/example.ts:10-20
```
<selected code>
```
````

Both commands reuse the existing `Pi` terminal when it is still open. If no `Pi` terminal exists, the extension opens one in the first editor column and starts `piTerminal.command`.

Sent references and code are pasted into the terminal input without automatically pressing Enter.

Selected code is sent using bracketed paste sequences so multi-line selections are inserted as editor content instead of being treated as Enter key submissions.

### Terminal Font Size

This extension uses VS Code's built-in integrated terminal.

VS Code does not expose an API for setting the font size of only one integrated terminal instance. The built-in terminal font size is controlled by the global setting:

```json
{
  "terminal.integrated.fontSize": 14
}
```

Pi Terminal Bridge does not write to `terminal.integrated.fontSize` or any other global terminal setting, so it will not affect your regular terminals.

### Development

Install dependencies:

```bash
npm install
```

Compile:

```bash
npm run compile
```

Package a local VSIX:

```bash
vsce package
```

If `vsce` is not installed locally, use:

```bash
npx @vscode/vsce package
```

The package command generates a file like `pi-terminal-bridge-0.0.1.vsix`. Install it in VS Code with `Extensions: Install from VSIX...`.
