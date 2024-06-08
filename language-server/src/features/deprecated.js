import { DiagnosticSeverity, DiagnosticTag } from "vscode-languageserver";
import * as SchemaNode from "../schema-node.js";
import { subscribe } from "../pubsub.js";


const annotationDialectUri = "https://json-schema.org/draft/2020-12/schema";

export default {
  onInitialize() {
    return {};
  },

  onInitialized() {
    subscribe("diagnostics", async (_message, { schemaDocument, diagnostics }) => {
      for (const schemaResource of schemaDocument.schemaResources) {
        for (const deprecated of SchemaNode.annotatedWith(schemaResource, "deprecated", annotationDialectUri)) {
          if (SchemaNode.annotation(deprecated, "deprecated", annotationDialectUri).some((deprecated) => deprecated)) {
            diagnostics.push({
              instance: deprecated.parent,
              message: SchemaNode.annotation(deprecated, "x-deprecationMessage", annotationDialectUri).join("\n") || "deprecated",
              severity: DiagnosticSeverity.Warning,
              tags: [DiagnosticTag.Deprecated]
            });
          }
        }
      }
    });
  }
};
