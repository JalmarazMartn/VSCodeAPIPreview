const vscode = require('vscode');

async function getRegex() {
    const explanation = await vscode.window.showInputBox({ prompt: 'Enter regex explanation' });

    if (explanation) {
        const models = await vscode.lm.selectChatModels({
            vendor: 'copilot',
            family: 'gpt-4o'
        });
        let chatResponse;

        /*const messages = [
            vscode.LanguageModelChatMessage.User(`Generate a JavaScript regex for the following explanation: ${explanation}`)
        ];*/
        const messages = [            
            vscode.LanguageModelChatMessage.User('Intructions: input is regex explanation and output two strings: one with only the regular expressión and other with a match example'),
            vscode.LanguageModelChatMessage.User('Example: input: "12 digits" output: ["\\d{12}", "123456789012"]'),
            vscode.LanguageModelChatMessage.User('Generate a regex for the following explanation: ' + explanation),            
        ];

        try {
            chatResponse = await models[0].sendRequest(
                messages,
                {},
                new vscode.CancellationTokenSource().token
            );
           } catch (err) {
            if (err instanceof vscode.LanguageModelError) {
                console.log(err.message, err.code);
            } else {
                throw err;
            }
            return;
        }

        try {
            /*const regex = chatResponse.text;
            vscode.window.showInformationMessage(`Generated Regex: ${regex}`);*/
            let totalRegex = '';
            for await (const fragment of chatResponse.text) {
                totalRegex += fragment                
            }
            vscode.window.showInformationMessage(`Generated Regex: ${totalRegex}`);
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to generate regex: ${err.message}`);
        }
    }
}

module.exports = {
    getRegex
};