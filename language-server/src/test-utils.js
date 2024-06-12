import { Duplex } from "node:stream";
import { DidOpenTextDocumentNotification, createConnection } from "vscode-languageserver/node";
import { buildServer } from "./build-server.js";


export class TestStream extends Duplex {
  _write(chunk, _encoding, done) {
    this.emit("data", chunk);
    done();
  }

  _read(_size) {
  }
}

export const getTestClient = (features) => {
  const up = new TestStream();
  const down = new TestStream();

  const server = createConnection(up, down);
  buildServer(server, features);

  const client = createConnection(down, up);
  client.listen();

  return client;
};

export const openDocument = async (client, uri, text) => {
  /**
   * @type {import("vscode-languageserver/node.js").DidOpenTextDocumentParams}
   */
  const openParams = {
    textDocument: {
      uri: uri,
      languageId: "json",
      version: 0,
      text: text
    }
  };
  await client.sendNotification(DidOpenTextDocumentNotification.type, openParams);
};

export const clientCapabilities = {
  workspace: {
    applyEdit: true,
    workspaceEdit: {
      documentChanges: true,
      resourceOperations: ["create", "rename", "delete"],
      failureHandling: "textOnlyTransactional",
      normalizesLineEndings: true,
      changeAnnotationSupport: { groupsOnLabel: true }
    },
    configuration: true,
    didChangeWatchedFiles: {
      dynamicRegistration: true,
      relativePatternSupport: true
    },
    symbol: {
      dynamicRegistration: true,
      symbolKind: {
        valueSet: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]
      },
      tagSupport: {
        valueSet: [1]
      },
      resolveSupport: {
        properties: ["location.range"]
      }
    },
    codeLens: {
      refreshSupport: true
    },
    executeCommand: {
      dynamicRegistration: true
    },
    didChangeConfiguration: {
      dynamicRegistration: true
    },
    workspaceFolders: true,
    foldingRange: {
      refreshSupport: true
    },
    semanticTokens: {
      refreshSupport: true
    },
    fileOperations: {
      dynamicRegistration: true,
      didCreate: true,
      didRename: true,
      didDelete: true,
      willCreate: true,
      willRename: true,
      willDelete: true
    },
    inlineValue: {
      refreshSupport: true
    },
    inlayHint: {
      refreshSupport: true
    },
    diagnostics: {
      refreshSupport: true
    }
  },
  textDocument: {
    publishDiagnostics: {
      relatedInformation: true,
      versionSupport: false,
      tagSupport: {
        valueSet: [1, 2]
      },
      codeDescriptionSupport: true,
      dataSupport: true
    },
    synchronization: {
      dynamicRegistration: true,
      willSave: true,
      willSaveWaitUntil: true,
      didSave: true
    },
    completion: {
      dynamicRegistration: true,
      contextSupport: true,
      completionItem: {
        snippetSupport: true,
        commitCharactersSupport: true,
        documentationFormat: ["markdown", "plaintext"],
        deprecatedSupport: true,
        preselectSupport: true,
        tagSupport: {
          valueSet: [1]
        },
        insertReplaceSupport: true,
        resolveSupport: {
          properties: ["documentation", "detail", "additionalTextEdits"]
        },
        insertTextModeSupport: {
          valueSet: [1, 2]
        },
        labelDetailsSupport: true
      },
      insertTextMode: 2,
      completionItemKind: {
        valueSet: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
      },
      completionList: {
        itemDefaults: [
          "commitCharacters",
          "editRange",
          "insertTextFormat",
          "insertTextMode",
          "data"
        ]
      }
    },
    hover: {
      dynamicRegistration: true,
      contentFormat: ["markdown", "plaintext"]
    },
    signatureHelp: {
      dynamicRegistration: true,
      signatureInformation: {
        documentationFormat: ["markdown", "plaintext"],
        parameterInformation: {
          labelOffsetSupport: true
        },
        activeParameterSupport: true
      },
      contextSupport: true
    },
    definition: {
      dynamicRegistration: true,
      linkSupport: true
    },
    references: {
      dynamicRegistration: true
    },
    documentHighlight: {
      dynamicRegistration: true
    },
    documentSymbol: {
      dynamicRegistration: true,
      symbolKind: {
        valueSet: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]
      },
      hierarchicalDocumentSymbolSupport: true,
      tagSupport: {
        valueSet: [1]
      },
      labelSupport: true
    },
    codeAction: {
      dynamicRegistration: true,
      isPreferredSupport: true,
      disabledSupport: true,
      dataSupport: true,
      resolveSupport: {
        properties: ["edit"]
      },
      codeActionLiteralSupport: {
        codeActionKind: {
          valueSet: [
            "",
            "quickfix",
            "refactor",
            "refactor.extract",
            "refactor.inline",
            "refactor.rewrite",
            "source",
            "source.organizeImports"
          ]
        }
      },
      honorsChangeAnnotations: true
    },
    codeLens: {
      dynamicRegistration: true
    },
    formatting: {
      dynamicRegistration: true
    },
    rangeFormatting: {
      dynamicRegistration: true,
      rangesSupport: true
    },
    onTypeFormatting: {
      dynamicRegistration: true
    },
    rename: {
      dynamicRegistration: true,
      prepareSupport: true,
      prepareSupportDefaultBehavior: 1,
      honorsChangeAnnotations: true
    },
    documentLink: {
      dynamicRegistration: true,
      tooltipSupport: true
    },
    typeDefinition: {
      dynamicRegistration: true,
      linkSupport: true
    },
    implementation: {
      dynamicRegistration: true,
      linkSupport: true
    },
    colorProvider: {
      dynamicRegistration: true
    },
    foldingRange: {
      dynamicRegistration: true,
      rangeLimit: 5000,
      lineFoldingOnly: true,
      foldingRangeKind: {
        valueSet: ["comment", "imports", "region"]
      },
      foldingRange: {
        collapsedText: false
      }
    },
    declaration: {
      dynamicRegistration: true,
      linkSupport: true
    },
    selectionRange: {
      dynamicRegistration: true
    },
    callHierarchy: {
      dynamicRegistration: true
    },
    semanticTokens: {
      dynamicRegistration: true,
      tokenTypes: [
        "namespace",
        "type",
        "class",
        "enum",
        "interface",
        "struct",
        "typeParameter",
        "parameter",
        "variable",
        "property",
        "enumMember",
        "event",
        "function",
        "method",
        "macro",
        "keyword",
        "modifier",
        "comment",
        "string",
        "number",
        "regexp",
        "operator",
        "decorator"
      ],
      tokenModifiers: [
        "declaration",
        "definition",
        "readonly",
        "static",
        "deprecated",
        "abstract",
        "async",
        "modification",
        "documentation",
        "defaultLibrary"
      ],
      formats: [
        "relative"
      ],
      requests: {
        range: true,
        full: { delta: true }
      },
      multilineTokenSupport: false,
      overlappingTokenSupport: false,
      serverCancelSupport: true,
      augmentsSyntaxTokens: true
    },
    linkedEditingRange: {
      dynamicRegistration: true
    },
    typeHierarchy: {
      dynamicRegistration: true
    },
    inlineValue: {
      dynamicRegistration: true
    },
    inlayHint: {
      dynamicRegistration: true,
      resolveSupport: {
        properties: [
          "tooltip",
          "textEdits",
          "label.tooltip",
          "label.location",
          "label.command"
        ]
      }
    },
    diagnostic: {
      dynamicRegistration: true,
      relatedDocumentSupport: false
    }
  },
  window: {
    showMessage: {
      messageActionItem: {
        additionalPropertiesSupport: true
      }
    },
    showDocument: { support: true },
    workDoneProgress: true
  },
  general: {
    staleRequestSupport: {
      cancel: true,
      retryOnContentModified: [
        "textDocument/semanticTokens/full",
        "textDocument/semanticTokens/range",
        "textDocument/semanticTokens/full/delta"
      ]
    },
    regularExpressions: {
      engine: "ECMAScript",
      version: "ES2020"
    },
    markdown: {
      parser: "marked",
      version: "1.1.0"
    },
    positionEncodings: ["utf-16"]
  },
  notebookDocument: {
    synchronization: {
      dynamicRegistration: true,
      executionSummarySupport: true
    }
  }
};
