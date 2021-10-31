const transFieldsCaption = 'TransferFields';
const transFieldsCode = 'JAM00001';
const vscode = require('vscode');
const transferFieldsDiagnosticText = 'You can avoid transferfields statement applying break down in fields fixing';
class transferFieldsClass
{
	constructor()
	{
		this.provideCodeActions = function (document,range,context,token) {
			return context.diagnostics
			.filter(diagnostic => diagnostic.code === transFieldsCode)
			.map(diagnostic => this.createCommandCodeAction(diagnostic));
		}
	}
	createCommandCodeAction(diagnostic) {
		const action = new vscode.CodeAction('Break down fields', vscode.CodeActionKind.QuickFix);
		//action.command = { command: COMMAND, title: 'Learn more about transferfields', tooltip: 'This will open the transferfields page.' };
		action.diagnostics = [diagnostic];
		action.isPreferred = true;
		return action;
	}
};
module.exports = {
    transferFieldsClass,
    subscribeToDocumentChanges: function (context, TransferFieldsDiagnostic) { subscribeToDocumentChanges(context, TransferFieldsDiagnostic) },
    refreshDiagnostics: function (doc, TransferFieldsDiagnostic) { refreshDiagnostics(doc, TransferFieldsDiagnostic) }
}

function createDiagnostic(doc, lineOfText, lineIndex) {
    // find where in the line of thet the 'emoji' is mentioned
    const index = lineOfText.text.indexOf(transFieldsCaption);

    // create range that represents, where in the document the word is
    const range = new vscode.Range(lineIndex, index, lineIndex, index + transFieldsCaption.length);
    const diagnostic = new vscode.Diagnostic(range, transferFieldsDiagnosticText,
        vscode.DiagnosticSeverity.Information);
    diagnostic.code = transFieldsCode;
    return diagnostic;
}
function subscribeToDocumentChanges(context, TransferFieldsDiagnostic) {
    if (vscode.window.activeTextEditor) {
        refreshDiagnostics(vscode.window.activeTextEditor.document, TransferFieldsDiagnostic);
    }
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                refreshDiagnostics(editor.document, TransferFieldsDiagnostic);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, TransferFieldsDiagnostic))
    );
    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => TransferFieldsDiagnostic.delete(doc.uri))
    );
}

function refreshDiagnostics(doc, TransferFieldsDiagnostic) {
    let diagnostics = [];

    for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
        const lineOfText = doc.lineAt(lineIndex);
        if (lineOfText.text.includes(transFieldsCaption)) {
            diagnostics.push(createDiagnostic(doc, lineOfText, lineIndex));
        }
    }
    TransferFieldsDiagnostic.set(doc.uri, diagnostics);
}