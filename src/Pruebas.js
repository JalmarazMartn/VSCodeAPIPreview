const { request } = require('http');
const vscode = require('vscode');
const diagnostics = require('./diganostics.js');
const { forEachChild } = require('typescript');
var subscription = vscode.workspace.onDidChangeTextDocument(HandleDocumentChanges);
subscription.dispose();
//let ALObjects = [];
let ALObjects = [];
let sourceControl = {};
let resourceGroup = {};
module.exports = {
    Pruebas: async function (context) {
        //const translation = require('./translations.js');		
        //translation.EditHtmlTranslation(context);

        //GetWorkSpaceSymbols();
        //GetDocumentSymbols();
        //GetDocumentVariables();
        //GetDocumentProcedures();
        //getLocalVariables();
        //GetSymbolsInfo();
        //ExecuteCommWithUriAndRange('vscode.provideDocumentRangeSemanticTokens');
        //ExecuteCommWithUri('vscode.provideDocumentSemanticTokens');
        //ExecuteDefinitionProvider();
        //ExecuteCommWithUriAndPos('vscode.executeHoverProvider');
        //GetExtensionConf();
        //GetExtensions();
        //SelectExtension();
        //GetALExtension();
        //GetALObjects();
        //ShowQuickPick();        
        //CatchDocumentChanges();
        //ShowALObjectsOuputChannel();
        //GetDiagnostics();
        //ReadLargeFile();        
        //ExecuteCommWithUriAndPos('git.commit');
        //ExcuteTask('echoDir');
        //executeDocumentSymbolProvider();
        //executeDefinitionProvider();        
        //applyCodeActionWithFilter();  aqui
        //await GetCodeActionsFromDoc();
        //await GetCodeActionsFromDocByLine();
        //logGlobalActions();
        //getCodeActionsFromCurrLine();
        //GetCodeActionProvider();
        //diagnostics.getSelectionDiagnostics();
        //consoleDoc();
        //ExecuteCommandWithParam('interactive.open','https://regex101.com/');
        //GetActiveTerminal();
        //GetAPIExtension('vscode.git');
        GetGitAPIExtension();
        //getPrevVersionwithQuikDiff();
        //getDocCodeLens();
    },
    GetALObjects: async function () {
        return (await GetALObjects());
    },
    Pruebas2: async function () {
        StopCatchDocumentChanges();
    }

}
async function GetSymbolsInfo() {
    await ExecuteCommWithUriAndPos('vscode.executeDocumentHighlights');
    await ExecuteCommWithUriAndPos('vscode.executeDefinitionProvider');
    await ExecuteCommWithUriAndPos('vscode.executeDeclarationProvider');
    await ExecuteCommWithUriAndPos('vscode.executeTypeDefinitionProvider');
    await ExecuteCommWithUriAndPos('vscode.executeImplementationProvider');
    await ExecuteCommWithUriAndPos('vscode.executeReferenceProvider');
}
async function ExecuteDefinitionProvider() {
    console.log('vscode.executeDefinitionProvider');
    let document = vscode.window.activeTextEditor.document;
    let locations = await vscode.commands.executeCommand('vscode.executeDefinitionProvider',
        document.uri, vscode.window.activeTextEditor.selection.start);
    // console.log(await document.lineAt(vscode.window.activeTextEditor.selection.start.line).text);
    if (locations) {
        //console.log(locations[0].uri);
        let doc = await vscode.workspace.openTextDocument(locations[0].uri);

        console.log(doc.lineAt(locations[0].range.start.line).text);
        console.log(doc.getText(locations[0].range));
        console.log(doc.getText());
        console.log(locations);
    }

}
async function GetWorkSpaceSymbols() {
    //vscode.commands.executeCommand("vscode.executeWorkspaceSymbolProvider","Whse. Asistant Mngt").then(
    //    function (symbols) {
    //        console.log('symbols');
    //    }
    //);
    const GetSymbols = require('./GetSymbols.js');
    GetSymbols.GetWorkSpaceSymbols();

}
async function GetDocumentSymbols() {
    const GetSymbols = require('./GetSymbols.js');
    GetSymbols.PrintDocumentSymbols();
}

