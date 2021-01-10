const vscode = require('vscode');
//let ALObjects = [];
let ALObjects = [];
module.exports = {
    Pruebas: async function (context) {
		//const translation = require('./translations.js');		
		//translation.EditHtmlTranslation(context);

        //GetDocumentSymbols();
        //GetSymbolsInfo();
        //GetCodeActionProvider();
        //GetExtensionConf();
        //GetExtensions();
        //GetALExtension();
        //GetALObjects();
        //ShowALObjectsOuputChannel();
        GetDiagnostics();
    },
    GetALObjects: async function(){
        return(await GetALObjects());
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
    console.log(symbols);

}
async function ExecuteCommWithUriAndPos(CommandToExec='')
{
    console.log('Command:'+ CommandToExec);    
    let document = vscode.window.activeTextEditor.document;
    let locations = await vscode.commands.executeCommand(CommandToExec,
    document.uri,vscode.window.activeTextEditor.selection.start);
   // console.log(await document.lineAt(vscode.window.activeTextEditor.selection.start.line).text);
    if (locations)
    {
    console.log(locations);}
}
async function GetCodeActionProvider()
{   const ActualRange = new vscode.Range(vscode.window.activeTextEditor.selection.start,
    vscode.window.activeTextEditor.selection.end);
    let CodeActions = await vscode.commands.executeCommand("vscode.executeCodeActionProvider",vscode.window.activeTextEditor.document.uri,
        ActualRange);
    if (CodeActions)
    {
    console.log(CodeActions);
    }

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
async function GetExtensions()
{
    let AllExtensions = vscode.extensions.all;
    console.log(AllExtensions.length);
    for (var i = 0; i < AllExtensions.length; i++) {
        let Extension = AllExtensions[i];
        await GetALExtension(Extension.id);
     }
}
async function GetALExtension(ExtensionId = '')
{
try {        
    const ALExtension = vscode.extensions.getExtension(ExtensionId);    
    if (!(ALExtension.isActive))
    {ALExtension.activate}
    const ALAPI = ALExtension.exports;
    if (ALAPI)
    {
        console.log('Extension =========>' + ExtensionId);        
    console.log(ALAPI);
    if (ExtensionId == 'martonsagi.al-object-designer')
    {
        const APIObject1 = await ALAPI.ALObjectCollector;
        console.log('ALObjectCollector:');
        console.log(APIObject1);
        console.log('ALObjectCollector: Methods');
        console.log(getMethods(APIObject1));
    }
    }
}
catch (error) { 
    //console.log(error);
    return;
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
  async function GetALObjects()
  {
    if (ALObjects.length > 0)
    {
        return ALObjects
    }
    const ALExtension = vscode.extensions.getExtension('martonsagi.al-object-designer');        
    if (!(ALExtension.isActive))
    {await ALExtension.activate}
    const ALAPI = await ALExtension.exports;
    if (ALAPI)
    {
        ALObjects = await ALAPI.ALObjectCollector._getData();
        console.log(ALObjects.length);
       // Object.freeze(ALObjects);       
    }
    return ALObjects;
  }
  async function ShowALObjectsOuputChannel()
  {
    const OutputChannel = vscode.window.createOutputChannel(`Output Channel`);
    OutputChannel.appendLine('Getting objects');
    const LocalObjects = await GetALObjects();
    OutputChannel.appendLine('Objects: ' + LocalObjects.length);
    OutputChannel.show();
  }
  function GetDiagnostics()
  {
      const AppUri = vscode.workspace.workspaceFile;
      const AppDiagnostics = vscode.languages.getDiagnostics(AppUri);
      let Problems = [];
      for (let i = 0; i < AppDiagnostics.length; i++) {
          for (let j = 0; j < AppDiagnostics[i][1].length; j++) {
            let Problem = AppDiagnostics[i][1][j];
            let ProblemRange = Problem.range;
              Problems.push(
                  {
                    FilePath: AppDiagnostics[i][0].path,
                    StarTLine: ProblemRange.start.line,
                    StartColumn: ProblemRange.start.character,
                    EndLine: ProblemRange.end.line,
                    EndColumn: ProblemRange.end.character,
                    MessageCode: Problem.code,
                    MessageDescription: Problem.message,
                    Severity: Problem.severity
                            })
          }
      }
    console.log(Problems);
    return Problems;
  }