# Frontend learning path

Build a usable document before adding a type system, component runtime or full-stack framework. The shared domain is a small public course catalogue; P-328 grows it into an authenticated management screen. **All learner practice remains outstanding.**

## Reading order

1. [HTML, browser behavior and accessibility](./html-browser.md), then the ordered [accessibility lessons](../senior_growth/A11y/).
2. [CSS layout and cascade](../senior_growth/CSS/), including intrinsic sizing and visible interaction states.
3. [JavaScript ownership and asynchronous execution](./javascript.md), then [TypeScript contracts](./typescript.md).
4. [React rendering and synchronization](./react.md), followed by forms, routing and component contracts.
5. [Next.js and UI architecture](./next.md): use React and HTTP prerequisites before server/client caching or mutations.

[Coverage and ownership map](./coverage-map.md) identifies canonical explanations and overlap decisions. [Workbench](../workbench/frontend/) contains reference implementations; [practice sequence](../practice/frontend/) defines learner deliverables separately.

## Boundaries

Browser DOM, input, focus, layout and navigation belong here. [Node.js](../node-js/) owns server runtime mechanics, streams and backend/database/deployment implementation. [CS foundations](../cs-foundations/) owns algorithm correctness and complexity. [Applied AI](../applied-ai/) owns retrieval and agent systems; its existing React streaming port is an optional consumer of these UI foundations.

Redux, advanced conditional types, custom composite widgets, virtualization, microfrontends and framework migrations are optional after the essential path. Choose a tool to meet an observed requirement rather than implement every comparison in the reference catalogue.
