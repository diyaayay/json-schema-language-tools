import type { SchemaNode } from "../schema-node.js";
import type { Feature } from "../build-server.js";


export const definitions: (schemaResource: SchemaNode) => Generator<SchemaNode>;

declare const definitionFeature: Feature;
export default definitionFeature;
