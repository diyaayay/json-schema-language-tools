import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { DefinitionRequest } from "vscode-languageserver";
import { TestClient } from "../test-client.js";
import documentSettings from "./document-settings.js";
import schemaRegistry from "./schema-registry.js";
import workspace from "./workspace.js";
import definitionFeature from "./definition.js";

import type { DocumentSettings } from "./document-settings.js";


describe("Feature - Goto Definition", () => {
  let client: TestClient<DocumentSettings>;

  beforeEach(async () => {
    client = new TestClient([
      workspace,
      documentSettings,
      schemaRegistry,
      definitionFeature
    ]);
    await client.start();
  });

  afterEach(async () => {
    await client.stop();
  });

  test("no defintions", async () => {
    const documentUri = await client.openDocument("./subject.schema.json", `{}`);

    const response = await client.sendRequest(DefinitionRequest.type, {
      textDocument: { uri: documentUri },
      position: {
        line: 0,
        character: 1
      }
    });

    expect(response).to.eql([]);
  });

  test("don't return definitions that do not match location", async () => {
    const documentUri = await client.openDocument("./subject.schema.json", `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$ref": "#/$defs/locations", 
  "$defs": {
    "names": {
      
    },
    "locations": {
      
    }
  },
}`);

    const response = await client.sendRequest(DefinitionRequest.type, {
      textDocument: { uri: documentUri },
      position: {
        line: 2,
        character: 11
      }
    });

    expect(response).to.eql([{
      uri: documentUri,
      range: {
        start: { line: 7, character: 17 },
        end: { line: 9, character: 5 }
      }
    }]);
  });

  test("match one reference", async () => {
    const documentUri = await client.openDocument("./subject.schema.json", `{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$ref": "#/$defs/names", 
  "$defs":{
    "names": {
      
    }
  },
}`);

    const response = await client.sendRequest(DefinitionRequest.type, {
      textDocument: { uri: documentUri },
      position: {
        line: 2,
        character: 20
      }
    });

    expect(response).to.eql([
      {
        "uri": documentUri,
        "range": {
          "start": { "line": 4, "character": 13 },
          "end": { "line": 6, "character": 5 }
        }
      }
    ]);
  });
  test("match one definition", async () => {
    const documentUri = await client.openDocument("./subject.schema.json", `{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$ref": "#/$defs/names", 
  "$defs":{
    "names": {
      
    }
  },
}`);

    const response = await client.sendRequest(DefinitionRequest.type, {
      textDocument: { uri: documentUri },
      position: {
        line: 2,
        character: 18
      }
    });

    expect(response).to.eql([
      {
        "uri": documentUri,
        "range": {
          "start": { "line": 4, "character": 13 },
          "end": { "line": 6, "character": 5 }
        }
      }
    ]);
  });

  test("cross file definition", async () => {
    const documentUriA = await client.openDocument("./subjectA.schema.json", `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "person": {

    }
  }
}
`);
    const documentUriB = await client.openDocument("./subjectB.schema.json", `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "./subjectA.schema.json#/definitions/person"
}
`);

    const response = await client.sendRequest(DefinitionRequest.type, {
      textDocument: { uri: documentUriB },
      position: {
        line: 2,
        character: 20
      }
    });

    expect(response).to.eql([
      {
        "uri": documentUriA,
        "range": {
          "start": { "line": 3, "character": 14 },
          "end": { "line": 5, "character": 5 }
        }
      }
    ]);
  });

  test("match self identified externally", async () => {
    const documentUri = await client.openDocument("./subject.schema.json", `{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "$ref": "https://example.com/schemas/two#/definitions/names", 
}`);

    const documentUriB = await client.openDocument("./subjectB.schema.json", `{
  "$schema":"http://json-schema.org/draft-07/schema#", 
  "$id": "https://example.com/schemas/two", 
  "definitions":{
    "names": {
      
    }
  }
}`);

    const response = await client.sendRequest(DefinitionRequest.type, {
      textDocument: { uri: documentUri },
      position: {
        line: 2,
        character: 37
      }
    });

    expect(response).to.eql([
      {
        "uri": documentUriB,
        "range": {
          "start": { "line": 4, "character": 13 },
          "end": { "line": 6, "character": 5 }
        }
      }
    ]);
  });

  test("match self identified internally", async () => {
    const documentUri = await client.openDocument("./subject.schema.json", `{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/person.json",
  "type": "object",
  "properties": {
    "names": { "$ref": "https://example.com/person.json" }
   }  
}`);

    const response = await client.sendRequest(DefinitionRequest.type, {
      textDocument: { uri: documentUri },
      position: {
        line: 5,
        character: 30
      }
    });

    expect(response).to.eql([
      {
        "uri": documentUri,
        "range": {
          "start": { "line": 0, "character": 0 },
          "end": { "line": 7, "character": 1 }
        }
      }
    ]);
  });
});
