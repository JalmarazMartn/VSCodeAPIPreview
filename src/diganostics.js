const vscode = require('vscode');
module.exports = {
    
    GetDiagnostics: function () { return getDiagnosticsAllDoc()},
    getSelectionDiagnostics: function () { return getDiagnostics(true)}
}

function getDiagnostics(currSelectionOnly=false) {
    //const AppUri = vscode.workspace.workspaceFile;
    const AppUri = vscode.window.activeTextEditor.document.uri;
    const docDiagnostics = vscode.languages.getDiagnostics(AppUri);
    let AppDiagnostics = [];    
    if (currSelectionOnly)
    {
        const selectionDiagnostics = docDiagnostics.filter(x => x.range.start.line == vscode.window.activeTextEditor.selection.start.line);
        if (!selectionDiagnostics)
        {
            return AppDiagnostics;
        }
        AppDiagnostics = selectionDiagnostics;    
    }
    else
    {
        AppDiagnostics = docDiagnostics;    
    }        
    let Problems = [];
    for (let i = 0; i < AppDiagnostics.length; i++) {
        console.log(AppDiagnostics[i]);
        for (let j = 0; j < AppDiagnostics[i][1].length; j++) {
            let Problem = AppDiagnostics[i][1][j];
            let ProblemRange = Problem.range;
            Problems.push(
                {
                    FilePath: AppDiagnostics[i][0].path,
                    StarTLine: ProblemRange.start.line,
                    StartColumn: ProblemRange.start.character,
                    EndLine: ProblemRange.end.line,
                    EndColumn: ProblemRange.end.character,
                    MessageCode: getProblemMessageCode(Problem.code),
                    MessageDescription: Problem.message,
                    Severity: Problem.severity
                })
        }
    }
    console.log(Problems);
    return Problems;
}
function getDiagnosticsAllDoc() {
    return getDiagnostics(false);
}

function getProblemMessageCode(problemCode) {
    if (!problemCode.value) {
        return problemCode.toString();
    }
    return problemCode.value;

}
