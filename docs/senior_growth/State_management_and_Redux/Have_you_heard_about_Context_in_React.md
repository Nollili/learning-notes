# Have you heard about Context in React?

## React Context API {#%F0%9F%8C%90-react-context-api}

The **Context API** in React is a **built-in mechanism to share state across the component tree** without having to pass props down manually at every level (avoiding "prop drilling").

---

## What is React Context? {#_1%EF%B8%8F%E2%83%A3-what-is-react-context}

- **Context** provides a way to **share data globally** for a tree of React components.
- Useful for:
  - Themes (dark/light mode)
  - User authentication info
  - Language/localization
  - Global settings/preferences

---

## Core Concepts {#_2%EF%B8%8F%E2%83%A3-core-concepts}

| Concept | Description |
|---------|------------|
| **React.createContext** | Creates a Context object with `Provider` and `Consumer`. |
| **Provider** | Component that holds the **value** you want to share and wraps children. |
| **Consumer / useContext** | Used to **read the context value** in any descendant component. |

---

## Basic Example {#_3%EF%B8%8F%E2%83%A3-basic-example}

<<< ../../workbench/engineering/state/theme-context.tsx{tsx}

---

## When to Use Context {#_4%EF%B8%8F%E2%83%A3-when-to-use-context}

* **Global/shared state** that many components need access to.
* **Settings/configuration** like theme, language, or authentication.
* **Avoid overusing** for high-frequency updates (like typing input) because it can trigger **unnecessary re-renders**.

---

## Advantages {#_5%EF%B8%8F%E2%83%A3-advantages}

* Built into React; no extra library needed.
* Simple API for **moderate global state**.
* Avoids prop drilling.
* Works well with **functional components and hooks**.

---

## Limitations / Disadvantages {#_6%EF%B8%8F%E2%83%A3-limitations-disadvantages}

* **Not ideal for large-scale global state** with complex logic.
* Updates can cause **all consuming components to re-render** even if they only use part of the context.
* Lacks built-in support for **middleware or async actions**, unlike Redux.
* Can become **hard to manage for multiple contexts**.

---

## Key Takeaways {#%E2%9C%85-key-takeaways}

* Context is great for **moderate shared state**.
* For **complex, frequently updated, or async global state**, consider selector-based stores such as Redux Toolkit or Zustand when profiling/ownership needs justify them. Recoil is archived, not a current primary choice.
* Can be combined with local state and centralized stores for **hybrid solutions**.

> Senior Tip:
> Use Context for **settings, themes, or auth info**, and **Redux/Zustand** for complex shared data with async operations.


## Identity, scope and evidence

Context is a subscription/propagation mechanism; the provider's state/reducer owns updates. React compares provider values with Object.is. Memoizing this value avoids a new object on an unrelated provider rerender; it does not stop ordinary parent-driven rendering or a genuine theme update. A consumer of a combined theme/actions object subscribes to that whole context even if it only uses the action. Split independently changing data/actions contexts when that reduces measured work; the [pure reducer/scoped Context lesson](../React/What_Are_React_Hooks_Good_For_Rules_of_Hooks.md#refs-pure-reducers-scoped-context-and-custom-hooks) shows that pattern.

Use a null sentinel plus a hook guard when a provider is required; a plausible default with a no-op action hides a missing provider. Two sibling providers isolate state; nested consumers read the closest provider. Do not put high-frequency pointer coordinates and static language in one giant object unless that propagation cost is intentional. Context does not provide remote-cache invalidation, persistence validation or server authorization automatically.


## Locale is more than a Context string

Context can distribute a selected locale, but formatting, message selection, direction and translation are separate implementation work. This controlled provider supports exactly en-US/ar-EG as a bounded teaching catalog; the page/application owns the chosen locale. Format the original numeric/date values using Intl rather than concatenating an English plural suffix or changing every date with string replacements.

<<< ../../workbench/engineering/state/locale-context.tsx{tsx}

English cardinal one/other is not universal: Arabic integer examples0/1/2/3/11/100 exercise zero/one/two/few/many/other categories. These small messages illustrate a catalog, not a complete translation/grammar system; production strings need linguistic review, fallback policy and coverage for interpolation/context. An established message-format/i18n library is an alternative once the catalog needs richer cases; keep one translation owner instead of mixing ad hoc string concatenation across components.

lang identifies language, dir controls a subtree's base direction, and bdi isolates an interpolated identifier's bidirectional ordering. Use the framework's document/layout owner to apply the chosen page locale to html lang/dir for a whole page; do not mutate document globals during component render. Prefer CSS logical properties such as margin-inline-start/padding-inline so layout follows direction, and review icon/reading/focus order rather than blindly mirroring all symbols. A RTL attribute alone does not establish a usable RTL interface.

USD cents are explicitly a two-decimal teaching domain; currency minor units differ, so do not divide every currency amount by100. Intl formatters produce display text, not a safe parser for localized user input or a money-arithmetic engine. A Date is an instant here, displayed in explicit UTC; a birthday/calendar date needs a different domain contract.

Server/client must share locale, time zone and data during hydration; default browser/server locales, ICU/CLDR versions and nonbreaking-space/bidi output can differ. Assert semantic parts and record runtime support instead of assuming ASCII punctuation or stable localized snapshots across versions.


Baseline React19.3.0/TypeScript5.9.3/Node24.18.0 with Intl locale data. Standards checked2026-10-22: [Intl.PluralRules](https://tc39.es/ecma402/#sec-intl.pluralrules), [Intl.NumberFormat](https://tc39.es/ecma402/#sec-intl.numberformat), [HTML direction/language](https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute). Native Intl and the local catalog are the primary introductory implementation; a library is an alternative, not an extra prerequisite.

### A translated, direction-aware layout to assemble

The following component completes the local choice-to-provider flow. Put the earlier locale-context.tsx beside this file and create the stylesheet below. This is one catalog with an English/Arabic choice, not automatic language detection or a complete production translation. Keep the selection stable across server rendering and hydration; persist it only through a validated preference boundary. A page-wide app should also set html language/direction through its document owner.

<<< ../../workbench/engineering/state/locale-demo.tsx{tsx}

<<< ../../workbench/engineering/state/locale-layout.css{css}

The DOM order stays language choice, heading, summary, action in both directions; CSS does not reorder focus. Start/end padding and border follow the inherited direction, unlike a hard-coded left edge. Do not mirror payment/brand marks or reorder identifiers without a semantic reason. The sample action is intentionally inert: connecting checkout/business writes requires a separate validated flow. Arabic copy here is learning material requiring fluent review before use in a product.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/state/Have_you_heard_about_Context_in_React.md). All learner practice remains outstanding.
