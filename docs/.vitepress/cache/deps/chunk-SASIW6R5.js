import {
  __name
} from "./chunk-QECRL6AR.js";

// node_modules/@mermaid-js/parser/dist/mermaid-parser.core.mjs
var parsers = {};
var initializers = {
  info: __name(async () => {
    const { createInfoServices: createInfoServices2 } = await import("./info-OHQRW6UA-BQS366GV.js");
    const parser = createInfoServices2().Info.parser.LangiumParser;
    parsers.info = parser;
  }, "info"),
  packet: __name(async () => {
    const { createPacketServices: createPacketServices2 } = await import("./packet-JDAUHWVQ-6MG5TKTC.js");
    const parser = createPacketServices2().Packet.parser.LangiumParser;
    parsers.packet = parser;
  }, "packet"),
  pie: __name(async () => {
    const { createPieServices: createPieServices2 } = await import("./pie-XZMESJXO-JWN4QE2N.js");
    const parser = createPieServices2().Pie.parser.LangiumParser;
    parsers.pie = parser;
  }, "pie"),
  treeView: __name(async () => {
    const { createTreeViewServices: createTreeViewServices2 } = await import("./treeView-D4JQ5SDB-JCFFXQV5.js");
    const parser = createTreeViewServices2().TreeView.parser.LangiumParser;
    parsers.treeView = parser;
  }, "treeView"),
  architecture: __name(async () => {
    const { createArchitectureServices: createArchitectureServices2 } = await import("./architecture-WOLXFQ4H-DZE34KAI.js");
    const parser = createArchitectureServices2().Architecture.parser.LangiumParser;
    parsers.architecture = parser;
  }, "architecture"),
  gitGraph: __name(async () => {
    const { createGitGraphServices: createGitGraphServices2 } = await import("./gitGraph-VSP46ZUC-APIHZN3V.js");
    const parser = createGitGraphServices2().GitGraph.parser.LangiumParser;
    parsers.gitGraph = parser;
  }, "gitGraph"),
  eventmodeling: __name(async () => {
    const { createEventModelingServices: createEventModelingServices2 } = await import("./eventmodeling-K75KTNOO-SN2NL277.js");
    const parser = createEventModelingServices2().EventModel.parser.LangiumParser;
    parsers.eventmodeling = parser;
  }, "eventmodeling"),
  radar: __name(async () => {
    const { createRadarServices: createRadarServices2 } = await import("./radar-ABXABTNO-2UV37SJB.js");
    const parser = createRadarServices2().Radar.parser.LangiumParser;
    parsers.radar = parser;
  }, "radar"),
  railroad: __name(async () => {
    const { createRailroadServices: createRailroadServices2 } = await import("./railroad-I3PHUGI6-6UHAJBVZ.js");
    const parser = createRailroadServices2().Railroad.parser.LangiumParser;
    parsers.railroad = parser;
  }, "railroad"),
  railroadEbnf: __name(async () => {
    const { createRailroadEbnfServices: createRailroadEbnfServices2 } = await import("./railroad-ebnf-DWYD2UWJ-7DXF34CT.js");
    const parser = createRailroadEbnfServices2().RailroadEbnf.parser.LangiumParser;
    parsers.railroadEbnf = parser;
  }, "railroadEbnf"),
  railroadAbnf: __name(async () => {
    const { createRailroadAbnfServices: createRailroadAbnfServices2 } = await import("./railroad-abnf-LNEFI6M7-BVBD3RPR.js");
    const parser = createRailroadAbnfServices2().RailroadAbnf.parser.LangiumParser;
    parsers.railroadAbnf = parser;
  }, "railroadAbnf"),
  railroadPeg: __name(async () => {
    const { createRailroadPegServices: createRailroadPegServices2 } = await import("./railroad-peg-JR7BVNR7-XCGFOKFY.js");
    const parser = createRailroadPegServices2().RailroadPeg.parser.LangiumParser;
    parsers.railroadPeg = parser;
  }, "railroadPeg"),
  treemap: __name(async () => {
    const { createTreemapServices: createTreemapServices2 } = await import("./treemap-SAJKECNS-5QALY446.js");
    const parser = createTreemapServices2().Treemap.parser.LangiumParser;
    parsers.treemap = parser;
  }, "treemap"),
  wardley: __name(async () => {
    const { createWardleyServices: createWardleyServices2 } = await import("./wardley-7MLQ67FV-ZT6PEEQX.js");
    const parser = createWardleyServices2().Wardley.parser.LangiumParser;
    parsers.wardley = parser;
  }, "wardley"),
  cynefin: __name(async () => {
    const { createCynefinServices: createCynefinServices2 } = await import("./cynefin-EF2NZ3EQ-XIGCC4GL.js");
    const parser = createCynefinServices2().Cynefin.parser.LangiumParser;
    parsers.cynefin = parser;
  }, "cynefin")
};
async function parse(diagramType, text) {
  const initializer = initializers[diagramType];
  if (!initializer) {
    throw new Error(`Unknown diagram type: ${diagramType}`);
  }
  if (!parsers[diagramType]) {
    await initializer();
  }
  const parser = parsers[diagramType];
  const result = parser.parse(text);
  if (result.lexerErrors.length > 0 || result.parserErrors.length > 0) {
    throw new MermaidParseError(result);
  }
  return result.value;
}
__name(parse, "parse");
var formatLocation = __name((value) => value !== void 0 && value >= 0 ? value : "?", "formatLocation");
var _a;
var MermaidParseError = (_a = class extends Error {
  constructor(result) {
    const lexerErrors = result.lexerErrors.map((err) => {
      const line = formatLocation(err.line);
      const column = formatLocation(err.column);
      return `Lexer error on line ${line}, column ${column}: ${err.message}`;
    }).join("\n");
    const parserErrors = result.parserErrors.map((err) => {
      const line = formatLocation(err.token.startLine);
      const column = formatLocation(err.token.startColumn);
      return `Parse error on line ${line}, column ${column}: ${err.message}`;
    }).join("\n");
    super(`Parsing failed: ${lexerErrors} ${parserErrors}`);
    this.result = result;
  }
}, __name(_a, "MermaidParseError"), _a);

export {
  parse,
  MermaidParseError
};
//# sourceMappingURL=chunk-SASIW6R5.js.map
