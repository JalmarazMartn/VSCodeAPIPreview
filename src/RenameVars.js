const vscode = require('vscode');
module.exports = {
	changeSelection: async function () {
		var currEditor = vscode.window.activeTextEditor;
		var selection = currEditor.selection;
		const startLine = selection.start.line;
		const endLine = selection.end.line;
		let CurrDoc = currEditor.document;
		//const WSEdit = new vscode.WorkspaceEdit;	

		for (var i = startLine; i <= endLine; i++) {
			await lineProcess(i, CurrDoc);
		}
		//const CharsFrom = vscode.workspace.getConfiguration('vscAPIPrev', vscode.workspace.workspaceFolders[0].uri);
		//vscode.workspace.applyEdit(WSEdit);	
		GetExtensionConf();

	},
	changeAll: async function () {
		var currEditor = vscode.window.activeTextEditor;
		let CurrDoc = currEditor.document;
		//const WSEdit = new vscode.WorkspaceEdit;
		for (var i = 0; i < CurrDoc.lineCount; i++) {
			await lineProcess(i, CurrDoc);
		}

	}

}
async function lineProcess(i, CurrDoc) {
	var line = CurrDoc.lineAt(i);
	await ALVariableNaming(i, line.text);
}
async function ALVariableNaming(lineNumber = 0, original) {
	var varDecMatches = original.match(GetRegExpVarDeclaration(true));
	if (!varDecMatches) { return };
	for (var i = 0; i < Object.keys(varDecMatches).length; i++) {
		var element = varDecMatches[i];
		original = await MatchProcess(element, original, lineNumber);
	}
}
async function MatchProcess(element, original = '', lineNumber = 0) {
	const singleMatch = element.match(GetRegExpVarDeclaration(false));
	const FullMatch = singleMatch[0];
	const VarName = singleMatch[5];
	let posVarName = original.indexOf(FullMatch) + FullMatch.indexOf(VarName);
	const VarSubtype = singleMatch[7];
	var NewVarName = GetNewVarName(VarSubtype);
	if (VarName.indexOf(NewVarName) >= 0)
	{return original}
	var edit = await vscode.commands.executeCommand('vscode.executeDocumentRenameProvider',
		vscode.window.activeTextEditor.document.uri,
		new vscode.Position(lineNumber, posVarName),
		NewVarName);

	await vscode.workspace.applyEdit(edit);
	return vscode.window.activeTextEditor.document.lineAt(lineNumber).text;
}

function ReplaceVarName(FullMatch, DelimiterStart, IsByRef, Newline, Spaces, VarName, VarType, VarSubtype, FinalDec) {
	if (!VarType) { return FullMatch; }
	if (!VarSubtype) { return FullMatch; }

	var NewVarName = GetNewVarName();
	var NewText = DelimiterStart + IsByRef + Newline + Spaces + NewVarName
		+ ':' + VarType + ' ' + VarSubtype + FinalDec;

	return (NewText);
}
function GetNewVarName(VarSubtype = '') {
	//var NewVarName = VarSubtype.replace(/\s|"|temporary|\/|\.|-/gi, '');
	var NewVarName = VarSubtype.replace(/temporary|[^a-zA-Z0-9]/gi, '');
	if (VarSubtype.match(/temporary/i)) { NewVarName = 'Temp' + NewVarName }
	return NewVarName;
}
function GetExtensionConf() {
	//const ExtConf = vscode.workspace.getConfiguration('', vscode.workspace.workspaceFolders[0].uri);	
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		//vscode.window.setStatusBarMessage('Es conf ' +ExtConf.get('CharsFrom'));
	}
}
function GetRegExpVarDeclaration(isGlobal = false) {
	let searchParams = 'i';
	if (isGlobal) { searchParams = 'gi'; }
	const G1Spaces = new RegExp(/(\s*)/.source);
	const G2ByRef = new RegExp(/(var|.{0})/.source);
	const G2NewLine = new RegExp(/($|.{0})/.source);
	const G2Spaces = new RegExp(/(\s*)/.source);
	const G3VarName = new RegExp(/([A-Za-z\s0-9"]*):\s*/.source);
	const G4VarType = new RegExp(/(Record|Page|TestPage|Report|Codeunit|Query|XmlPort)/.source);
	const G5VarSubType = new RegExp(/([A-Za-z\s0-9"-\/]*)/.source);
	const G6EndStat = new RegExp(/(\)|;)/.source);

	return (new RegExp('' +
		G1Spaces.source +
		G2ByRef.source +
		G2NewLine.source +
		G2Spaces.source +
		G3VarName.source +
		G4VarType.source +
		G5VarSubType.source +
		G6EndStat.source, searchParams));

}
