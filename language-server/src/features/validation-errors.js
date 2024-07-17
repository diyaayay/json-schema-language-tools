import * as Browser from "@hyperjump/browser";
import * as SchemaNode from "../schema-node.js";
import { subscribe, unsubscribe } from "../pubsub.js";

/**
 * @import * as Type from "./validation-errors.js"
 * @import { Feature } from "../build-server.js"
 */


/** @type string */
let subscriptionToken;

/** @type Feature */
export default {
  load() {
    subscriptionToken = subscribe("diagnostics", async (_message, { schemaDocument, diagnostics }) => {
      for await (const [instance, message] of invalidNodes(schemaDocument.errors)) {
        diagnostics.push({ instance, message });
      }
    });
  },

  onInitialize() {
    return {};
  },

  async onInitialized() {
  },

  onShutdown() {
    unsubscribe("diagnostics", subscriptionToken);
  }
};

/** @type Type.invalidNodes */
const invalidNodes = async function* (errors) {
  for (const error of errors) {
    for await (const message of toErrorMessage(error)) {
      yield [error.instanceNode, message];
    }
  }
};

/** @type Type.toErrorMessage */
const toErrorMessage = async function* (error) {
  if (error.message) {
    yield error.message;
  } else if (error.keyword === "https://json-schema.org/keyword/additionalProperties") {
    // Skip
  } else if (error.keyword === "https://json-schema.org/keyword/allOf") {
    // Skip
  } else if (error.keyword === "https://json-schema.org/keyword/anyOf") {
    // Skip
  } else if (error.keyword === "https://json-schema.org/keyword/const") {
    const constValue = Browser.value(error.keywordNode);
    yield `Expected : ${JSON.stringify(constValue)}`;
  } else if (error.keyword === "https://json-schema.org/keyword/contains") {
    // Skip
  } else if (error.keyword === "https://json-schema.org/keyword/dependentRequired") {
    const dependentRequired = Browser.value(error.keywordNode);

    const object = SchemaNode.value(error.instanceNode);
    for (const propertyName in dependentRequired) {
      if (propertyName in object) {
        for (const required of dependentRequired[propertyName]) {
          if (!(required in object)) {
            yield `Property ${required} is required.`;
          }
        }
      }
    }
  } else if (error.keyword === "https://json-schema.org/keyword/dynamicRef") {
    // Skip
  } else if (error.keyword === "https://json-schema.org/keyword/draft-2020-12/dynamicRef") {
    // Skip
  } else if (error.keyword === "https://json-schema.org/keyword/enum") {
    /** @type unknown[] */
    const enumValue = Browser.value(error.keywordNode);
    yield `Expected one of: ${toListMessage(enumValue.map((value) => JSON.stringify(value)))}`;
  } else if (error.keyword === "https://json-schema.org/keyword/exclusiveMaximum") {
    const exclusiveMaximum = Browser.value(error.keywordNode);
    yield `Must be less than ${exclusiveMaximum}`;
  } else if (error.keyword === "https://json-schema.org/keyword/exclusiveMinimum") {
    const exclusiveMinimum = Browser.value(error.keywordNode);
    yield `Must be greater than ${exclusiveMinimum}`;
  } else if (error.keyword === "https://json-schema.org/keyword/items") {
    // Skip
  } else if (error.keyword === "https://json-schema.org/keyword/maxItems") {
    const maxItems = Browser.value(error.keywordNode);
    yield `A maximum of ${maxItems} items are allowed`;
  } else if (error.keyword === "https://json-schema.org/keyword/maxLength") {
    const maxLength = Browser.value(error.keywordNode);
    yield `A maximum of ${maxLength} characters are allowed.`;
  } else if (error.keyword === "https://json-schema.org/keyword/maxProperties") {
    const maxProperties = Browser.value(error.keywordNode);
    yield `A maximum of ${maxProperties} properties are allowed.`;
  } else if (error.keyword === "https://json-schema.org/keyword/maximum") {
    const maximum = Browser.value(error.keywordNode);
    yield `Must be less than or equal to ${maximum}`;
  } else if (error.keyword === "https://json-schema.org/keyword/minItems") {
    const minItems = Browser.value(error.keywordNode);
    yield `A minimum of ${minItems} items are required`;
  } else if (error.keyword === "https://json-schema.org/keyword/minLength") {
    const minLength = Browser.value(error.keywordNode);
    yield `A minimum of ${minLength} characters are required`;
  } else if (error.keyword === "https://json-schema.org/keyword/minProperties") {
    const minProperties = Browser.value(error.keywordNode);
    yield `A minimum of ${minProperties} properties are required`;
  } else if (error.keyword === "https://json-schema.org/keyword/minimum") {
    const minimum = Browser.value(error.keywordNode);
    yield `Must be greater than or equal to ${minimum}`;
  } else if (error.keyword === "https://json-schema.org/keyword/multipleOf") {
    const multipleOf = Browser.value(error.keywordNode);
    yield `Must be a multiple of ${multipleOf}`;
  } else if (error.keyword === "https://json-schema.org/keyword/pattern") {
    const pattern = Browser.value(error.keywordNode);
    yield `Must match the pattern /${pattern.replace("/", "\\/")}/`;
  } else if (error.keyword === "https://json-schema.org/keyword/prefixItems") {
    // Skip
  } else if (error.keyword === "https://json-schema.org/keyword/properties") {
    // Skip
  } else if (error.keyword === "https://json-schema.org/keyword/propertyNames") {
    yield `Object contains invalid property names`;
  } else if (error.keyword === "https://json-schema.org/keyword/ref") {
    // Skip
  } else if (error.keyword === "https://json-schema.org/keyword/required") {
    const required = Browser.value(error.keywordNode);

    const object = SchemaNode.value(error.instanceNode);
    for (const propertyName of required) {
      if (!(propertyName in object)) {
        yield `Property ${propertyName} is required.`;
      }
    }
  } else if (error.keyword === "https://json-schema.org/keyword/type") {
    const type = Browser.value(error.keywordNode);
    if (Array.isArray(type)) {
      yield `Expected ${["a", "o"].includes(type[0][0]) ? "an" : "a"} ${toListMessage(type)}`;
    } else {
      yield `Expected ${["a", "o"].includes(type[0]) ? "an" : "a"} ${type}`;
    }
  } else if (error.keyword === "https://json-schema.org/keyword/unevaluatedItems") {
    // Skip
  } else if (error.keyword === "https://json-schema.org/keyword/unevaluatedProperties") {
    // Skip
  } else if (error.keyword === "https://json-schema.org/keyword/uniqueItems") {
    // const items = SchemaNode.value(error.instanceNode);
    yield `Expected all items to be unique.`;
  } else if (error.keyword === "https://json-schema.org/keyword/draft-04/dependencies") {
    const dependencies = Browser.value(error.keywordNode);
    for (const property in dependencies) {
      if (Array.isArray(dependencies[property])) {
        const required = dependencies[property];

        const object = SchemaNode.value(error.instanceNode);
        for (const propertyName of required) {
          if (!(propertyName in object)) {
            yield `Property "${propertyName}" is required`;
          }
        }
      }
    }
  } else if (error.keyword === "https://json-schema.org/evaluation/validate") {
    if (Browser.value(error.keywordNode) === false) {
      yield `No value allowed`;
    }
  } else {
    const keyword = error.keywordNode.cursor.split("/").pop();
    yield `Fails JSON Schema constraint '${keyword}'`;
  }
};

/** @type (list: string[]) => string */
const toListMessage = (list) => {
  if (list.length === 1) {
    return list[0];
  } else if (list.length === 2) {
    return `${list[0]} or ${list[1]}`;
  } else {
    const lastItem = list.pop();
    const result = list.join(", ");
    return `${result}, or ${lastItem}`;
  }
};
