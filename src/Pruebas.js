const vscode = require('vscode');
var subscription = vscode.workspace.onDidChangeTextDocument(HandleDocumentChanges);
subscription.dispose();
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
        GetExtensions();
        //GetALExtension();
        //GetALObjects();
        //ShowQuickPick();        
        //CatchDocumentChanges();
        //ShowALObjectsOuputChannel();
        //GetDiagnostics();
        //ReadLargeFile();
    },
    GetALObjects: async function(){
        return(await GetALObjects());
    },
    Pruebas2: async function(){
        StopCatchDocumentChanges();
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
    console.log(ALExtension);
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
    const PromiseDlg = await vscode.window.showWarningMessage('Are you run a long time process with the file?',{modal:false},'Yes','No');
    if (PromiseDlg == 'No')
    {
        vscode.window.showInformationMessage('Process cancelled');        
        return;
    }
    vscode.window.showInformationMessage('Processing file:' + fileUri[0].fsPath,{modal:false},'Got it');
    var fs = require('fs'),
        readline = require('readline');

    var rd = readline.createInterface({
        input: fs.createReadStream(fileUri[0].fsPath)
    });
    let CountLines = 0;    
    rd.on('line', function (line) {
        CountLines = CountLines + 1;
        if ((CountLines % 10000) == 0)
        {
            console.log(CountLines);
            console.log(line);
        }
    });
    rd.on('close',function () {
        console.log('Final');
        console.log(CountLines);
        vscode.window.showInformationMessage('Ending file lines:' + CountLines.toString());
    }
    );
}
function ShowQuickPick()
{
    vscode.window.showQuickPick(['Tonto','Gusano'],
    {placeHolder:'Elige entre ser tonto o gusano'}).then(value=>
        {
            vscode.window.showInformationMessage('Vas a ser ' + value + ' todo el dia');
        });		
}
function CatchDocumentChanges()
{
      // start listening
      subscription = vscode.workspace.onDidChangeTextDocument(HandleDocumentChanges);
      // do more stuff
      
      //subscription.dispose(); // stop listening
}
function HandleDocumentChanges(event)
{
        console.log(event);
        if (event.contentChanges[0].text.charCodeAt(0) == 13)
        {
            console.log('Intro');
            console.log(event.contentChanges[0].range.end);
            const WSEdit = new vscode.WorkspaceEdit;
            const NewPosition = new vscode.Position(event.contentChanges[0].range.end.line + 1,0);
            WSEdit.insert(event.document.uri,NewPosition,'v1: ');
            vscode.workspace.applyEdit(WSEdit);
        }

      //subscription.dispose(); // stop listening
}
function StopCatchDocumentChanges()
{
    subscription.dispose();
}
function ExecuteTask(TaskLabel)
{

}