import * as SchemaDocument from "../schema-document.js";
import * as SchemaNode from "../schema-node.js";
import { getSchemaDocument, allSchemaDocuments } from "./schema-registry.js";
import { keywordNameFor } from "../util.js";

/** @import { Feature } from "../build-server.js" */
/** @import { SchemaNode as SchemaNodeType } from "../schema-node.js" */

/** @type Feature */
export default {
  load(connection, documents) {
    // const highlightBlockDialects = new Set([
    //   "http://json-schema.org/draft-04/schema",
    //   "http://json-schema.org/draft-06/schema",
    //   "http://json-schema.org/draft-07/schema"
    // ]);
    // const shouldHighlightBlock = (/** @type {string | undefined} */ uri) => {
    //   if (uri === undefined) {
    //     return false;
    //   }
    //   return highlightBlockDialects.has(uri);
    // };

    connection.onDefinition(async ({ textDocument, position }) => {
      const document = documents.get(textDocument.uri);
      if (!document) {
        return [];
      }

      const schemaDocument = await getSchemaDocument(connection, document);
      const offset = document.offsetAt(position);
      const node = SchemaDocument.findNodeAtOffset(schemaDocument, offset);

      if (!node) {
        return [];
      }

      const targetSchemaUri = SchemaNode.uri(node);
      const GotoDefinitions = [];

      for (const schemaDocument of allSchemaDocuments()) {
        for (const schemaResource of schemaDocument.schemaResources) {
          for (const definitionNode of definitions(schemaResource)) {
            const definition = SchemaNode.value(definitionNode);
            const definedSchema = SchemaNode.get(definition, schemaResource);
            if (!definedSchema) {
              continue;
            }

 // const hightlightNode = definitionNode;
            if (SchemaNode.uri(definedSchema) === targetSchemaUri) {
              GotoDefinitions.push({
                uri: schemaDocument.textDocument.uri,
                range: {
                  start: schemaDocument.textDocument.positionAt(definedSchema),
                  end: schemaDocument.textDocument.positionAt(definedSchema.offset + definedSchema.textLength)
                }
              });
            }
          }
        }
      }
      return GotoDefinitions;
    });
  },

  onInitialize() {
    return {
      definitionProvider: true
    };
  },

  async onInitialized() {
  },

  onShutdown() {
  }
};

 /** @type Type.definitions */
const definitions = function* (schemaResource) {
      // Define tokens or keywords used for definitions
  const definitionToken = keywordNameFor("https://json-schema.org/keyword/definitions", schemaResource.dialectUri);
  const DraftsDefinitionToken = keywordNameFor("https://json-schema.org/keyword/defs", schemaResource.dialectUri);

  for (const node of SchemaNode.allNodes(schemaResource)) {
    if (node.parent && SchemaNode.typeOf(node.parent) === "property") {
      const keyword = SchemaNode.value(node.parent.children[0]);
      if (keyword === definitionToken || keyword === DraftsDefinitionToken) {
        yield node;
      }
    }
  }
};
