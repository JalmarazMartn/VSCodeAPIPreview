const vscode = require('vscode');
module.exports =
{
    GetWorkSpaceSymbols: async function () {
        GetWorkSpaceSymbols();
    },
    PrintDocumentSymbols: async function () {
        PrintDocumentSymbols();
    },
    GetDocumentVariables: async function () {
        await GetDocumentVariables();
    },
    GetDocumentProcedures: async function () {
        GetDocumentProcedures();
    },
    getLocalVariables: async function () {
        await getLocalVariables();
        await testVarCount();
    }

}
async function GetWorkSpaceSymbols() {
    //vscode.commands.executeCommand("vscode.executeWorkspaceSymbolProvider","Whse. Asistant Mngt").then(
    //    function (symbols) {
    //        console.log('symbols');
    //    }
    //);
    let symbols = await vscode.commands.executeCommand("vscode.executeWorkspaceSymbolProvider", "");
    console.log(symbols);
}
async function PrintDocumentSymbols() {
    //vscode.commands.executeCommand("vscode.executeWorkspaceSymbolProvider","Whse. Asistant Mngt").then(
    //    function (symbols) {
    //        console.log('symbols');
    //    }
    //);    
    console.log(GetDocumentSymbols());

}
async function GetDocumentSymbols() {
    let document = vscode.window.activeTextEditor.document;
    const documentSymbols = await vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", document.uri);
    return documentSymbols;

}
async function GetDocumentVariables() {
    let allVariables = [];
    const documentSymbols = await GetDocumentSymbols();

    const docFirstChildren = documentSymbols[0].children[0];
    if (!docFirstChildren.name) {
        return allVariables;
    }
    if (docFirstChildren.name != 'var') {
        return allVariables;
    }
    //
    const fromLine = docFirstChildren.range.start.line;
    const ToLine = docFirstChildren.range.end.line;
    const document 
    = vscode.window.activeTextEditor.document;
    for (let index = fromLine; index <= ToLine; index++) {
        const element = document.lineAt(index).text;
        const lineVariables = getVariablesFromLineText(element, 'var');
        pushArrayIntoArray(lineVariables, allVariables);
    }

    console.log(allVariables);
    return allVariables;
}
async function GetDocumentProcedures() {
    let allProcedures = [];
    const documentSymbols = await GetDocumentSymbols();
    const docChildren = documentSymbols[0].children;
    for (let index = 0; index < docChildren.length; index++) {
        const element = docChildren[index];
        if (element.name != 'var') {
            allProcedures.push({
                "name": element.name,
                "lineFrom": element.location.range.start.line,
                "lineTo": element.location.range.end.line
            });
        }
    }
    return allProcedures;
}
async function testVarCount()
{
    const localVars = await getLocalVariables();
    let allVariables = await GetDocumentVariables();
    pushArrayIntoArray(localVars,allVariables);
    for (let index = 0; index < localVars.length; index++) {
        const element = localVars[index];
        console.log(element.subtype + ' count ' + await getSubtypeCount(element.subtype,allVariables));
    }
}
async function getLocalVariables() {
    let localVariables = [];
    const procedures = await GetDocumentProcedures();
    const currentLineNumber = vscode.window.activeTextEditor.selections[0].start.line;
    const currentProcedure = procedures.filter(x => x.lineFrom <= currentLineNumber && x.lineTo >= currentLineNumber);
    if (!currentProcedure) {
        return localVariables;
    }

    const document = vscode.window.activeTextEditor.document;
    for (let index = currentProcedure[0].lineFrom; index <= currentProcedure[0].lineTo; index++) {
        const docLineText = document.lineAt(index).text;
        const lineVariables = getVariablesFromLineText(docLineText, currentProcedure[0].name);
        pushArrayIntoArray(lineVariables, localVariables);
    }
    console.log(localVariables);
    return localVariables;
}
function GetRegExpVarDeclaration(isGlobal = false) {
    let searchParams = 'i';
    if (isGlobal) { searchParams = 'gi'; }
    const G1Spaces = new RegExp(/(\s*)/.source);
    const G2ByRef = new RegExp(/(var|.{0})/.source);
    const G2NewLine = new RegExp(/($|.{0})/.source);
    const G2Spaces = new RegExp(/(\s*)/.source);
    const G3VarName = new RegExp(/([A-Za-z\s0-9"]*):\s*/.source);
    const G4VarType = new RegExp(/(Record|Page|TestPage|Report|Codeunit|Query|XmlPort|Enum|TestRequestPage)/.source);
    const G5VarSubType = new RegExp(/\s*([A-Za-z\s0-9"-\/]*)/.source);
    const G6EndStat = new RegExp(/(\)|;)/.source);
    //const G6EndStat = new RegExp(/(\)|;|.{0})/.source);	

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
function getVariablesFromLineText(docLineText = '', scope = '') {
    let lineVariables = [];
    const regExpVarDeclaration = GetRegExpVarDeclaration(true);
    var varDecMatches = docLineText.match(regExpVarDeclaration);
    if (varDecMatches) {
        //subscriptionOnDidChange.dispose();//new
        for (var j = 0; j < Object.keys(varDecMatches).length; j++) {
            const singleMatch = varDecMatches[j].match(GetRegExpVarDeclaration(false));            
            lineVariables.push({
                "name": varDecMatches[j],
                "scope": scope,
                "type": singleMatch[6],
                "subtype": singleMatch[7]
            });
        }
    }
    return lineVariables;
}
function pushArrayIntoArray(fromArray, toArray) {
    if (fromArray) {
        for (let j = 0; j < fromArray.length; j++) {
            const element = fromArray[j];
            toArray.push(element);
        }
    }
}
async function getSubtypeCount(currSubtype='',variableArray)
{    
    const subtypeOcurrences = variableArray.filter(x => x.subtype == currSubtype);
    return subtypeOcurrences.length;
}