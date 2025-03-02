
const vscode = require('vscode');
let globalActions = [];
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
    },
    logGlobalActions: function () {
        console.log('golbal actions:');
        consoleLogCodeActions(globalActions);
        globalActions = [];
    },
    applyCodeActionWithFilter: function () {
        applyCodeActionWithFilter('Make variable global (AL CodeActions)', 'label');
        //applyCodeActionWithFilter(" Convert the 'with' statement to fully qualified statements.",'with');
    },
    getElementFromJson: function (jsonObject, elementName) {
        return getElementFromJson(jsonObject, elementName);
    }
}
async function GetCodeActionProvider() {
    const noCodActionsErrLabel = 'There are no available Code Actions in selection.';
    const actualRange = new vscode.Range(vscode.window.activeTextEditor.selection.start,
        vscode.window.activeTextEditor.selection.end);
    /*const actualRange = new vscode.Range(new vscode.Position(vscode.window.activeTextEditor.selection.start.line,0),
        vscode.window.activeTextEditor.selection.end);*/

    const startRange = new vscode.Range(vscode.window.activeTextEditor.selection.start,
        vscode.window.activeTextEditor.selection.end);

    let codeActions = await vscode.commands.executeCommand("vscode.executeCodeActionProvider", vscode.window.activeTextEditor.document.uri,
        actualRange);
    let codeActionsStart = await vscode.commands.executeCommand("vscode.executeCodeActionProvider", vscode.window.activeTextEditor.document.uri,
        startRange);
    if (codeActionsStart) {
        for (let index = 0; index < codeActionsStart.length; index++) {
            pushCodeActionIfNotExists(codeActionsStart[index], codeActions);
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
    //console.log(codeActions);
    consoleLogCodeActions(codeActions);

    const codeActionTitle = await vscode.window.showQuickPick(codeActionsTitles,
        { placeHolder: 'Choose CodeActions to execute.' });
    if (codeActionTitle == '') {
        return;
    }
    codeActions = codeActions.filter(x => x.title == codeActionTitle);
    execCodeAction(codeActions);
}
function pushCodeActionIfNotExists(newCodeAction, codeActions) {
    pushGlobalCodeActionsIfNotExists(newCodeAction);
    const existingCodeActions = codeActions.filter(x => x.title == newCodeAction.title);
    if (existingCodeActions) {
        if (existingCodeActions.length > 0) {
            return;
        }
    }
    codeActions.push(newCodeAction);

}
function pushGlobalCodeActionsIfNotExists(newCodeAction) {
    const existingCodeActions = globalActions.filter(x => x.title == newCodeAction.title);
    if (existingCodeActions) {
        if (existingCodeActions.length > 0) {
            return;
        }
    }
    globalActions.push(newCodeAction);

}
async function execCodeAction(codeActions) {
    //console.log(codeActions);
    if (codeActions[0].command) {
        //console.log(codeActions[0].command.command);
        //console.log(codeActions[0].command.arguments);
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
    if (codeActions[0].edit) {
        await applyEditFromCodeActions(codeActions);
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
    const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount - 1, 0));
    const definition = await vscode.commands.executeCommand('vscode.executeCodeActionProvider', document.uri, range);
    let codeActions = [];
    //console.log(definition);
    for (let i = 0; i < definition.length; i++) {
        const CodeAction = definition[i];
        //console.log(CodeAction);
        pushCodeActionIfNotExists(CodeAction, codeActions);
    }
    consoleLogCodeActions(codeActions);

}
async function GetCodeActionsFromDocByLine() {
    const document = vscode.window.activeTextEditor.document;
    //aqui
    //Da igual quitar el foco del documento
    //A través del rango se puede saber el scope de la action. TextRange dentro de los argumentos del command
    //console.log(definition);
    let codeActions = [];
    console.log(Date());
    for (let currline = 0; currline < document.lineCount; currline++) {
        /*const firstPos = 0;
        const finalPos = 1000;//result = 23. Tarda 13-15 segundos*/

        /*const firstPos = 0;
        const finalPos = document.lineAt(currline).rangeIncludingLineBreak.end.character;;//result = 9. Tarda 4-5 segundos incluye make variable global*/

        /*const firstPos = document.lineAt(currline).firstNonWhitespaceCharacterIndex;
        const finalPos = 1000;//result = 23. Tarda 12-15 segundos. Falta el make variable global*/

        /*const firstPos = document.lineAt(currline).firstNonWhitespaceCharacterIndex;
        const finalPos = firstPos;//result = 21*/

        /*const firstPos = document.lineAt(currline).rangeIncludingLineBreak.start.character;                
        const finalPos = document.lineAt(currline).rangeIncludingLineBreak.end.character;//result=9 5-6 segundos*/

        /*const firstPos = document.lineAt(currline).firstNonWhitespaceCharacterIndex;
        const finalPos = document.lineAt(currline).rangeIncludingLineBreak.end.character;//result=21?4-5 segundos*/

        //////////aqui////////////////////
        //await pushActionInRangeIfNotExists(currline, document, codeActions,0,1000);//23


        //***combinacion que consigue todos los diagnosticos. 24
        //await pushActionInRangeIfNotExists(currline, document, codeActions, 0, document.lineAt(currline).rangeIncludingLineBreak.end.character); //21       
        //await pushActionInRangeIfNotExists(currline, document, codeActions, document.lineAt(currline).firstNonWhitespaceCharacterIndex, 1000);//23
        //***fin combi
        //nueva combi de todos los diagnosticos
        await pushActionInRangeIfNotExists(currline, document, codeActions, 0, document.lineAt(currline).firstNonWhitespaceCharacterIndex);
        await pushActionInRangeIfNotExists(currline, document, codeActions, document.lineAt(currline).firstNonWhitespaceCharacterIndex,document.lineAt(currline).text.length);//
        //Fin nueva combi
        //await pushActionInRangeIfNotExists(currline, document, codeActions, document.lineAt(currline).firstNonWhitespaceCharacterIndex, document.lineAt(currline).firstNonWhitespaceCharacterIndex);

        //await pushActionInRangeIfNotExists(currline, document, codeActions,document.lineAt(currline).rangeIncludingLineBreak.start.character,document.lineAt(currline).rangeIncludingLineBreak.end.character);

        /*await pushActionInRangeIfNotExists(currline, document, codeActions,document.lineAt(currline).firstNonWhitespaceCharacterIndex,document.lineAt(currline).rangeIncludingLineBreak.end.character);
        */

    }
    console.log(Date());
    consoleLogCodeActions(codeActions);
    //for (let i = 0; i < document.lineCount; i++) {
    //    await ShowLineActions(i, document);
    //}
    console.log('global actions');
    consoleLogCodeActions(globalActions);
}
async function pushActionInRangeIfNotExists(currline, document, codeActions, firstPos, finalPos) {
    const range = new vscode.Range(new vscode.Position(currline, firstPos), new vscode.Position(currline, finalPos));
    const definition = await vscode.commands.executeCommand("vscode.executeCodeActionProvider", document.uri, range);
    for (let index = 0; index < definition.length; index++) {
        const CodeAction = definition[index];
        pushCodeActionIfNotExists(CodeAction, codeActions);
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
async function applyEditFromCodeActions(codeActions) {    
    for (let index = 0; index < codeActions.length; index++) {
        const element = codeActions[index];
            console.log(element.edit.c[0].edit);
            console.log(element.edit.c[1].edit);
            console.log(element.edit.c[0].edit.newText);
            console.log(element.edit.c[1].edit.newText);
    }
    await vscode.workspace.applyEdit(codeActions[0].edit);
}
function consoleLogCodeActions(codeActions) {
    console.log('codeActions.length: ' + codeActions.length.toString());
    console.log(codeActions);
    for (let index = 0; index < codeActions.length; index++) {
        if (index == 0) {
            console.log('title;kind;command');
        }
        let commnadLogOutput = codeActions[index].title + ';';
        if (codeActions[index].kind) {
            commnadLogOutput = commnadLogOutput + codeActions[index].kind.value;
        }
        else {
            commnadLogOutput = commnadLogOutput + 'noKind';
        }
        commnadLogOutput = commnadLogOutput + ';';
        if (codeActions[index].command) {
            commnadLogOutput = commnadLogOutput + codeActions[index].command.command;
        }
        else {
            commnadLogOutput = commnadLogOutput + 'noCommand';
        }
        console.log(commnadLogOutput);
    }
}
async function applyCodeActionWithFilter(codeActionTitle = '', searchExpresion = '') {
    const regex = new RegExp(searchExpresion, 'mgi');
    const document = vscode.window.activeTextEditor.document;    
    for (let currline = 0; currline < document.lineCount; currline++) {
        //console.log(document.lineAt(currline).text);
        const patternPosition = document.lineAt(currline).text.search(regex)
        if (document.lineAt(currline).text.search(regex) >= 0) {
            let codeActions = []            
            //original
            //await pushActionInRangeIfNotExists(currline, document, codeActions, 0, document.lineAt(currline).rangeIncludingLineBreak.end.character); //21       
            //await pushActionInRangeIfNotExists(currline, document, codeActions, document.lineAt(currline).firstNonWhitespaceCharacterIndex, 1000);//23       
            //solo ultimo
            //await pushActionInRangeSubstitute(currline, document, codeActions, 0, document.lineAt(currline).rangeIncludingLineBreak.end.character,codeActionTitle); //21       
            //await pushActionInRangeSubstitute(currline, document, codeActions, document.lineAt(currline).firstNonWhitespaceCharacterIndex, 1000,codeActionTitle);//23       
            //nuevo
            await pushActionInRangeSubstitute(currline, document, codeActions, patternPosition, patternPosition,codeActionTitle); 
            const existingCodeActions = codeActions.filter(x => x.title == codeActionTitle);            
            if (existingCodeActions) {
                if (existingCodeActions.length > 0) {                    
                    await execCodeAction(existingCodeActions);
                }
            }
        }
    }
}
async function pushActionInRangeSubstitute(currline, document, codeActions, firstPos, finalPos,codeActionTitle = '') {
    const range = new vscode.Range(new vscode.Position(currline, firstPos), new vscode.Position(currline, finalPos));
    const definition = await vscode.commands.executeCommand("vscode.executeCodeActionProvider", document.uri, range);    
    for (let index = 0; index < definition.length; index++) {
        const CodeAction = definition[index];
        if (codeActionTitle == CodeAction.title)
        {
            pushCodeActionSubstitute(CodeAction, codeActions);
        }
    }
}
function pushCodeActionSubstitute(newCodeAction, codeActions) {
    let existingAction = -1;
    /*for (let index = 0; index < codeActions.length; index++) {
        const element = codeActions[index];
        if (element.title == newCodeAction.title)
            {
                existingAction = index;
            }
    }
    if (existingAction > -1)
    {
        codeActions.slice(existingAction,1);
    }*/
    codeActions.push(newCodeAction);
}
function getElementFromJson(jsonObj, elementName) {
    for (let key in jsonObj) {
        if (key === elementName) {
            return jsonObj[key];
        }
        if (typeof jsonObj[key] === 'object' && jsonObj[key] !== null) {
            let result = getElementFromJson(jsonObj[key], elementName);
            if (result) {
                return result;
            }
        }
    }
    return null; // Element not found
}