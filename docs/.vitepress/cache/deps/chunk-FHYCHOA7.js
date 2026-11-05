import {
  insertLookDefs
} from "./chunk-4S75NWXS.js";
import {
  insertEdge,
  insertEdgeLabel,
  markers_default,
  positionEdgeLabel
} from "./chunk-PZKY2PQD.js";
import {
  insertCluster
} from "./chunk-6V6DASKV.js";
import {
  insertNode
} from "./chunk-NO4L25K4.js";
import {
  labelHelper
} from "./chunk-L2AGJDM5.js";
import {
  interpolateToCurve
} from "./chunk-EZF4VUFL.js";
import {
  common_default,
  getConfig
} from "./chunk-2LIHTLUD.js";
import {
  log
} from "./chunk-52RZ64HG.js";
import {
  __name
} from "./chunk-DTCXZATX.js";

// node_modules/mermaid/dist/chunks/mermaid.core/chunk-EJLWFMJV.mjs
var internalHelpers = {
  common: common_default,
  getConfig,
  insertCluster,
  insertEdge,
  insertEdgeLabel,
  insertMarkers: markers_default,
  insertNode,
  interpolateToCurve,
  labelHelper,
  log,
  positionEdgeLabel
};
var ELK_ALGORITHMS = [
  "elk.stress",
  "elk.force",
  "elk.mrtree",
  "elk.sporeOverlap",
  "elk.box",
  "elk.rectpacking"
];
var layoutAlgorithms = /* @__PURE__ */ Object.create(null);
var registerLayoutLoaders = __name((loaders) => {
  for (const loader of loaders) {
    layoutAlgorithms[loader.name] = loader;
  }
}, "registerLayoutLoaders");
var elkLayoutLoaders = __name(() => {
  const loader = __name(async () => await import("./elk-QONTBCTQ-XP5YTUS5.js"), "loader");
  return [
    { name: "elk", loader, algorithm: "elk.layered" },
    ...ELK_ALGORITHMS.map((algorithm) => ({ name: algorithm, loader, algorithm }))
  ];
}, "elkLayoutLoaders");
var registerDefaultLayoutLoaders = __name(() => {
  registerLayoutLoaders([
    {
      name: "dagre",
      loader: __name(async () => await import("./dagre-NK4GIZVX-VUUP26AW.js"), "loader")
    },
    {
      name: "swimlane",
      loader: __name(async () => await import("./swimlanes-B3ENRKFQ-OTBDSKDK.js"), "loader")
    },
    // elkjs is ~1.6 MB of source, so it is excluded from the tiny build along
    // with the other large features. `getRegisteredLayoutAlgorithm` then falls
    // back to dagre for diagrams that ask for an ELK layout there.
    ...true ? [
      {
        name: "cose-bilkent",
        loader: __name(async () => await import("./cose-bilkent-JH36ORCC-MO5KWLKN.js"), "loader")
      },
      ...elkLayoutLoaders()
    ] : []
  ]);
}, "registerDefaultLayoutLoaders");
registerDefaultLayoutLoaders();
var render = __name(async (data4Layout, svg) => {
  if (!Object.hasOwn(layoutAlgorithms, data4Layout.layoutAlgorithm)) {
    throw new Error(`Unknown layout algorithm: ${data4Layout.layoutAlgorithm}`);
  }
  if (data4Layout.diagramId) {
    for (const node of data4Layout.nodes) {
      const originalDomId = node.domId || node.id;
      node.domId = `${data4Layout.diagramId}-${originalDomId}`;
    }
  }
  const layoutDefinition = layoutAlgorithms[data4Layout.layoutAlgorithm];
  const layoutRenderer = await layoutDefinition.loader();
  insertLookDefs(svg, data4Layout.config);
  return layoutRenderer.render(data4Layout, svg, internalHelpers, {
    algorithm: layoutDefinition.algorithm
  });
}, "render");
var LAST_RESORT_LAYOUT = "dagre";
var getRegisteredLayoutAlgorithm = __name((algorithm = "", { fallback = LAST_RESORT_LAYOUT } = {}) => {
  if (Object.hasOwn(layoutAlgorithms, algorithm)) {
    return algorithm;
  }
  for (const candidate of [fallback, LAST_RESORT_LAYOUT]) {
    if (Object.hasOwn(layoutAlgorithms, candidate)) {
      log.warn(`Layout algorithm ${algorithm} is not registered. Using ${candidate} as fallback.`);
      return candidate;
    }
  }
  throw new Error(
    `Neither layout algorithm ${algorithm}, ${fallback}, nor ${LAST_RESORT_LAYOUT} is registered.`
  );
}, "getRegisteredLayoutAlgorithm");

export {
  registerLayoutLoaders,
  render,
  getRegisteredLayoutAlgorithm
};
//# sourceMappingURL=chunk-FHYCHOA7.js.map
