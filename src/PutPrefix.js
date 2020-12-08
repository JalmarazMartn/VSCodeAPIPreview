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
}
async function ProcessObjectDecl(CurrDoc)
{
    const ObjDeclaration = CurrDoc.lineAt(0).text;
    const ObjDeclarationRegExp = new RegExp(/[a-z|A-Z]+\s*[0-9]+\s*(.*)/.source);
    var ObjDecMatches = ObjDeclaration.match(ObjDeclarationRegExp);
    if (!ObjDecMatches)
    {
        return;
    }
    const ObjName = ObjDecMatches[1].replace(/"/g,'');
    if (ObjName.indexOf('extends') > 0)
    {return}
    if (ObjName.indexOf(GetPrefixConfig()) > 0)
    {return}
    const ObjNameBegin = ObjDeclaration.indexOf(ObjName);
	var edit = await vscode.commands.executeCommand('vscode.executeDocumentRenameProvider',
		CurrDoc.uri,
		new vscode.Position(0, ObjNameBegin),
        await GetPrefixConfig() +' ' +ObjName);

	await vscode.workspace.applyEdit(edit);
}
async function GetPrefixConfig()
{
    return('TIP');
}
