const vscode = require('vscode');
module.exports = {
    getCodeActionProvider: async function () {
        GetCodeActionProvider();
    },
    getCodeActionsFromDoc: async function () {
        GetCodeActionsFromDoc();
    },
    getCodeActionsFromDocByLine: async function () {
        GetCodeActionsFromDocByLine();
    },
    getDocCodeLens: async function () {
        getDocCodeLens();
    },
    getCodeActionsFromCurrLine: async function () {
        getCodeActionsFromCurrLine();
    }
}
async function GetCodeActionProvider() {
    const noCodActionsErrLabel = 'There are no available Code Actions in selection.';
    const actualRange = new vscode.Range(vscode.window.activeTextEditor.selection.start,
        vscode.window.activeTextEditor.selection.end);
    /*const actualRange = new vscode.Range(new vscode.Position(vscode.window.activeTextEditor.selection.start.line,0),
        vscode.window.activeTextEditor.selection.end);*/

    const startRange = new vscode.Range(vscode.window.activeTextEditor.selection.start,
        vscode.window.activeTextEditor.selection.start);

    let codeActions = await vscode.commands.executeCommand("vscode.executeCodeActionProvider", vscode.window.activeTextEditor.document.uri,
        actualRange);
    let codeActionsStart = await vscode.commands.executeCommand("vscode.executeCodeActionProvider", vscode.window.activeTextEditor.document.uri,
        startRange);
    if (codeActionsStart) {
        for (let index = 0; index < codeActionsStart.length; index++) {
            pushCodeActionsIfNotExists(codeActionsStart[index], codeActions);
            //codeActions.push(codeActionsStart[index]);
        }
    }
    if (!codeActions) {
        vscode.window.showErrorMessage(noCodActionsErrLabel);
        return
    }
    if (codeActions.length == 0) {
        vscode.window.showErrorMessage(noCodActionsErrLabel);
        return
    }
    let codeActionsTitles = [];
    for (let index = 0; index < codeActions.length; index++) {
        codeActionsTitles.push(codeActions[index].title);
    }
    console.log(codeActions);

    const codeActionTitle = await vscode.window.showQuickPick(codeActionsTitles,
        { placeHolder: 'Choose CodeActions to execute.' });
    if (codeActionTitle == '') {
        return;
    }
    codeActions = codeActions.filter(x => x.title == codeActionTitle);
    execCodeAction(codeActions);
}
function pushCodeActionsIfNotExists(codeActionStart, codeActions) {
    const existingCodeActions = codeActions.filter(x => x.title == codeActionStart.title);
    if (existingCodeActions) {
        if (existingCodeActions.length > 0) {
            return;
        }
    }
    codeActions.push(codeActionStart);
}
async function execCodeAction(codeActions) {
    console.log(codeActions);
    if (codeActions[0].command) {
        console.log(codeActions[0].command.command);
        console.log(codeActions[0].command.arguments);
        let executionsWithArgs = 'vscode.commands.executeCommand(codeActions[0].command.command';
        if (codeActions[0].command.arguments) {
            for (let index = 0; index < codeActions[0].command.arguments.length; index++) {
                executionsWithArgs = executionsWithArgs + ',codeActions[0].command.arguments[' + index.toString() + ']';
            }
            executionsWithArgs = executionsWithArgs + ');';
        }
        await eval(executionsWithArgs);
        return;
    }
    if (codeActions[0].edit)
    {
        applyEditFromCodeActions(codeActions);
    }
    /*await vscode.commands.executeCommand(CodeActions[0].command.command,
        CodeActions[0].command.arguments[0],
        CodeActions[0].command.arguments[1],
        CodeActions[0].command.arguments[2],
        CodeActions[0].command.arguments[3],
        CodeActions[0].command.arguments[4]
        );*/
}
async function GetCodeActionsFromDoc() {
    const document = vscode.window.activeTextEditor.document;
    const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount, 0));
    const definition = await vscode.commands.executeCommand('vscode.executeCodeActionProvider', document.uri, range);
    //console.log(definition);
    for (let i = 0; i < definition.length; i++) {
        const CodeAction = definition[i];
        console.log(CodeAction);
    }
}
async function GetCodeActionsFromDocByLine() {
    const document = vscode.window.activeTextEditor.document;
    //console.log(definition);
    for (let i = 0; i < document.lineCount; i++) {
        await ShowLineActions(i, document);
    }
}
async function getCodeActionsFromCurrLine() {
    const document = vscode.window.activeTextEditor.document;
    //console.log(definition);

    await ShowLineActions(vscode.window.activeTextEditor.selection.start.line, document);
}
async function getDocCodeLens() {
    const document = vscode.window.activeTextEditor.document;
    const docCodeLens = await vscode.commands.executeCommand('vscode.executeCodeLensProvider', document.uri, 1000);
    for (let index = 0; index < docCodeLens.length; index++) {
        console.log(docCodeLens[index]);
    }
}
async function ShowLineActions(i, document) {
    const range = new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, 1000));
    const definition = await vscode.commands.executeCommand('vscode.executeCodeActionProvider', document.uri, range);
    if (definition) {
        if (definition.length !== 0) {
            console.log(i);
            console.log(definition);
        }
    }
}
async function applyEditFromCodeActions(codeActions)
{
    vscode.workspace.applyEdit(codeActions[0].edit);
}