
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
	let disposableBeginTrans = vscode.commands.registerCommand('vscAPIPrev.BeginTrans', function () {
		const translation = require('./src/translations.js');		
		translation.LoadXlfTranslations();
	});
	context.subscriptions.push(disposableBeginTrans);	
	let disposableEditTrans = vscode.commands.registerCommand('vscAPIPrev.EditTrans', function () {
		const translation = require('./src/translations.js');		
		translation.EditTranslation();
	});
	context.subscriptions.push(disposableEditTrans);	

	let disposableSaveTrans = vscode.commands.registerCommand('vscAPIPrev.SaveTrans', function () {
		const translation = require('./src/translations.js');		
		translation.SaveTranslation();
	});
	context.subscriptions.push(disposableSaveTrans);	


	let disposableAll = vscode.commands.registerCommand('vscAPIPrev.AlVarNameAll', function () {
		//Test v1:Record  "S H";
		vscode.window.showInputBox({
			placeHolder: "Are you sure to rename all variables of documents (Y/N)?"
		  }).then(value=>
			{
				if (value.match(/Y/i))
				{
					const rename = require('./src/RenameVars.js');					
					rename.changeAll();
				}
			});		
	});
	context.subscriptions.push(disposableAll);

	let disposableAplicationArea = vscode.commands.registerCommand('vscAPIPrev.AplicationArea', function () {
		const AddAplicationArea = require('./src/AddAplicationArea.js');		

		AddAplicationArea.changeAll();
	});
	context.subscriptions.push(disposableAplicationArea);	

	let SetObjectPrefix = vscode.commands.registerCommand('vscAPIPrev.SetObjectPrefix', function () {
		const PutPrefix = require('./src/PutPrefix.js');		
		PutPrefix.SetPrefix();
		
	});
	context.subscriptions.push(SetObjectPrefix);	


let disposableSelection = vscode.commands.registerCommand('vscAPIPrev.AlVarNameSel', function () {
	// The code you place here will be executed every time your command is executed
	// Display a message box to the user
	//changeSelection2();
	const rename = require('./src/RenameVars.js');
	rename.changeSelection();
});

context.subscriptions.push(disposableSelection);

let disposableAvoidImpWith = vscode.commands.registerCommand('vscAPIPrev.AvoidImpWith', function () {
				const avoidImplicitWith = require('./src/avoidImplicitWith.js');
				avoidImplicitWith.changeAll();
});
context.subscriptions.push(disposableAvoidImpWith);

let disposableMiscPruebas = vscode.commands.registerCommand('vscAPIPrev.MiscPruebas', function () {
	const translations = require('./src/translations.js');				
    const WebviewTranslations = vscode.window.createWebviewPanel(
		'Translations',
		'Translations: Set the target and push -Save- when is done',
		vscode.ViewColumn.One,
		{
		  enableScripts: true
		}
	  );
	  WebviewTranslations.webview.onDidReceiveMessage(
		message => {
		  switch (message.command) {
			case 'Save':
				translations.SaveHtmlTranslation(message.text);
				WebviewTranslations.dispose();
			  return;

			}
        },
        undefined,
        context.subscriptions      
	);
WebviewTranslations.webview.html = translations.GetTranslationsHtml();
});
context.subscriptions.push(disposableMiscPruebas);
}



exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}


module.exports = {
	activate,
	deactivate
}
