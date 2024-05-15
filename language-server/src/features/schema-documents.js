import { getDocumentSettings } from "./document-settings.js";
import { JsonSchemaDocument } from "../json-schema-document.js";


export default {
  onInitialize() {
    return {};
  },

  onInitialized(_connection, documents) {
    documents.onDidClose(({ document }) => {
      schemaDocuments.delete(document.uri);
    });
  }
};

const schemaDocuments = new Map();

export const getSchemaDocument = async (connection, textDocument) => {
  let { version, schemaDocument } = schemaDocuments.get(textDocument.uri) ?? {};

  if (version === -1 || version !== textDocument.version) {
    const settings = await getDocumentSettings(connection, textDocument.uri);
    schemaDocument = await JsonSchemaDocument.fromTextDocument(textDocument, settings.defaultDialect);

    schemaDocuments.set(textDocument.uri, { version: textDocument.version, schemaDocument });
  }

  return schemaDocument;
};

export const clearSchemaDocuments = () => schemaDocuments.clear();

export const allSchemaDocuments = function* () {
  for (const { schemaDocument } of schemaDocuments.values()) {
    yield schemaDocument;
  }
};
