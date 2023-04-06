import { Configuration, OpenAIApi } from "openai";
import {
  ExtensionContext,
  Hover,
  MarkdownString,
  Uri,
  commands,
  languages,
  window,
} from "vscode";

const apiKey = "YOUR_API_KEY";

export function activate(context: ExtensionContext) {
  let selectedText: string;

  // initialize test
  context.subscriptions.push(
    commands.registerCommand("demo.initialize", () => {
      window.showInformationMessage("Initialized successfully!");
    })
  );

  // get selected text and hover block
  context.subscriptions.push(
    languages.registerHoverProvider(["solidity"], {
      provideHover(document, position, token) {
        const editor = window.activeTextEditor;
        if (!editor) {
          window.showErrorMessage("No active editor");
          return;
        }
        // get selected text
        selectedText = document.getText(editor.selection);
        if (selectedText.length === 0) {
          return;
        }

        // create hover block
        const codeBlockContent = new MarkdownString();
        codeBlockContent.appendCodeblock(selectedText, document.languageId);
        const sendRequestUri = Uri.parse(`command:demo.sendRequest`);
        const command = new MarkdownString(
          `[What is this? 🤔](${sendRequestUri})`
        );
        command.isTrusted = true;
        return new Hover([codeBlockContent, command]);
      },
    })
  );

  context.subscriptions.push(
    commands.registerCommand("demo.sendRequest", async () => {
      const question = `In solidity programming language, when to use ${selectedText}?`;
      await sendRequest(question);
    })
  );
}

export const sendRequest = async (requestMsg: any) => {
  const configuration = new Configuration({
    apiKey: apiKey,
  });

  const openai = new OpenAIApi(configuration);
  console.log(requestMsg);
  let request: any = {
    model: "text-davinci-003",
    prompt: requestMsg,
    temperature: 0,
    max_tokens: 100,
  };
  let res = await openai.createCompletion(request);
  window.showInformationMessage(`${res.data.choices[0].text}`);
};

export function deactivate() {}
