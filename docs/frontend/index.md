# Frontend learning path

Build a usable document before adding a type system, component runtime or full-stack framework. The shared domain is a small public course catalogue; P-328 grows it into an authenticated management screen. **All learner practice remains outstanding.**

## Frontend foundations

- [HTML, browser behavior and accessibility](./html-browser.md), then the ordered [accessibility lessons](../senior_growth/A11y/).
- [CSS layout and cascade](../senior_growth/CSS/), including intrinsic sizing and visible interaction states.
- [JavaScript ownership and asynchronous execution](./javascript.md), then [TypeScript contracts](./typescript.md).

## Components and application architecture

- [React rendering and synchronization](./react.md), followed by forms, routing and component contracts.
- [Next.js and UI architecture](./next.md): use React and HTTP prerequisites before server/client caching or mutations.

## Performance and senior investigation

Follow the required [frontend performance path](./performance/) after browser/JavaScript foundations, then apply the React/Next sections after those prerequisites. It merges the EPAM performance modules with existing references: measurement, loading and bundles, images, CSS/fonts, responsiveness and caching. Complete the [three performance hometasks](../practice/frontend/performance/) on the same application; optional specialist extensions follow observed needs.

## Examples, practice and verification

[Coverage and ownership map](./coverage-map.md) identifies canonical explanations and overlap decisions. [Workbench](../workbench/frontend/) contains reference implementations; [practice sequence](../practice/frontend/) defines learner deliverables separately. [Verification and limits](./verification.md) records the evidence behind the references.

## Boundaries

Browser DOM, input, focus, layout and navigation belong here. [Node.js](../node-js/) owns server runtime mechanics, streams and backend/database/deployment implementation. [CS foundations](../cs-foundations/) owns algorithm correctness and complexity. [Applied AI](../applied-ai/) owns retrieval and agent systems; its existing React streaming port is an optional consumer of these UI foundations.

Redux, advanced conditional types, custom composite widgets, virtualization, microfrontends and framework migrations are optional after the essential path. Choose a tool to meet an observed requirement rather than implement every comparison in the reference catalogue.
