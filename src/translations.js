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
	SaveTranslation: function () { SaveTranslationToJsonAndCreateTranslationXlf()},
	GetTranslationsHtml: function() {return GetTranslationsHtml()},
	SaveHtmlTranslation: function(HtmlTranslation) {SaveHtmlTranslation(HtmlTranslation)}	
}
async function CreateTranslationJSON() {

	var JSONTrans = [];
	DeleteJSONTransFile();
	JSONTrans = await ProcessXlfFile('Select xlf file auto generated ENG', JSONTrans);	
	JSONTrans = await ProcessXlfFilePreviousTrans('Select xlf file previous translation', JSONTrans);	
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
	//vscode.window.showInformationMessage(fileUri[0].fsPath);
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
		var ReplacedLineText = linetext.replace(RexRemoveLabels, GetTranslationText);
		if (!JSONTrans.find(JSONTrans => JSONTrans.source == ReplacedLineText)) {
			JSONTrans.push(
				{
					"source": ReplacedLineText,
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
async function ProcessXlfFilePreviousTrans(newtitle, JSONTrans) {
	const options = {
		canSelectMany: false,
		openLabel: 'Open',
		title: newtitle,
		filters: {
			'xlf': ['xlf'],
		}
	};
	let fileUri = await vscode.window.showOpenDialog(options);
	//vscode.window.showInformationMessage(fileUri[0].fsPath);
	let XlfDoc = await vscode.workspace.openTextDocument(fileUri[0].fsPath);
	var LastSourceText = '';
	for (var i = 0; i < XlfDoc.lineCount; i++) {
		var line = XlfDoc.lineAt(i);
		LastSourceText = WriteJSONPeviousTrans(line.text, JSONTrans, LastSourceText);
	}
	return (JSONTrans);
}

function WriteJSONPeviousTrans(linetext, JSONTrans, LastSourceText) {
	if (linetext.match('<source>')) {
		var ReplacedLineText = linetext.replace(RexRemoveLabels, GetTranslationText);
		return(ReplacedLineText);
		//if (!JSONTrans.find(JSONTrans => JSONTrans.source == ReplacedLineText)) {
		//	return (ReplacedLineText);			
		//}
	}
	if (linetext.match('<target>')) {
		var JSONSource = JSONTrans.find(Obj => Obj.source == LastSourceText);
		if (JSONSource)
			{JSONSource.target = linetext.replace(RexRemoveLabels, GetTranslationText);}
	}
	return (LastSourceText);
}

// @ts-ignore
function GetTranslationText(fullMatch = '', startLabel = '', content = '', endLabel = '') {
	return (content);
}
async function BeginEditTranslation() {
	//let CurrDoc = await vscode.workspace.openTextDocument(vscode.Uri.parse("untitled:" + "*.xlf"));
	let CurrDoc = await vscode.workspace.openTextDocument();
	vscode.window.showTextDocument(CurrDoc, {preview: false});	
	//if (await ErrorIfNotEmptyDoc())
	//{return;}

	//var currEditor = vscode.window.activeTextEditor;	
	//let CurrDoc = currEditor.document;
	var JSONTrans = [];
	const WSEdit = new vscode.WorkspaceEdit;
	JSONTrans = ReadJSONTransFile(JSONTrans);
	//let lastLine = CurrDoc.lineCount;
	let lastLine = 0;
	for (var i = 0; i < JSONTrans.length; i++) {
		var element = JSONTrans[i];
		if ((element.target == '') ||(element.target == element.source)) {
			lastLine = await WriteElementToEdit(element, WSEdit, CurrDoc, lastLine);
		}
	}
	await vscode.workspace.applyEdit(WSEdit);
}
async function WriteElementToEdit(element, WSEdit, CurrDoc, lastLine) {
	await WSEdit.insert(CurrDoc.uri, new vscode.Position(lastLine, 0), element.source);

	await vscode.commands.executeCommand('editor.action.insertLineAfter');
	lastLine = lastLine + 1;
	await WSEdit.insert(CurrDoc.uri, new vscode.Position(lastLine, 0), TargetLabel + element.source);
	await vscode.commands.executeCommand('editor.action.insertLineAfter');
	lastLine = lastLine + 1;
	return (lastLine);
}
function ReadJSONTransFile(JSONTrans) {
	const fs = require('fs');
	const JSONFileURI = GetFullPathFileJSONS();
	if (fs.existsSync(JSONFileURI.fsPath)) {
		var oldJSON = fs.readFileSync(JSONFileURI.fsPath, "utf-8");
		JSONTrans = JSON.parse(oldJSON);
	}
	return (JSONTrans);
}
function DeleteJSONTransFile() {
	
	const fs = require('fs');
	const JSONFileURI = GetFullPathFileJSONS();
	if (fs.existsSync(JSONFileURI.fsPath)) {
		fs.unlinkSync(JSONFileURI.fsPath);
	}
}
function GetFullPathFileJSONS()
{
	var returnedName = 'JSONTranslation.json';
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		returnedName = ExtConf.get('JSONTranslationFilename');
	}
	return(vscode.Uri.file(vscode.workspace.rootPath + '/.vscode/' + returnedName));
}
function SaveJSONTransfile(JSONTrans) {
	const fs = require('fs');
	DeleteJSONTransFile();
	const JSONFileURI = GetFullPathFileJSONS();
	fs.writeFileSync(JSONFileURI.fsPath, JSON.stringify(JSONTrans));
}
async function SaveTranslationToJsonAndCreateTranslationXlf()
{
	await SaveTranslationToJson();
	await ClearCurrentDocument();
	await CreateTranslationXlf();
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
async function ClearCurrentDocument() {
	var currEditor = vscode.window.activeTextEditor;
	let CurrDoc = currEditor.document;
	const WSEdit = new vscode.WorkspaceEdit;	
	const range = new vscode.Range(new vscode.Position(0,0),new vscode.Position(CurrDoc.lineCount,0));
	await WSEdit.delete(CurrDoc.uri, range);		
	await vscode.workspace.applyEdit(WSEdit);	
	//await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

async function CreateTranslationXlf() {
	await WriteNewXlfFile('Select xlf file',);
	//var currEditor = vscode.window.activeTextEditor;
	//let CurrDoc = currEditor.document;
	
}
async function WriteNewXlfFile(NewTitle = '') {
	if (await ErrorIfNotEmptyDoc())
	{return;}

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
async function ErrorIfNotEmptyDoc()
{
	var currEditor = vscode.window.activeTextEditor;
	if (!currEditor)
	{await vscode.window.showErrorMessage('There is no current editor.')
	return true;
}
	let CurrDoc = currEditor.document;
	if (!CurrDoc)
	{await vscode.window.showErrorMessage('There is no current document.')
	return true;
}

	let CharCount = 0;
	for (var i = 0; i < CurrDoc.lineCount; i++) {
		CharCount = CharCount + CurrDoc.lineAt(i).text.length;
	}		
	if (CharCount > 0)
	{await vscode.window.showErrorMessage('The current document must be empty.')
	return true;
}

	return false;
}
function GetTranslationsHtml()
{
	let FinalTable = '';
	FinalTable = 
	`
	<body>
	<table id="table" style="width:100%">
  <th>Source</th><th>Target</th>`
 + GetHtmlTableContent() +
  `</table>	
  <br></br>
  <Button onclick="Save()">Save and close</Button>
  <Script>
  function Save() {
      //document.getElementById('Target1').innerHTML = document.getElementById('Source1').innerHTML;
      const vscode = acquireVsCodeApi();
    vscode.postMessage({
      command: "Save",
      text: document.getElementById('table').innerHTML
    });
	}
  </Script>
  </body>
  </html>   	
	`
	return FinalTable;
}
function SaveHtmlTranslation(HtmlTranslation = '')
{
	console.log(HtmlTranslation);
}
function GetHtmlTableContent()
{
	let HtmlTableContent = `
	<tr>
	<td id=1>Source</td>
	<td><div contenteditable>Target</div></td>
	</tr>
	<tr>
	<td id=1>Source</td>
	<td><div contenteditable>Target2</div></td>
	</tr>
	`
	return HtmlTableContent;
}