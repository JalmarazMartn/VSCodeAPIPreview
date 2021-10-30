
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscAPIPrev" is now active!');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json



	let disposableMiscPruebas = vscode.commands.registerCommand('vscAPIPrev.MiscPruebas', function () {
		const Pruebas = require('./src/Pruebas.js');
		Pruebas.Pruebas(context);
	});
	context.subscriptions.push(disposableMiscPruebas);

	let disposableMiscPruebas2 = vscode.commands.registerCommand('vscAPIPrev.MiscPruebas2', function () {
		const Pruebas = require('./src/Pruebas.js');
		Pruebas.Pruebas2();
	});
	context.subscriptions.push(disposableMiscPruebas2);

	const transferFieldsDiagnostics = vscode.languages.createDiagnosticCollection("transferFields");
	context.subscriptions.push(transferFieldsDiagnostics);
	const CodeActions = require('./src/CodeAction.js');
	CodeActions.subscribeToDocumentChanges(context, transferFieldsDiagnostics);

	let fixProvider = {
		provideCodeActions: 
		function () {
			const CodeActions = require('./src/CodeAction.js');
			return CodeActions.GetFieldsCodeAction();		
		}
	};
	console.log('retorno 2');	
	console.log(fixProvider);	
	context.subscriptions.push(vscode.languages.registerCodeActionsProvider('al',fixProvider));
	//context.subscriptions.push(vscode.languages.registerCodeActionsProvider('al',CodeActions.GetFieldsCodeAction()));

}

// @ts-ignore
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }


module.exports = {
	// @ts-ignore
	activate,
	deactivate
}
