const vscode = require('vscode');
module.exports =
{
    GetWorkSpaceSymbols: async function () {
        GetWorkSpaceSymbols();
    },
    PrintDocumentSymbols: async function () {
        PrintDocumentSymbols();
    },
    GetDocumentVariables : async function () {
        GetDocumentVariables();
    },
    GetDocumentProcedures : async function () {
        GetDocumentProcedures();
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
    return await vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", document.uri);
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
    console.log(documentSymbols);
    const docChildren = documentSymbols[0].children;
            for (let index = 0; index < docChildren.length; index++) {
                const element = docChildren[index];
                if (element.name != 'var')
                {
                allProcedures.push({
                    "name": element.name,
                    "lineFrom": element.location.range.start.line,
                    "lineTo": element.location.range.end.line
                });
            }
    }
    console.log(allProcedures);
    return allProcedures;
}