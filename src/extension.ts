import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let SageRun = vscode.commands.registerCommand('SageTools.run', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No editor is active');
            return;
        }

        let filePath = editor.document.fileName;
        if (!filePath.endsWith('.sage')) {
            vscode.window.showInformationMessage('Not a Sage file');
            return;
        }

        // Extract the file name from the file path
		let directory = path.dirname(filePath);
        let fileName = path.basename(filePath);
		let baseName = fileName.substring(0, fileName.lastIndexOf('.'));
        
        const config = vscode.workspace.getConfiguration('SageTools');
        const warnSyntaxDifferences = config.get<boolean>('warnSyntaxDifferences');

        let terminal: vscode.Terminal | undefined;
        vscode.window.terminals.forEach(term => {
            if (term.name === `Sage: ${baseName}`) {
                terminal = term;
            }
        });

        // If Sage terminal is not found, execute the file there
        // Create a new terminal with the file name in the title
		if (!terminal) {
            terminal = vscode.window.createTerminal(`Sage: ${baseName}`);
        };
        terminal.show();

        if (warnSyntaxDifferences) {
            vscode.window.showInformationMessage(`^: Power\n^^: XOR`);
        }

        // Execute the SageMath file using the command line in the new terminal
        terminal.sendText(`cd ${directory} && sage '${fileName}' ; rm ${fileName}.py`);        
    });

    context.subscriptions.push(SageRun);

    let SageCompile = vscode.commands.registerCommand('SageTools.compile', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No editor is active');
            return;
        }

        let filePath = editor.document.fileName;
        if (!filePath.endsWith('.sage')) {
            vscode.window.showInformationMessage('Not a Sage file');
            return;
        }

        // Extract the file name from the file path
		let directory = path.dirname(filePath);
        let fileName = path.basename(filePath);
		let baseName = fileName.substring(0, fileName.lastIndexOf('.'));
        
        const config = vscode.workspace.getConfiguration('SageTools');
        const warnSyntaxDifferences = config.get<boolean>('warnSyntaxDifferences');

        let terminal: vscode.Terminal | undefined;
        vscode.window.terminals.forEach(term => {
            if (term.name === `Sage: ${baseName}`) {
                terminal = term;
            }
        });

        // If Sage terminal is not found, execute the file there
        // Create a new terminal with the file name in the title
		if (!terminal) {
            terminal = vscode.window.createTerminal(`Sage: ${baseName}`);
        };
        terminal.show();

        if (warnSyntaxDifferences) {
            vscode.window.showInformationMessage(`^: Power\n^^: XOR`);
        }

        // Execute the SageMath file using the command line in the new terminal
        terminal.sendText(`cd ${directory} && sage -python $(sage -root)/src/bin/sage-preparse '${fileName}'`);        
    });

    context.subscriptions.push(SageCompile);

    let SageComment = vscode.commands.registerCommand('SageTools.comment', () => {
        const editor = vscode.window.activeTextEditor;
    
        if (editor) {
            const document = editor.document;
            const selections = editor.selections;
    
            editor.edit(editBuilder => {
            let shouldAddComment = false;
    
            // 선택된 모든 줄을 검사하여 하나라도 주석이 없는 줄이 있는지 확인
            selections.forEach(selection => {
                for (let i = selection.start.line; i <= selection.end.line; i++) {
                    const line = document.lineAt(i);
                    const text = line.text;
                    if (!text.trim().startsWith('#')) {
                        shouldAddComment = true;
                        break;
                    }
                }
            });
    
            // 모든 선택된 줄에 대해 주석을 추가 또는 제거
            selections.forEach(selection => {
                for (let i = selection.start.line; i <= selection.end.line; i++) {
                    const line = document.lineAt(i);
                    const text = line.text;
    
                    if (shouldAddComment) {
                        // 주석이 없는 줄이 하나라도 있다면 모든 줄에 주석 추가
                        editBuilder.insert(line.range.start, '# ');
                    } else {
                        // 모든 줄이 주석이라면 주석 제거
                        const commentIndex = text.indexOf('#');
                        editBuilder.delete(new vscode.Range(
                            new vscode.Position(i, commentIndex),
                            new vscode.Position(i, commentIndex + 2)
                        ));
                    }
                }});
            });
        }
    });
    
    context.subscriptions.push(SageComment);
}

export function deactivate() {}