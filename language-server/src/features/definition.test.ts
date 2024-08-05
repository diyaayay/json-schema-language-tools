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
});
