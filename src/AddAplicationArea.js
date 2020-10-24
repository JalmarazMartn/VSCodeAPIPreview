const vscode = require('vscode');
const AditionalElementType = {
    AppArea: 'ApplicationArea',
    DataClass: 'DataClassification'
}
const ObjectType = {
    Table: 'table',
    Page: 'page',
    NoProcess: 'NoProcess'
}
const DataClassOptions = {
    ToBeClass: 'ToBeClassified',
    CustContent: 'CustomerContent'
}
module.exports = {
    changeAll: async function () {
        var currEditor = vscode.window.activeTextEditor;
        let CurrDoc = currEditor.document;
        let CurrElement = { ElementText: "", ElementOpenLine: 0 };
        if (GetObjectType(CurrDoc)==ObjectType.NoProcess)
        {return};
        CurrElement.ElementText = '';
        for (var i = 0; i < CurrDoc.lineCount; i++) {
            CurrElement = await lineProcess(i, CurrDoc, CurrElement);
        }
    }
}
async function lineProcess(LineNumber, CurrDoc, CurrElement = { ElementText: "", ElementOpenLine: 0 }) {
    await SubsTituteToBeClassified(LineNumber,CurrDoc);
    if (MatchWithElement(CurrDoc.lineAt(LineNumber).text)) {
        CurrElement.ElementText = CurrDoc.lineAt(LineNumber).text;
    }
    else {
        if (CurrElement.ElementText !== '') {
            CurrElement.ElementText = CurrElement.ElementText + CurrDoc.lineAt(LineNumber).text
        }
    }
    if (MatchWithOpen(CurrDoc.lineAt(LineNumber).text)) {
        if (CurrElement.ElementText !== '') {
            CurrElement.ElementOpenLine = LineNumber;
        }
    }

    if (MatchWithClose(CurrDoc.lineAt(LineNumber).text)) {
        await PerformChanges(CurrElement, CurrDoc);
        CurrElement.ElementText = '';
        CurrElement.ElementOpenLine = 0;
    }
    return (CurrElement);
}
function MatchWithElement(lineText = '') {
    var ElementMatch = lineText.match(/\s*field\s*\(.*;.*\)/gi);
    if (!ElementMatch) { 
        ElementMatch = lineText.match(/\s*action\s*\(.*\)/gi);        
    }
    if (!ElementMatch) { 
        ElementMatch = lineText.match(/\s*part\s*\(.*\)/gi);        
    }
    if (ElementMatch) { return (true); }
    return (false);
}
function MatchWithClose(lineText = '') {
    return (lineText.indexOf('}') >= 0);
}
function MatchWithOpen(lineText = '') {
    return (lineText.indexOf('{') >= 0);
}
async function PerformChanges(CurrElement = { ElementText: "", ElementOpenLine: 0 }, CurrDoc) {
    if (CurrElement.ElementText == '') { return }
    var AditionalElement = GetAditionalElement(CurrDoc);    
    if (CurrElement.ElementText.indexOf(AditionalElement.Key) >= 0) { return }    
    const WSEdit = new vscode.WorkspaceEdit;

    const PositionOpen = new vscode.Position(CurrElement.ElementOpenLine,
        CurrDoc.lineAt(CurrElement.ElementOpenLine).text.indexOf('{') + 1);        
    var NewValue = AditionalElement.Key + '=' + AditionalElement.Value + ';';
    WSEdit.replace(CurrDoc.uri, new vscode.Range(PositionOpen, PositionOpen),
        NewValue);
    await vscode.workspace.applyEdit(WSEdit);
}
async function SubsTituteToBeClassified(LineNumber,CurrDoc)
{
    var  PositionTobe = CurrDoc.lineAt(LineNumber).text.indexOf(DataClassOptions.ToBeClass);
    if (PositionTobe < 0)
    {return}
    const WSEdit = new vscode.WorkspaceEdit;

    const PositionStart = new vscode.Position(LineNumber,PositionTobe);
    const PositionEnd = new vscode.Position(LineNumber,PositionTobe+DataClassOptions.ToBeClass.length);    
    var NewValue = DataClassOptions.CustContent;
    WSEdit.replace(CurrDoc.uri, new vscode.Range(PositionStart, PositionEnd),
        NewValue);
    await vscode.workspace.applyEdit(WSEdit);    
}
function GetAditionalElement(CurrDoc) {
    switch(GetObjectType(CurrDoc)) {
        case ObjectType.Table:
            return ({ Key: AditionalElementType.DataClass, Value: "CustomerContent" })            
            case ObjectType.Page:
                return ({ Key: AditionalElementType.AppArea, Value: "All" })            
        }
}
function GetObjectType(CurrDoc) {
    for (var i = 0; i < CurrDoc.lineCount; i++) {
        if (CurrDoc.lineAt(i).text !== '') {
            if (CurrDoc.lineAt(i).text.indexOf(ObjectType.Table) >= 0) {
                return(ObjectType.Table)
             }
             if (CurrDoc.lineAt(i).text.indexOf(ObjectType.Page) >= 0) {
                return(ObjectType.Page)
             }
             return ObjectType.NoProcess;

        }
    }
}