async function ExecuteCommWithUriAndPos(CommandToExec = '') {
    console.log('Command:' + CommandToExec);
    let document = vscode.window.activeTextEditor.document;
    let locations = await vscode.commands.executeCommand(CommandToExec,
        document.uri, vscode.window.activeTextEditor.selection.start);
    // console.log(await document.lineAt(vscode.window.activeTextEditor.selection.start.line).text);
    if (locations) {
        console.log(locations);
    }
}
async function ExecuteCommWithUriAndRange(CommandToExec = '') {
    console.log('Command:' + CommandToExec);
    let document = vscode.window.activeTextEditor.document;
    let locations = await vscode.commands.executeCommand(CommandToExec,
        document.uri, vscode.window.activeTextEditor.selection);
    // console.log(await document.lineAt(vscode.window.activeTextEditor.selection.start.line).text);
    if (locations) {
        console.log(locations);
    }
}
async function ExecuteCommWithUri(CommandToExec = '') {
    console.log('Command:' + CommandToExec);
    let document = vscode.window.activeTextEditor.document;
    let locations = await vscode.commands.executeCommand(CommandToExec,
        document.uri);
    // console.log(await document.lineAt(vscode.window.activeTextEditor.selection.start.line).text);
    if (locations) {
        console.log(locations);
    }
}
async function ExecuteCommandWithParam(CommandToExec = '', passedParam = '') {
    console.log('Command:' + CommandToExec);
    let result = await vscode.commands.executeCommand(CommandToExec, passedParam);
    console.log(result);
}

