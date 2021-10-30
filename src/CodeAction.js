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
    let FieldsCodeActions = [];
    const AppUri = vscode.workspace.workspaceFile;
    const AppDiagnostics = vscode.languages.getDiagnostics(AppUri);
    let TransferFieldsDiagnostics = [];
    for (let i = 0; i < AppDiagnostics.length; i++) {
        for (let j = 0; j < AppDiagnostics[i][1].length; j++) {
            if (AppDiagnostics[i][1][j].message == transferFieldsDiagnosticText) {
                TransferFieldsDiagnostics.push(AppDiagnostics[i][1][j]);                
                //
                const FieldsCodeAction = new vscode.CodeAction('Break Down Fields', vscode.CodeActionKind.QuickFix);
                //FieldsCodeAction.command = vscode.commands.executeCommand('');    
                FieldsCodeAction.diagnostics = AppDiagnostics[i][1][j];
                FieldsCodeAction.diagnostics.push(AppDiagnostics[i][1][j]);
                FieldsCodeActions.push(FieldsCodeAction);                                                
            }
        }
    }
    return FieldsCodeActions;
}
function GetDiagnostics() {
    const AppUri = vscode.workspace.workspaceFile;
    const AppDiagnostics = vscode.languages.getDiagnostics(AppUri);
    let TransferFieldsDiagnostics = [];
    for (let i = 0; i < AppDiagnostics.length; i++) {
        for (let j = 0; j < AppDiagnostics[i][1].length; j++) {
            if (AppDiagnostics[i][1][j].message == transferFieldsDiagnosticText) {
                TransferFieldsDiagnostics.push(AppDiagnostics[i][1][j]);                
            }
        }
    }
    return TransferFieldsDiagnostics;
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
    TransferFieldsDiagnostic.set(doc.uri, diagnostics);
}