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
    var ObjDecMatches = ObjDeclaration.match(ObjDeclarationRegExp);
    if (!ObjDecMatches)
    {
        return;
    }
    const ObjName = ObjDecMatches[1].replace(/"/g,'');
    if (ObjName.indexOf('extends') > 0)
    {return}
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
        var original = CurrDoc.lineAt(i);
        var varDecMatches = original.match(GetRegExpVarDeclaration());
        if (varDecMatches) { 
            for (var i = 0; i < Object.keys(varDecMatches).length; i++) {
                var element = varDecMatches[i];
                await MatchProcess(element,i,CurrDoc);
                return 
            }
        }
    }
}
async function MatchProcess(Element,LineNumber = 0,CurrDoc) {
	const singleMatch = Element.match(GetRegExpVarDeclaration());
    const VarSubtype = singleMatch[7].replace(/"/g,'');
    const AppPrefix = await GetAppPrefix(); 
    if (VarSubtype.indexOf(AppPrefix)==0)
    {return}
    if (await SymbolExists(VarSubtype))
    {return}
    if (await SymbolExists(GetSubTypeWithPrefix(AppPrefix,VarSubtype)))
    {ChangeSubtype(VarSubtype,CurrDoc,LineNumber);}
}
async function SymbolExists(SymbolName='')
{
    let symbols = await vscode.commands.executeCommand("vscode.executeWorkspaceSymbolProvider",SymbolName);    
    if (symbols.length >= 1)
    {return true}
    return false;   
}
async function ChangeSubtype(VarSubtype='',CurrDoc,LineNumber=0)
{
    const WSEdit = new vscode.WorkspaceEdit;
    const AppPrefix = await GetAppPrefix();
    const PositionOpen = new vscode.Position(LineNumber,
        CurrDoc.lineAt(LineNumber).text.indexOf(VarSubtype));        
    const PositionClose = new vscode.Position(LineNumber,
        CurrDoc.lineAt(LineNumber).text.indexOf(VarSubtype) + VarSubtype.length);        
        
    WSEdit.replace(CurrDoc.uri, new vscode.Range(PositionOpen, PositionClose),
    GetSubTypeWithPrefix(AppPrefix,VarSubtype));
    await vscode.workspace.applyEdit(WSEdit);
}
function GetSubTypeWithPrefix(AppPrefix='',Subtype='')
{
    return AppPrefix + ' ' + Subtype;
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
function GetRegExpVarDeclaration()
{
    const RenameVars = require('./RenameVars.js');		
    return(RenameVars.GetRegExpVarDeclaration());

}
