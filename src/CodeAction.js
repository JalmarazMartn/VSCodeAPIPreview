const transFieldsCaption = 'TransferFields';
const vscode = require('vscode');
const transferFieldsDiagnosticText = 'You can avoid transferfields statement applying break down in fields fixing';
module.exports = {
    GetFieldsCodeAction: function () {
        return GetFieldsCodeAction();
    },
    subscribeToDocumentChanges: function (context, TransferFieldsDiagnostic) { subscribeToDocumentChanges(context, TransferFieldsDiagnostic) },
    refreshDiagnostics: function (doc, TransferFieldsDiagnostic) { refreshDiagnostics(doc, TransferFieldsDiagnostic) }
}
function GetFieldsCodeAction() {
    const FieldsCodeAction = new vscode.CodeAction('Break Down Fields', vscode.CodeActionKind.Refactor);
    //FieldsCodeAction.command = vscode.commands.executeCommand('');    
    FieldsCodeAction.diagnostics = GetDiagnostics();
    return [FieldsCodeAction];
}
function GetDiagnostics() {
    const AppUri = vscode.workspace.workspaceFile;
    return vscode.languages.getDiagnostics(AppUri);
}
function createDiagnostic(doc, lineOfText, lineIndex) {
    // find where in the line of thet the 'emoji' is mentioned
    const index = lineOfText.text.indexOf(transFieldsCaption);

    // create range that represents, where in the document the word is
    const range = new vscode.Range(lineIndex, index, lineIndex, index + transFieldsCaption.length);
    const diagnostic = new vscode.Diagnostic(range, transferFieldsDiagnosticText,
        vscode.DiagnosticSeverity.Information);
    diagnostic.code = 'JAM00001';
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
    TransferFieldsDiagnostic.set(doc.uri,diagnostics);
}