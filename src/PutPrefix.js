const vscode = require('vscode');
module.exports = {
    SetPrefix: async function () {
        await SetObjectPrefix();
    }
}
async function SetObjectPrefix()
{
    const currEditor = vscode.window.activeTextEditor;
    let CurrDoc = currEditor.document;
    await ProcessObjectDecl(CurrDoc);
    await ProcessBodyDecl(CurrDoc);

}
async function ProcessObjectDecl(CurrDoc)
{
    const ObjDeclaration = CurrDoc.lineAt(0).text;
    const ObjDeclarationRegExp = new RegExp(/[a-z|A-Z]+\s*[0-9]+\s*(.*)/.source);
    const AppPrefix = await GetAppPrefix()
    if (AppPrefix =='')
    {return}
    if (ObjDeclaration.indexOf(AppPrefix)>=0)
    {return}
    var ObjDecMatches = ObjDeclaration.match(ObjDeclarationRegExp);
    if (!ObjDecMatches)
    {
        return;
    }
    const ObjName = ObjDecMatches[1].replace(/"/g,'');
    //if (ObjName.indexOf('extends') > 0)
    //{return}
    if (ObjName.indexOf(await GetAppPrefix()) > 0)
    {return}
    const ObjNameBegin = ObjDeclaration.indexOf(ObjName);
	var edit = await vscode.commands.executeCommand('vscode.executeDocumentRenameProvider',
		CurrDoc.uri,
		new vscode.Position(0, ObjNameBegin),
        AppPrefix +' ' +ObjName);

	await vscode.workspace.applyEdit(edit);
}
async function ProcessBodyDecl(CurrDoc)
{
    const AppPrefix = await GetAppPrefix();
    if (AppPrefix=='')
    {return}
    for (var i = 1; i < CurrDoc.lineCount; i++) {
        var original = CurrDoc.lineAt(i).text;
        var varDecMatches = original.match(GetRegExpVarDeclaration(true));
        if (varDecMatches) {
            for (var j = 0; j < Object.keys(varDecMatches).length; j++) {
                var element = varDecMatches[j];
                original = await MatchProcess(element,i,original);
            }
        }
    }
}
async function MatchProcess(Element,LineNumber = 0,original = '') {    
    const singleMatch = Element.match(GetRegExpVarDeclaration(false));    
    var VarSubtype = singleMatch[7];
    VarSubtype = VarSubtype.replace(/"/g,'').trim();
    const AppPrefix = await GetAppPrefix(); 
    if (VarSubtype.indexOf(AppPrefix)==0)
    {return original}
    //if (await SymbolExists(VarSubtype))
    //{return}

    if (await SymbolExists(GetSubTypeWithPrefix(AppPrefix,VarSubtype)))
    {            
        original = await ChangeSubtype(singleMatch[6],VarSubtype,original,LineNumber);}
    return original;
}
async function SymbolExists(SymbolName='')
{
    let symbols = await vscode.commands.executeCommand("vscode.executeWorkspaceSymbolProvider",SymbolName);    
    if (symbols.length >= 1)
    { 
       const SymbolName = symbols[0].name;
       const MatchExt = SymbolName.match(/Tableextension|Pageextension/i);
       if (MatchExt)
       {
           return false;
       }
        return true;}
    return false;   
}
async function ChangeSubtype(VarType= '',VarSubtype='',original = '',LineNumber=0)
{
    const WSEdit = new vscode.WorkspaceEdit;
    const AppPrefix = await GetAppPrefix();
    const RegExCompletDec = new RegExp(VarType+'\\s+"{0,1}'+VarSubtype);
    const MatchCompleteDec = original.match(RegExCompletDec);
    const InitialPosition  = original.indexOf(MatchCompleteDec[0]) + MatchCompleteDec[0].indexOf(VarSubtype);
    const PositionOpen = new vscode.Position(LineNumber,
        InitialPosition);        
    const PositionClose = new vscode.Position(LineNumber,
        InitialPosition + VarSubtype.length); 
    
        
    WSEdit.replace(vscode.window.activeTextEditor.document.uri, new vscode.Range(PositionOpen, PositionClose),
    GetSubTypeWithPrefix(AppPrefix,VarSubtype));
    await vscode.workspace.applyEdit(WSEdit);
	return vscode.window.activeTextEditor.document.lineAt(LineNumber).text;    
}
function GetSubTypeWithPrefix(AppPrefix='',Subtype='')
{
    return AppPrefix + ' ' + Subtype.trim();
}

async function GetAppPrefix()
{
    const ExtConf = vscode.workspace.getConfiguration('');
    var AppPrefix = '';
	if (ExtConf) {
		AppPrefix = ExtConf.get('AppPrefix');
    }
    if ((!AppPrefix) || (AppPrefix == ''))
    {
        vscode.window.showErrorMessage("You must specify a value for AppPrefix in extension settings");
    }
    return(AppPrefix);    
}
function GetRegExpVarDeclaration(IsGlobal=false)
{
    const RenameVars = require('./RenameVars.js');
    return(RenameVars.GetRegExpVarDeclaration(IsGlobal));
}
