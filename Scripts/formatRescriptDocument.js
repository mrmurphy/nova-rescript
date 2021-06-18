const { notifyUserOfError } = require("./errors");

function runFormat(unformattedText) {
  let error = "";
  let formattedDoc = "";

  const process = new Process("rescript", {
    args: ["format", "-stdin", ".res"],
    stdio: ["pipe", "pipe", "pipe"],
    shell: true,
  });

  return new Promise((resolve, reject) => {
    const [stdin, stdout, stderr] = process.stdio;
    const writer = stdin.getWriter();

    writer.ready
      .then(() => {
        return writer.write(unformattedText);
      })
      .then(writer.close());

    process.onStdout(function (line) {
      formattedDoc += line;
    });

    process.onStderr(function (line) {
      error += line;
      console.log("Error with rescript format: " + line);
    });

    process.onDidExit(function (code) {
      if (code !== 0) {
        reject(error);
        return;
      } else {
        resolve(formattedDoc);
      }
    });
    process.start();
  });
}

function getUnformattedText(editor) {
  const oldCursor = editor.selectedRange;
  const path = editor.document.path;
  const length = editor.document.length;
  const range = new Range(0, length);
  const unformattedText = editor.document.getTextInRange(range);
  return { unformattedText, range, oldCursor };
}

function formatRescriptDocument(editor) {
  if (editor.document.syntax !== "rescript") return Promise.resolve();

  const { unformattedText, range, oldCursor } = getUnformattedText(editor);

  return runFormat(unformattedText)
    .then((formattedDoc) => {
      editor
        .edit((editSession) => {
          editSession.replace(range, formattedDoc);
        })
        .then((a) => {
          editor.selectedRange = new Range(oldCursor.start, oldCursor.end);
          editor.scrollToCursorPosition();
          return a;
        });
    })
    .catch((error) => {
      console.error("error", error);
      notifyUserOfError(error);
    });
}

exports.formatRescriptDocument = formatRescriptDocument;
