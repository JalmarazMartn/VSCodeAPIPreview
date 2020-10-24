const vscode = require('vscode');
module.exports = {
	changeAll: function(){
		var currEditor = vscode.window.activeTextEditor;				
		let CurrDoc = currEditor.document;		
		const WSEdit = new vscode.WorkspaceEdit;
		if (!isAPage(CurrDoc))
		{
			vscode.window.showErrorMessage('The object is not a Page.');
			return;
		}
		for(var i=0;i<CurrDoc.lineCount;i++)
		{						
			lineProcess(i,CurrDoc,WSEdit);
		}
		vscode.workspace.applyEdit(WSEdit);
	
	}
	
}	
function isAPage(CurrDoc)
{
	return(CurrDoc.lineAt(0).text.match(/page\s+[0-9]+\s+["|a-z|\s]+/gi));
}
function lineProcess(i,CurrDoc,WSEdit)
{
	var line = CurrDoc.lineAt(i);	
	const range = line.range;	
	vscode.window.setStatusBarMessage(line.text);		
	WSEdit.replace(CurrDoc.uri,range,putRecBefore(line.text));

}
function putRecBefore(original)
{         
	const G1fieldDec = new RegExp(/(field\s*\(.+;\s*)/.source);
	const G2recField = new RegExp(/(.+\))/.source);	
	const VarDecRegEx = new RegExp('' +
		G1fieldDec.source +
		G2recField.source 
		,'gi');	
	return (original.replace(VarDecRegEx,
		addRecToField));
	
}
function addRecToField(FullMatch, beginDeclaration,fieldDeclaration) {
	if (fieldDeclaration.match(/rec\./i)) { return FullMatch; }
	var NewText = beginDeclaration + 'Rec.' + fieldDeclaration;
	return (NewText);
}
