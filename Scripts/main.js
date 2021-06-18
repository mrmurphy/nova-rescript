var langserver = null;
const { formatRescriptDocument } = require("./formatRescriptDocument");

exports.activate = function () {
  // Do work when the extension is activated
  langserver = new RescriptLanguageServer();
};

exports.deactivate = function () {
  // Clean up state before the extension is deactivated
  if (langserver) {
    langserver.deactivate();
    langserver = null;
  }
};

class RescriptLanguageServer {
  constructor() {
    // Observe the configuration setting for the server's location, and restart the server on change
    nova.config.observe(
      "rescript.language-server-path",
      function (path) {
        console.log("server location changed.", path);
        this.start(path);
      },
      this
    );
    this.start();
  }

  deactivate() {
    this.stop();
  }

  start(path) {
    console.log("Re-starting the rescript server", path, new Date());
    if (this.languageClient) {
      this.languageClient.stop();
      nova.subscriptions.remove(this.languageClient);
    }

    // Use the default server path
    if (!path) {
      path = __dirname + "/server/out/server.sh";
    }

    // Create the client
    var serverOptions = {
      path: path,
    };
    var clientOptions = {
      // The set of document syntaxes for which the server is valid
      syntaxes: ["rescript"],
    };
    var client = new LanguageClient(
      "rescript-ls",
      "ReScript Language Server",
      serverOptions,
      clientOptions
    );

    try {
      // Start the client
      client.start();

      // Add the client to the subscriptions to be cleaned up
      nova.subscriptions.add(client);
      this.languageClient = client;

      client.onDidStop((err) => {
        if (err) {
          console.log("Reason language server stopped", err);
        }
      });
    } catch (err) {
      // If the .start() method throws, it's likely because the path to the language server is invalid
      console.error(err);
    }
  }

  stop() {
    if (this.languageClient) {
      this.languageClient.stop();
      nova.subscriptions.remove(this.languageClient);
      this.languageClient = null;
    }
  }
}

// For formatting on save
nova.workspace.onDidAddTextEditor((newEditor) => {
  return newEditor.onWillSave((editor) => {
    return formatRescriptDocument(editor).catch((error) => {
      notifyUserOfError(error);
    });
  });
});
