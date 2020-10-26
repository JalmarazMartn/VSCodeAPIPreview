const vscode = require('vscode');
const TargetLabel = 'Target==>';
const RexRemoveLabels = /\s*(<target>|<source>)(\s*.*)(<\/target>|<\/source>)/gm;
const RexLanguageLine = /(source-language=".*"\s*target-language=")([a-z\-]*)(")/gmi;
//
module.exports = {
	LoadXlfTranslations: function (
	) {
		CreateTranslationJSON();
	},
	EditTranslation: function () { BeginEditTranslation() },
	SaveTranslation: function () { SaveTranslationToJson() },
	CreateTranslation: function () { CreateTranslationXlf() }

}
async function CreateTranslationJSON() {

	var JSONTrans = [];
	JSONTrans = ReadJSONTransFile(JSONTrans);
	JSONTrans = await ProcessXlfFile('Select xlf file', JSONTrans);
	SaveJSONTransfile(JSONTrans);
};

async function ProcessXlfFile(newtitle, JSONTrans) {
	const options = {
		canSelectMany: false,
		openLabel: 'Open',
		title: newtitle,
		filters: {
			'xlf': ['xlf'],
		}
	};
	let fileUri = await vscode.window.showOpenDialog(options);
	vscode.window.showInformationMessage(fileUri[0].fsPath);
	let XlfDoc = await vscode.workspace.openTextDocument(fileUri[0].fsPath);
	var LastSourceText = '';
	for (var i = 0; i < XlfDoc.lineCount; i++) {
		var line = XlfDoc.lineAt(i);
		LastSourceText = WriteJSONTrans(line.text, JSONTrans, LastSourceText);
	}
	return (JSONTrans);
}
function WriteJSONTrans(linetext, JSONTrans, LastSourceText) {
	if (linetext.match('<source>')) {
		if (!JSONTrans.find(JSONTrans => JSONTrans.source == linetext)) {
			JSONTrans.push(
				{
					"source": linetext.replace(RexRemoveLabels, GetTranslationText),
					"target": ''
				});
		}
		return (linetext.replace(RexRemoveLabels, GetTranslationText));
	}
	if (linetext.match('<target>')) {
		var JSONSource = JSONTrans.find(Obj => Obj.source == LastSourceText);
		JSONSource.target = linetext.replace(RexRemoveLabels, GetTranslationText);
	}
	return (LastSourceText);
}
function getJSONFileName() {
	var returnedName = 'JSONTranslation.json';
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		returnedName = ExtConf.get('JSONTranslationFilename');
	}
	return (returnedName);
}
// @ts-ignore
function GetTranslationText(fullMatch = '', startLabe = '', content = '', endLabel = '') {
	return (content);
}
async function BeginEditTranslation() {
	var currEditor = vscode.window.activeTextEditor;
	let CurrDoc = currEditor.document;
	var JSONTrans = [];
	const WSEdit = new vscode.WorkspaceEdit;
	JSONTrans = ReadJSONTransFile(JSONTrans);
	let lastLine = CurrDoc.lineCount;
	for (var i = 0; i < JSONTrans.length; i++) {
		var element = JSONTrans[i];		
		if ((element.target == '')) {
			lastLine = await WriteElementToEdit(element, WSEdit, CurrDoc, lastLine);
		}
	}
	await vscode.workspace.applyEdit(WSEdit);
}
async function WriteElementToEdit(element, WSEdit, CurrDoc, lastLine) {
	await WSEdit.insert(CurrDoc.uri, new vscode.Position(lastLine, 0), element.source.trim());
	await vscode.commands.executeCommand('editor.action.insertLineAfter');
	lastLine = lastLine + 1;
	await WSEdit.insert(CurrDoc.uri, new vscode.Position(lastLine, 0), TargetLabel + element.source.trim());
	await vscode.commands.executeCommand('editor.action.insertLineAfter');
	lastLine = lastLine + 1;
	return (lastLine);
}
function ReadJSONTransFile(JSONTrans) {
	const fs = require('fs');
	const JSONFileURI = vscode.Uri.file(vscode.workspace.rootPath + '/' + getJSONFileName());
	if (fs.existsSync(JSONFileURI.fsPath)) {
		var oldJSON = fs.readFileSync(JSONFileURI.fsPath, "utf-8");
		JSONTrans = JSON.parse(oldJSON);
	}
	return (JSONTrans);
}
function SaveJSONTransfile(JSONTrans) {
	const fs = require('fs');
	const JSONFileURI = vscode.Uri.file(vscode.workspace.rootPath + '/' + getJSONFileName());
	if (fs.existsSync(JSONFileURI.fsPath)) {
		fs.unlinkSync(JSONFileURI.fsPath);
	}
	fs.writeFileSync(JSONFileURI.fsPath, JSON.stringify(JSONTrans));
}
function SaveTranslationToJson() {
	var currEditor = vscode.window.activeTextEditor;
	let CurrDoc = currEditor.document;
	let LastSourceText = '';
	var JSONTrans = [];
	JSONTrans = ReadJSONTransFile(JSONTrans);
	for (var i = 0; i < CurrDoc.lineCount; i++) {
		const linetext = CurrDoc.lineAt(i).text;
		const IsTarget = linetext.match(TargetLabel);
		if (IsTarget) {
			const TargetText = linetext.replace(TargetLabel, '');
			if (TargetText !== LastSourceText) {
				var JSONSource = JSONTrans.find(Obj => Obj.source == LastSourceText);
				JSONSource.target = TargetText;
			}
		}
		else { LastSourceText = linetext }
	}
	SaveJSONTransfile(JSONTrans);
}
async function CreateTranslationXlf() {
	await WriteNewXlfFile('Select xlf file',);
}
async function WriteNewXlfFile(NewTitle = '') {
	var JSONTrans = [];
	JSONTrans = ReadJSONTransFile(JSONTrans);

	const options = {
		canSelectMany: false,
		openLabel: 'Open',
		title: NewTitle,
		filters: {
			'xlf': ['xlf'],
		}
	};
	let fileUri = await vscode.window.showOpenDialog(options);
	vscode.window.showInformationMessage(fileUri[0].fsPath);
	let XlfDoc = await vscode.workspace.openTextDocument(fileUri[0].fsPath);
	var currEditor = vscode.window.activeTextEditor;
	let CurrDoc = currEditor.document;
	const WSEdit = new vscode.WorkspaceEdit;
	let lastLine = 0;
	for (var i = 0; i < XlfDoc.lineCount; i++) {
		let LineText = XlfDoc.lineAt(i).text;
		LineText = LineText.replace(RexLanguageLine, GetLanguageText);
		lastLine = await WriteNewXlfLine(LineText, WSEdit, CurrDoc, lastLine);
		if (LineText.match('<source>')) {
			const SourceText = LineText.replace(RexRemoveLabels, GetTranslationText);
			var JSONSource = JSONTrans.find(Obj => Obj.source == SourceText);
			let TargetText = '';
			if (JSONSource) { TargetText = JSONSource.target; }
			let TargetLineText = LineText.replace(SourceText, TargetText);
			TargetLineText = TargetLineText.replace(/source\>/g, 'target>');
			lastLine = await WriteNewXlfLine(TargetLineText, WSEdit, CurrDoc, lastLine);
		}

	}
	await vscode.workspace.applyEdit(WSEdit);
}
async function WriteNewXlfLine(LineText = '', WSEdit, CurrDoc, lastLine) {

	await WSEdit.insert(CurrDoc.uri, new vscode.Position(lastLine, 0), LineText);
	await vscode.commands.executeCommand('editor.action.insertLineAfter');
	lastLine = lastLine + 1;
	return (lastLine);
}
function GetLanguageText(fullMatch = '', startLabel = '', content = '', endLabel = '') {
	console.log(startLabel + GetTargetLanguage() + endLabel);
	return (startLabel + GetTargetLanguage() + endLabel);
}
function GetTargetLanguage() {
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		return (ExtConf.get('TargetLanguage'));
	}	
}