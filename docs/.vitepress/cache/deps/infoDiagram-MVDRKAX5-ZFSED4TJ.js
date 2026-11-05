import {
  parse
} from "./chunk-SASIW6R5.js";
import "./chunk-XGMSOTFO.js";
import "./chunk-KVDRY6BR.js";
import "./chunk-R7PF4YYZ.js";
import "./chunk-ZM44SOHU.js";
import "./chunk-6HSDOJ36.js";
import "./chunk-NG5MRGSS.js";
import "./chunk-TPUN2LSQ.js";
import "./chunk-L26OLIEL.js";
import "./chunk-X53SNBBT.js";
import "./chunk-A6LJAYTS.js";
import "./chunk-K4S5JWN2.js";
import "./chunk-POOGPENU.js";
import "./chunk-SQZIHOI3.js";
import "./chunk-XPNK5WJF.js";
import "./chunk-FCRM3VKC.js";
import "./chunk-QECRL6AR.js";
import {
  selectSvgElement
} from "./chunk-QT75QKXV.js";
import {
  configureSvgSize
} from "./chunk-2LIHTLUD.js";
import {
  log
} from "./chunk-52RZ64HG.js";
import {
  __name
} from "./chunk-DTCXZATX.js";
import "./chunk-KEXKKQVW.js";

// node_modules/mermaid/dist/chunks/mermaid.core/infoDiagram-MVDRKAX5.mjs
var parser = {
  parse: __name(async (input) => {
    const ast = await parse("info", input);
    log.debug(ast);
  }, "parse")
};
var DEFAULT_INFO_DB = {
  version: "12.2.0" + (true ? "" : "-tiny")
};
var getVersion = __name(() => DEFAULT_INFO_DB.version, "getVersion");
var db = {
  getVersion
};
var draw = __name((text, id, version) => {
  log.debug("rendering info diagram\n" + text);
  const svg = selectSvgElement(id);
  configureSvgSize(svg, 100, 400, true);
  const group = svg.append("g");
  group.append("text").attr("x", 100).attr("y", 40).attr("class", "version").attr("font-size", 32).style("text-anchor", "middle").text(`v${version}`);
}, "draw");
var renderer = { draw };
var diagram = {
  parser,
  db,
  renderer
};
export {
  diagram
};
//# sourceMappingURL=infoDiagram-MVDRKAX5-ZFSED4TJ.js.map
