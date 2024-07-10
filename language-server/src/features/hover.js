import { MarkupKind } from "vscode-languageserver";
import * as SchemaDocument from "../schema-document.js";
import * as SchemaNode from "../schema-node.js";
import { getSchemaDocument } from "./schema-registry.js";

/** @import { Feature } from "../build-server.js" */


const annotationDialectUri = "https://json-schema.org/draft/2020-12/schema";

/** @type Feature */
export default {
  load(connection, documents) {
    connection.onHover(async ({ textDocument, position }) => {
      const document = documents.get(textDocument.uri);
      if (!document) {
        return;
      }

      const schemaDocument = await getSchemaDocument(connection, document);
      const offset = document.offsetAt(position);
      const keyword = SchemaDocument.findNodeAtOffset(schemaDocument, offset);

      // This is a little wierd because we want the hover to be on the keyword, but
      // the annotation is actually on the value not the keyword.
      if (keyword?.parent && SchemaNode.typeOf(keyword.parent) === "property" && keyword.parent.children[0] === keyword) {
        const description = SchemaNode.annotation(keyword.parent.children[1], "description", annotationDialectUri);
        if (description.length > 0) {
          return {
            contents: {
              kind: MarkupKind.Markdown,
              value: description.join("\n")
            },
            range: {
              start: document.positionAt(keyword.offset),
              end: document.positionAt(keyword.offset + keyword.textLength - 1)
            }
          };
        }
      }
    });
  },

  onInitialize() {
    return {
      hoverProvider: true
    };
  },

  async onInitialized() {
  },

  onShutdown() {
  }
};
