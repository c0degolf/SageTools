import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('SageTools.runSage', () => {
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
            vscode.window.showWarningMessage("^: power\n^^: XOR");
        }

        // Execute the SageMath file using the command line in the new terminal
        terminal.sendText(`cd ${directory} && sage '${fileName}' ; rm ${fileName}.py`);        
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}