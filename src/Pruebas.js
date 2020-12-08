const vscode = require('vscode');
module.exports = {
    Pruebas: async function () {
        GetDocumentSymbols();
        //GetSymbolsInfo();
        //GetExtensionConf();
    }
}
async function GetSymbolsInfo()
{
    await ExecuteCommWithUriAndPos('vscode.executeDefinitionProvider');
    await ExecuteCommWithUriAndPos('vscode.executeDeclarationProvider');
    await ExecuteCommWithUriAndPos('vscode.executeTypeDefinitionProvider');
    await ExecuteCommWithUriAndPos('vscode.executeImplementationProvider');
    await ExecuteCommWithUriAndPos('vscode.executeReferenceProvider');
}
async function GetDocumentSymbols()
{    
    //vscode.commands.executeCommand("vscode.executeWorkspaceSymbolProvider","Whse. Asistant Mngt").then(
    //    function (symbols) {
    //        console.log('symbols');
    //    }
    //);    
    let symbols = await vscode.commands.executeCommand("vscode.executeWorkspaceSymbolProvider"," ");
    console.log('jdjd');
}
async function ExecuteCommWithUriAndPos(CommandToExec='')
{
    console.log('Command:'+ CommandToExec);    
    let document = vscode.window.activeTextEditor.document;
    let locations = await vscode.commands.executeCommand(CommandToExec,
    document.uri,vscode.window.activeTextEditor.selection.start);
    if (locations)
    {
    console.log(locations);}
}
function GetExtensionConf()
{
    console.log(GetExtensionConfValue('JSONTranslationFilename'));
    console.log(GetExtensionConfValue('CharsFrom'));    
    console.log(GetExtensionConfValue('CharsTo'));        
}
function GetExtensionConfValue(KeyToReturn='') {
    //const ExtConf = vscode.workspace.getConfiguration('', vscode.workspace.workspaceFolders[0].uri);	
    console.log(KeyToReturn);
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		return (ExtConf.get(KeyToReturn));
	}
}