import {
  db,
  getStyles,
  renderer
} from "./chunk-W7DKYKFN.js";
import {
  populateCommonDb
} from "./chunk-WRNCOHW6.js";
import {
  MermaidParseError
} from "./chunk-SASIW6R5.js";
import "./chunk-XGMSOTFO.js";
import "./chunk-KVDRY6BR.js";
import "./chunk-R7PF4YYZ.js";
import "./chunk-ZM44SOHU.js";
import "./chunk-6HSDOJ36.js";
import "./chunk-NG5MRGSS.js";
import {
  createRailroadPegServices
} from "./chunk-TPUN2LSQ.js";
import "./chunk-L26OLIEL.js";
import "./chunk-X53SNBBT.js";
import "./chunk-A6LJAYTS.js";
import "./chunk-K4S5JWN2.js";
import "./chunk-POOGPENU.js";
import "./chunk-SQZIHOI3.js";
import "./chunk-XPNK5WJF.js";
import "./chunk-FCRM3VKC.js";
import "./chunk-QECRL6AR.js";
import "./chunk-QT75QKXV.js";
import "./chunk-2LIHTLUD.js";
import {
  log
} from "./chunk-52RZ64HG.js";
import {
  __name
} from "./chunk-DTCXZATX.js";
import "./chunk-KEXKKQVW.js";

// node_modules/mermaid/dist/chunks/mermaid.core/pegDiagram-ECIUJNBX.mjs
var langiumParser = createRailroadPegServices().RailroadPeg.parser.LangiumParser;
var transformOrderedChoice = __name((choice) => {
  const alternatives = choice.alternatives.map(transformSequence);
  if (alternatives.length === 1) {
    return alternatives[0];
  }
  return {
    type: "choice",
    alternatives
  };
}, "transformOrderedChoice");
var transformSequence = __name((sequence) => {
  const elements = sequence.elements.map(transformPrefix);
  if (elements.length === 1) {
    return elements[0];
  }
  return {
    type: "sequence",
    elements
  };
}, "transformSequence");
var transformPrefix = __name((prefix) => {
  const inner = transformSuffix(prefix.suffix);
  if (!prefix.operator) {
    return inner;
  }
  const label = prefix.operator === "&" ? `&${nodeToLabel(inner)}` : `!${nodeToLabel(inner)}`;
  return {
    type: "special",
    text: label
  };
}, "transformPrefix");
var nodeToLabel = __name((node) => {
  switch (node.type) {
    case "terminal":
      return `"${node.value}"`;
    case "nonterminal":
      return node.name;
    case "special":
      return node.text;
    default:
      return "(...)";
  }
}, "nodeToLabel");
var transformSuffix = __name((suffix) => {
  const inner = transformPrimary(suffix.primary);
  if (!suffix.operator) {
    return inner;
  }
  switch (suffix.operator) {
    case "?":
      return { type: "optional", element: inner };
    case "*":
      return { type: "repetition", element: inner, min: 0, max: Infinity };
    case "+":
      return { type: "repetition", element: inner, min: 1, max: Infinity };
    default:
      throw new Error(`Unsupported PEG suffix operator: ${suffix.operator}`);
  }
}, "transformSuffix");
var transformPrimary = __name((primary) => {
  switch (primary.$type) {
    case "PegLiteral":
      return {
        type: "terminal",
        value: primary.value
      };
    case "PegIdentifier":
      return {
        type: "nonterminal",
        name: primary.name
      };
    case "PegGroup":
      return transformOrderedChoice(primary.element);
    case "PegAny":
      return {
        type: "special",
        text: primary.dot
      };
    default:
      throw new Error(`Unsupported PEG primary node: ${primary.$type}`);
  }
}, "transformPrimary");
var transformRule = __name((rule) => {
  return {
    name: rule.name,
    definition: transformOrderedChoice(rule.definition)
  };
}, "transformRule");
var populateDb = __name((ast) => {
  populateCommonDb(ast, db);
  if (ast.title) {
    db.setTitle(ast.title);
  }
  ast.rules.map((rule) => db.addRule(transformRule(rule)));
}, "populateDb");
var parser = {
  parse: __name((input) => {
    db.clear();
    log.debug("[PEG Parser] Starting Langium parse");
    const result = langiumParser.parse(input);
    if (result.lexerErrors.length > 0 || result.parserErrors.length > 0) {
      throw new MermaidParseError(result);
    }
    const ast = result.value;
    log.debug("[PEG Parser] Parsed rules:", ast.rules.length);
    populateDb(ast);
    log.debug("[PEG Parser] Parse complete");
  }, "parse"),
  parser: {
    yy: db
  }
};
var diagram = {
  parser,
  db,
  renderer,
  styles: getStyles
};
export {
  diagram
};
//# sourceMappingURL=pegDiagram-ECIUJNBX-HLDV4FGT.js.map
