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
} from "./chunk-FBPTH2Y5.js";
import "./chunk-6HSDOJ36.js";
import "./chunk-NG5MRGSS.js";
import "./chunk-TPUN2LSQ.js";
import "./chunk-L26OLIEL.js";
import "./chunk-X53SNBBT.js";
import "./chunk-XGMSOTFO.js";
import "./chunk-K4S5JWN2.js";
import "./chunk-POOGPENU.js";
import "./chunk-SQZIHOI3.js";
import "./chunk-XPNK5WJF.js";
import "./chunk-FCRM3VKC.js";
import "./chunk-KVDRY6BR.js";
import "./chunk-R7PF4YYZ.js";
import {
  createRailroadServices
} from "./chunk-ZM44SOHU.js";
import "./chunk-A6LJAYTS.js";
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

// node_modules/mermaid/dist/chunks/mermaid.core/railroadDiagram-Y72NRBL7.mjs
var langiumParser = createRailroadServices().Railroad.parser.LangiumParser;
var transformExpression = __name((expr) => {
  switch (expr.$type) {
    case "RailroadTerminalExpr":
      return {
        type: "terminal",
        value: expr.value
      };
    case "RailroadNonTerminalExpr":
      return {
        type: "nonterminal",
        name: expr.name
      };
    case "RailroadSpecialExpr":
      return {
        type: "special",
        text: expr.text
      };
    case "RailroadSequenceExpr": {
      const elements = expr.elements.map(transformExpression);
      return elements.length === 1 ? elements[0] : { type: "sequence", elements };
    }
    case "RailroadChoiceExpr": {
      const alternatives = expr.alternatives.map(transformExpression);
      return alternatives.length === 1 ? alternatives[0] : { type: "choice", alternatives };
    }
    case "RailroadOptionalExpr":
      return {
        type: "optional",
        element: transformExpression(expr.element)
      };
    case "RailroadOneOrMoreExpr":
      return {
        type: "repetition",
        element: transformExpression(expr.element),
        min: 1,
        max: Infinity
      };
    case "RailroadZeroOrMoreExpr":
      return {
        type: "repetition",
        element: transformExpression(expr.element),
        min: 0,
        max: Infinity
      };
    default:
      throw new Error(`Unsupported railroad expression: ${expr.$type}`);
  }
}, "transformExpression");
var transformRule = __name((rule) => {
  return {
    name: rule.name,
    definition: transformExpression(rule.definition)
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
    log.debug("[Railroad Parser] Starting Langium parse");
    const result = langiumParser.parse(input);
    if (result.lexerErrors.length > 0 || result.parserErrors.length > 0) {
      throw new MermaidParseError(result);
    }
    const ast = result.value;
    log.debug("[Railroad Parser] Parsed rules:", ast.rules.length);
    populateDb(ast);
    log.debug("[Railroad Parser] Parse complete");
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
var railroadDiagram_default = diagram;
export {
  railroadDiagram_default as default,
  diagram
};
//# sourceMappingURL=railroadDiagram-Y72NRBL7-XQP2TWKY.js.map
