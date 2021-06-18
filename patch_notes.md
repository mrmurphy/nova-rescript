To get jump to definition working I had to patch server.js:

added

```javascript
function encodeUri(response) {
  if (response.result && response.result.uri) {
    let encoded = response.result.uri.split(" ").join("%20");
    return { ...response, result: { ...response.result, uri: encoded } };
  } else {
    return response;
  }
}
```

and then modified a bunch of the command responses to call that function before sending the response.

For example:

```javascript
function definition(msg) {
  // https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textDocument_definition
  let params = msg.params;
  let filePath = url_1.fileURLToPath(params.textDocument.uri);
  let response = utils.runAnalysisCommand(
    filePath,
    ["definition", filePath, params.position.line, params.position.character],
    msg
  );

  return encodeUri(response);
}
```