function GetExtensionConf() {
    console.log(GetExtensionConfValue('JSONTranslationFilename'));
    console.log(GetExtensionConfValue('CharsFrom'));
    console.log(GetExtensionConfValue('CharsTo'));
}
function GetExtensionConfValue(KeyToReturn = '') {
    //const ExtConf = vscode.workspace.getConfiguration('', vscode.workspace.workspaceFolders[0].uri);	
    console.log(KeyToReturn);
    const ExtConf = vscode.workspace.getConfiguration('');
    if (ExtConf) {
        return (ExtConf.get(KeyToReturn));
    }
}
async function GetExtensions() {
    let AllExtensions = vscode.extensions.all;
    console.log(AllExtensions.length);
    const ExtChannel = await vscode.window.createOutputChannel('Extensions');
    ExtChannel.show();
    for (var i = 0; i < AllExtensions.length; i++) {
        let Extension = AllExtensions[i];
        ExtChannel.append(JSON.stringify(Extension));
        await GetAPIExtension(Extension.id);
    }
}
async function GetAPIExtension(ExtensionId = '') {
    try {
        const Extension = vscode.extensions.getExtension(ExtensionId);
        if (!(Extension.isActive)) { Extension.activate }
        const ExtAPI = Extension.exports;
        console.log(Extension);
        if (ExtAPI) {
            console.log('Extension =========>' + ExtensionId);
            console.log(ExtAPI);
            const APIObject1 = await ExtAPI.activeDocumentSymbols;
            console.log('activeDocumentSymbols:');
            console.log(APIObject1);
            console.log('activeDocumentSymbols: Methods');
            console.log(getMethods(APIObject1));
        }
    }
    catch (error) {
        //console.log(error);
        return;
    }
}
async function GetGitAPIExtension() {
    try {
        const gitExtension = vscode.extensions.getExtension('vscode.git').exports;
        const gitAPI = gitExtension.getAPI(1);
        if (gitAPI) {
            /*console.log('Extension =========>' + gitExtension);
            console.log(gitAPI);*/
            const APIObject1 = await gitAPI.activeDocumentSymbols;
            /*console.log('activeDocumentSymbols:');
            console.log(APIObject1);
            console.log('activeDocumentSymbols: Methods');
            console.log(getMethods(gitAPI));*/
            //console.log(getMethods(APIObject1));
            let repository = gitAPI.getRepository(vscode.window.activeTextEditor.document.uri);
            /*console.log('repository');
            console.log(repository);*/
            //
            const currentDiferences = await repository.diffWithHEAD();
            console.log(currentDiferences);
            const originalContent = await getFileContentAtUri(currentDiferences[0].originalUri);
            const modifiedContent = await getFileContentAtUri(currentDiferences[0].uri);
            console.log(`--- Diff for file: ${vscode.workspace.asRelativePath(currentDiferences[0].uri)} ---`);
            console.log("Original Content (Parent Commit):", originalContent.substring(0, 300) + '...');
            console.log("Modified Content (Last Commit):", modifiedContent.substring(0, 300) + '...');

            const commits = await repository.log({ maxCount: 5 });

            if (commits.length > 0) {
                //let commitInfo = `Last ${commits.length} commits in ${repository.rootUri.name}:\n\n`;
                commits.forEach((commit, index) => {
                    //const date = new Date(commit.timestamp * 1000).toLocaleDateString();
                    //commitInfo += `${index + 1}. Hash: ${commit.hash.substring(0, 7)}\n   Author: ${commit.authorName}\n   Date: ${date}\n   Message: ${commit.message.split('\n')[0]}\n\n`;
                    /*console.log(`${index + 1}. Hash: ${commit.hash.substring(0, 7)} Author: ${commit.authorName} Message: ${commit.message.split('\n')[0]}`);
                    console.log(commit);*/
                    //https://share.google/aimode/chXxo9aEf8LMcQxXt 
                });                  
            }
            const lastCommit = commits[0];
            const parentHash = lastCommit.parents[0];
            const changes = await repository.diffBetween(parentHash, lastCommit.hash);

            // Store the results in variables and process them
            let changedFilesList = [];
            let detailedOutput = `Commit Hash: ${lastCommit.hash}\nMessage: ${lastCommit.message}\n\nChanged Files:\n`;

            for (const change of changes) {
                const statusText = change.status.toString(); // Convert numeric status to string
                const fileName = vscode.workspace.asRelativePath(change.uri, false);
                //console.log(`File: ${fileName}, Status: ${statusText}`);
                //console.log(change);
                const originalContent = await getFileContentAtUri(change.originalUri);
                const modifiedContent = await getFileContentAtUri(change.uri);

                console.log(`--- Diff for file: ${vscode.workspace.asRelativePath(change.uri)} ---`);
                console.log("Original Content (Parent Commit):", originalContent.substring(0, 100) + '...');
                console.log("Modified Content (Last Commit):", modifiedContent.substring(0, 100) + '...');

                changedFilesList.push(fileName);                
                detailedOutput += `- [${statusText}] ${fileName}\n`;

            }            
            //
            /*let diffs = await repository.getDiff();
            console.log('diffs');
            for (let i = 0; i < diffs.length; i++) {
                console.log(diffs[i]);
            }*/
        }
    }
    catch (error) {
        console.log(error);
        return;
    }
}
async function getFileContentAtUri(uri) {
    try {
        // This relies on the built-in Git extension providing content for its custom URIs (like `git://...`)
        const document = await vscode.workspace.openTextDocument(uri);
        return document.getText();
    } catch (error) {
        console.error(`Failed to get content for URI: ${uri.toString()}`, error);
        return undefined;
    }
}        
const getMethods = (obj) => {
    let properties = new Set()
    let currentObj = obj
    do {
        Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
    return [...properties.keys()].filter(item => typeof obj[item] === 'function')
}
async function GetALObjects() {
    if (ALObjects.length > 0) {
        return ALObjects
    }
    const ALExtension = vscode.extensions.getExtension('martonsagi.al-object-designer');
    if (!(ALExtension.isActive)) { await ALExtension.activate }
    const ALAPI = await ALExtension.exports;
    if (ALAPI) {
        ALObjects = await ALAPI.ALObjectCollector._getData();
        console.log(ALObjects.length);
        // Object.freeze(ALObjects);       
    }
    return ALObjects;
}
async function ShowALObjectsOuputChannel() {
    const OutputChannel = vscode.window.createOutputChannel(`Output Channel`);
    OutputChannel.appendLine('Getting objects');
    const LocalObjects = await GetALObjects();
    OutputChannel.appendLine('Objects: ' + LocalObjects.length);
    OutputChannel.show();
}
async function ReadLargeFile() {
    const options = {
        canSelectMany: false,
        openLabel: 'Open',
        title: 'Test large file',
        filters: {
            'xlf': ['xlf'],
        }
    };

    let fileUri = await vscode.window.showOpenDialog(options);
    const PromiseDlg = await vscode.window.showWarningMessage('Are you run a long time process with the file?', { modal: false }, 'Yes', 'No');
    if (PromiseDlg == 'No') {
        vscode.window.showInformationMessage('Process cancelled');
        return;
    }
    vscode.window.showInformationMessage('Processing file:' + fileUri[0].fsPath, { modal: false }, 'Got it');
    var fs = require('fs'),
        readline = require('readline');

    var rd = readline.createInterface({
        input: fs.createReadStream(fileUri[0].fsPath)
    });
    let CountLines = 0;
    rd.on('line', function (line) {
        CountLines = CountLines + 1;
        if ((CountLines % 10000) == 0) {
            console.log(CountLines);
            console.log(line);
        }
    });
    rd.on('close', function () {
        console.log('Final');
        console.log(CountLines);
        vscode.window.showInformationMessage('Ending file lines:' + CountLines.toString());
    }
    );
}
function ShowQuickPick() {
    vscode.window.showQuickPick(['Tonto', 'Gusano'],
        { placeHolder: 'Elige entre ser tonto o gusano' }).then(value => {
            vscode.window.showInformationMessage('Vas a ser ' + value + ' todo el dia');
        });
}
function CatchDocumentChanges() {
    // start listening
    subscription = vscode.workspace.onDidChangeTextDocument(HandleDocumentChanges);
    // do more stuff

    //subscription.dispose(); // stop listening
}
function HandleDocumentChanges(event) {
    console.log(event);
    if (event.contentChanges[0].text.charCodeAt(0) == 13) {
        console.log('Intro');
        console.log(event.contentChanges[0].range.end);
        const WSEdit = new vscode.WorkspaceEdit;
        const NewPosition = new vscode.Position(event.contentChanges[0].range.end.line + 1, 0);
        WSEdit.insert(event.document.uri, NewPosition, 'v1: ');
        vscode.workspace.applyEdit(WSEdit);
    }

    //subscription.dispose(); // stop listening
}
function StopCatchDocumentChanges() {
    subscription.dispose();
}
function ExcuteTask(TaskLabel = '') {
    vscode.commands.executeCommand('workbench.action.tasks.runTask', TaskLabel);
}
function executeDocumentHighlights() {
    const document = vscode.window.activeTextEditor.document;
    const position = vscode.window.activeTextEditor.selection.active;
    const range = new vscode.Range(position, position);
    const word = document.getText(range);
    const options = {
        document: document,
        position: position,
        word: word
    };
    vscode.commands.executeCommand('vscode.executeDocumentHighlights', options);
}
async function executeDocumentSymbolProvider() {
    const document = vscode.window.activeTextEditor.document;

    const symbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri);
    console.log(symbols);
}
/*
async function ExecuteDefinitionProvider() {
    const document = vscode.window.activeTextEditor.document;
    const position = vscode.window.activeTextEditor.selection.active;
    const definition = await vscode.commands.executeCommand('vscode.executeDefinitionProvider', document.uri, position);
    console.log(definition);
}
*/
async function SelectExtension() {
    let AllExtensions = vscode.extensions.all;
    let extensionIds = [''];
    for (let index = 0; index < AllExtensions.length; index++) {
        extensionIds.push(AllExtensions[index].id);
    }
    let value = await vscode.window.showQuickPick(extensionIds,
        { placeHolder: 'Pick an extension' });
    if (!value) {
        return;
    }
    if (value == '') {
        return;
    }
    const extension = vscode.extensions.getExtension(value);
    if (!(extension.isActive)) { extension.activate }
    const ALAPI = extension.exports;
    console.log(extension);
    if (ALAPI) {
        console.log('Extension =========>' + extension.id);
        console.log(ALAPI);
        const APIObject1 = await ALAPI.ALObjectCollector;
        console.log('ALObjectCollector:');
        console.log(APIObject1);
        console.log('ALObjectCollector: Methods');
        console.log(getMethods(APIObject1));
    }
}
async function GetDocumentVariables() {
    const GetSymbols = require('./GetSymbols.js');
    GetSymbols.GetDocumentVariables();
}
async function GetDocumentProcedures() {
    const GetSymbols = require('./GetSymbols.js');
    GetSymbols.GetDocumentProcedures();
}
async function getLocalVariables() {
    const GetSymbols = require('./GetSymbols.js');
    GetSymbols.getLocalVariables();
}
function consoleDoc() {
    let document = vscode.window.activeTextEditor.document;
    /*console.log(document);
    console.log('document.isDirty');
    console.log(document.isDirty);
    console.log('document.isClosed');
    console.log(document.isClosed);
    console.log('document.fileName');
    console.log(document.fileName);*/
    console.log('document.uri');
    console.log(document.uri);
    console.log(document.uri.scheme.toString() == 'file')

}
function GetActiveTerminal() {
    const currTerminal = vscode.window.activeTerminal;
    console.log(currTerminal);
    vscode.window.activeTerminal.sendText('dir *.*');
}
async function getPrevVersionwithQuikDiff()
{
    if (sourceControl.id != 'ownSCM')
    {
    sourceControl = vscode.scm.createSourceControl('ownSCM','OwnSCM');
    console.log(sourceControl);
    resourceGroup = sourceControl.createResourceGroup('rsGroup','rsGroup');
    console.log('resourceGroup');
    console.log(resourceGroup);    
    }
    resourceGroup.resourceStates =  [{ resourceUri: vscode.window.activeTextEditor.document.uri }];
    console.log('refresh resourceGroup');
    console.log(resourceGroup);
    console.log('resourceGroup.resourceStates');
    console.log(resourceGroup.resourceStates);
}
function getDocCodeLens() {
    const codeActions = require('./codeActions.js');
    codeActions.getDocCodeLens();
}
async function GetCodeActionsFromDoc() {
    console.log('GetCodeActionsFromDoc');
    const codeActions = require('./codeActions.js');
    await codeActions.getCodeActionsFromDoc();
}
async function GetCodeActionProvider() {
    const codeActions = require('./codeActions.js');
    await codeActions.getCodeActionProvider();
}
async function GetCodeActionsFromDocByLine()
{
    console.log('GetCodeActionsFromDocByLine');
    const codeActions = require('./codeActions.js');
    await codeActions.getCodeActionsFromDocByLine();
}
async function getCodeActionsFromCurrLine()
{
    console.log('getCodeActionsFromCurrLine');
    const codeActions = require('./codeActions.js');
    await codeActions.getCodeActionsFromCurrLine();
}
function logGlobalActions()
{
    const codeActions = require('./codeActions.js');
    codeActions.logGlobalActions();
}
function applyCodeActionWithFilter()
{
    const codeActions = require('./codeActions.js');
    codeActions.applyCodeActionWithFilter();
}