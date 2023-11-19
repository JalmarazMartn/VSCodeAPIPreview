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
        GetDocumentVariables();
    },
    GetDocumentProcedures: async function () {
        GetDocumentProcedures();
    },
    getLocalVariables: async function () {
        getLocalVariables();
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
    console.log(documentSymbols);
    const docFirstChildren = documentSymbols[0].children[0];
    if (docFirstChildren.name) {
        if (docFirstChildren.name == 'var') {
            for (let index = 0; index < docFirstChildren.children.length; index++) {
                const element = docFirstChildren.children[index];
                allVariables.push({
                    "name": element.name,
                    "scope": 'var'
                });
            }
        }
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
        const element = document.lineAt(index).text;
        const regExpVarDeclaration = GetRegExpVarDeclaration(true);
        var varDecMatches = element.match(regExpVarDeclaration);
        if (varDecMatches) {
        //subscriptionOnDidChange.dispose();//new
        for (var j = 0; j < Object.keys(varDecMatches).length; j++) {
            localVariables.push({
                "name": varDecMatches[j],
                "scope": currentProcedure[0].name
            });            
        }
    }
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
    const G5VarSubType = new RegExp(/([A-Za-z\s0-9"-\/]*)/.source);
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
