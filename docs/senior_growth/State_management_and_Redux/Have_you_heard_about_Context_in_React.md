# Have you heard about Context in React?

# 🌐 React Context API

The **Context API** in React is a **built-in mechanism to share state across the component tree** without having to pass props down manually at every level (avoiding "prop drilling").

---

## 1️⃣ What is React Context?

- **Context** provides a way to **share data globally** for a tree of React components.
- Useful for:
  - Themes (dark/light mode)
  - User authentication info
  - Language/localization
  - Global settings/preferences

---

## 2️⃣ Core Concepts

| Concept | Description |
|---------|------------|
| **React.createContext** | Creates a Context object with `Provider` and `Consumer`. |
| **Provider** | Component that holds the **value** you want to share and wraps children. |
| **Consumer / useContext** | Used to **read the context value** in any descendant component. |

---

## 3️⃣ Basic Example

```tsx
// theme-context.tsx
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
type ThemeValue = { theme: 'light' | 'dark'; toggleTheme: () => void };
const ThemeContext = createContext<ThemeValue | null>(null);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggleTheme = useCallback(() => setTheme(current => current === 'light' ? 'dark' : 'light'), []);
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (value === null) throw new Error('ThemeProvider required');
  return value;
}
export function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  return <button type="button" onClick={toggleTheme}>Current theme: {theme}</button>;
}
```

---

## 4️⃣ When to Use Context

* **Global/shared state** that many components need access to.
* **Settings/configuration** like theme, language, or authentication.
* **Avoid overusing** for high-frequency updates (like typing input) because it can trigger **unnecessary re-renders**.

---

## 5️⃣ Advantages

* Built into React; no extra library needed.
* Simple API for **moderate global state**.
* Avoids prop drilling.
* Works well with **functional components and hooks**.

---

## 6️⃣ Limitations / Disadvantages

* **Not ideal for large-scale global state** with complex logic.
* Updates can cause **all consuming components to re-render** even if they only use part of the context.
* Lacks built-in support for **middleware or async actions**, unlike Redux.
* Can become **hard to manage for multiple contexts**.

---

## ✅ Key Takeaways

* Context is great for **moderate shared state**.
* For **complex, frequently updated, or async global state**, consider selector-based stores such as Redux Toolkit or Zustand when profiling/ownership needs justify them. Recoil is archived, not a current primary choice.
* Can be combined with local state and centralized stores for **hybrid solutions**.

> 💡 Senior Tip:
> Use Context for **settings, themes, or auth info**, and **Redux/Zustand** for complex shared data with async operations.


## Identity, scope and evidence

Context is a subscription/propagation mechanism; the provider's state/reducer owns updates. React compares provider values with Object.is. Memoizing this value avoids a new object on an unrelated provider rerender; it does not stop ordinary parent-driven rendering or a genuine theme update. A consumer of a combined theme/actions object subscribes to that whole context even if it only uses the action. Split independently changing data/actions contexts when that reduces measured work; the [pure reducer/scoped Context lesson](../React/What_Are_React_Hooks_Good_For_Rules_of_Hooks.md#refs-pure-reducers-scoped-context-and-custom-hooks) shows that pattern.

Use a null sentinel plus a hook guard when a provider is required; a plausible default with a no-op action hides a missing provider. Two sibling providers isolate state; nested consumers read the closest provider. Do not put high-frequency pointer coordinates and static language in one giant object unless that propagation cost is intentional. Context does not provide remote-cache invalidation, persistence validation or server authorization automatically.

**Acceptance:** strict-typecheck children/theme/callbacks; assert a missing-provider failure, independent provider toggles, functional double toggles and stable value/action identity across unrelated rerenders. Then profile real consumers under combined versus split contexts, accounting for parent renders and StrictMode. Test focus/AT separately; a stable object is not proof of a faster application. React19.3.0/TypeScript5.9.3 baseline; learner practice remains required. [Official useContext identity/subscription contract](https://react.dev/reference/react/useContext), checked2026-10-22.


## Locale is more than a Context string

Context can distribute a selected locale, but formatting, message selection, direction and translation are separate implementation work. This controlled provider supports exactly en-US/ar-EG as a bounded teaching catalog; the page/application owns the chosen locale. Format the original numeric/date values using Intl rather than concatenating an English plural suffix or changing every date with string replacements.

```tsx
// locale-context.tsx
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
export type Locale = 'en-US' | 'ar-EG';
const LocaleContext = createContext<Locale | null>(null);
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  if (locale !== 'en-US' && locale !== 'ar-EG') throw new Error('Unsupported locale');
  return <LocaleContext.Provider value={locale}>
    <section lang={locale} dir={locale === 'ar-EG' ? 'rtl' : 'ltr'}>{children}</section>
  </LocaleContext.Provider>;
}
export function formatItemCount(locale: Locale, count: number): string {
  if (!Number.isSafeInteger(count) || count < 0 || count > 100000) throw new Error('Invalid count');
  const number = new Intl.NumberFormat(locale).format(count);
  const category = new Intl.PluralRules(locale, { type: 'cardinal' }).select(count);
  if (locale === 'en-US') return `${number} ${category === 'one' ? 'item' : 'items'}`;
  const messages: Record<Intl.LDMLPluralRule, string> = {
    zero: 'لا عناصر', one: 'عنصر واحد', two: 'عنصران',
    few: `${number} عناصر`, many: `${number} عنصرًا`, other: `${number} عنصر`,
  };
  return messages[category];
}
export function LocalizedSummary({ count, totalUsdCents, when, reference }: {
  count: number; totalUsdCents: number; when: Date; reference: string;
}) {
  const locale = useContext(LocaleContext);
  if (locale === null) throw new Error('LocaleProvider required');
  if (!Number.isSafeInteger(totalUsdCents) || totalUsdCents < 0 || totalUsdCents > 10000000
    || !Number.isFinite(when.getTime()) || reference.length > 80) throw new Error('Invalid summary');
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(totalUsdCents / 100);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(when);
  return <>
    <p>{formatItemCount(locale, count)}</p>
    <p>{money}</p>
    <p><time dateTime={when.toISOString()}>{date}</time></p>
    <p><bdi>{reference}</bdi></p>
  </>;
}
```

English cardinal one/other is not universal: Arabic integer examples0/1/2/3/11/100 exercise zero/one/two/few/many/other categories. These small messages illustrate a catalog, not a complete translation/grammar system; production strings need linguistic review, fallback policy and coverage for interpolation/context. An established message-format/i18n library is an alternative once the catalog needs richer cases; keep one translation owner instead of mixing ad hoc string concatenation across components.

lang identifies language, dir controls a subtree's base direction, and bdi isolates an interpolated identifier's bidirectional ordering. Use the framework's document/layout owner to apply the chosen page locale to html lang/dir for a whole page; do not mutate document globals during component render. Prefer CSS logical properties such as margin-inline-start/padding-inline so layout follows direction, and review icon/reading/focus order rather than blindly mirroring all symbols. A RTL attribute alone does not establish a usable RTL interface.

USD cents are explicitly a two-decimal teaching domain; currency minor units differ, so do not divide every currency amount by100. Intl formatters produce display text, not a safe parser for localized user input or a money-arithmetic engine. A Date is an instant here, displayed in explicit UTC; a birthday/calendar date needs a different domain contract. Server/client must share locale, time zone and data during hydration; default browser/server locales, ICU/CLDR versions and nonbreaking-space/bidi output can differ. Assert semantic parts and record runtime support instead of assuming ASCII punctuation or stable localized snapshots across versions.

**Acceptance:** strict-typecheck the exact provider/consumer and reject unsupported configured locale; verify English1/2, all six Arabic count categories, explicit USD/date formatter output and invalid count/date/amount bounds. Render two different locale providers, switch one and assert the other stays unchanged; inspect lang/dir/bdi/time markup and missing-provider failure. In a browser, verify real fonts/Arabic shaping, logical-property layout, long strings, zoom, mixed-direction IDs, keyboard/focus and assistive-technology language behavior with a fluent reviewer. Node/SSR/jsdom checks establish formatting/markup only; browser/translation quality and learner practice remain required.

Baseline React19.3.0/TypeScript5.9.3/Node24.18.0 with Intl locale data. Standards checked2026-10-22: [Intl.PluralRules](https://tc39.es/ecma402/#sec-intl.pluralrules), [Intl.NumberFormat](https://tc39.es/ecma402/#sec-intl.numberformat), [HTML direction/language](https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute). Native Intl and the local catalog are the primary introductory implementation; a library is an alternative, not an extra prerequisite.

### A translated, direction-aware layout to assemble

The following component completes the local choice-to-provider flow. Put the earlier locale-context.tsx beside this file and create the stylesheet below. This is one catalog with an English/Arabic choice, not automatic language detection or a complete production translation. Keep the selection stable across server rendering and hydration; persist it only through a validated preference boundary. A page-wide app should also set html language/direction through its document owner.

```tsx
// locale-demo.tsx
import { useState } from 'react';
import { LocaleProvider, LocalizedSummary, type Locale } from './locale-context.js';
import './locale-layout.css';
export function LocaleDemo() {
  const [locale, setLocale] = useState<Locale>('en-US');
  const arabic = locale === 'ar-EG';
  return <LocaleProvider locale={locale}>
    <div className="locale-layout">
      <label>{arabic ? 'اللغة' : 'Language'}
        <select value={locale} onChange={event => {
          const next = event.currentTarget.value;
          if (next === 'en-US' || next === 'ar-EG') setLocale(next);
        }}>
          <option value="en-US" lang="en-US">English</option>
          <option value="ar-EG" lang="ar-EG">العربية</option>
        </select>
      </label>
      <h2>{arabic ? 'ملخص الطلب' : 'Order summary'}</h2>
      <LocalizedSummary count={3} totalUsdCents={12345}
        when={new Date('2026-01-02T12:00:00Z')} reference="ORDER-42" />
      <button type="button">{arabic ? 'متابعة التسوق' : 'Continue shopping'}</button>
    </div>
  </LocaleProvider>;
}
```

```css
/* locale-layout.css */
.locale-layout {
  max-inline-size: 36rem;
  padding-block: 1rem;
  padding-inline: 1.25rem;
  border-inline-start: 0.25rem solid currentColor;
  text-align: start;
  overflow-wrap: anywhere;
}
.locale-layout label { display: grid; gap: 0.5rem; }
.locale-layout select, .locale-layout button {
  max-inline-size: 100%;
  font: inherit;
  white-space: normal;
}
```

The DOM order stays language choice, heading, summary, action in both directions; CSS does not reorder focus. Start/end padding and border follow the inherited direction, unlike a hard-coded left edge. Do not mirror payment/brand marks or reorder identifiers without a semantic reason. The sample action is intentionally inert: connecting checkout/business writes requires a separate validated flow. Arabic copy here is learning material requiring fluent review before use in a product.

**Additional acceptance:** select Arabic by its option value, require the translated label/heading/action, section lang/ar-EG and dir/rtl, updated plural/currency/date text and preserved bidi-isolated reference. Switch back to English. Check logical-property stylesheet syntax and retain browser screenshots at narrow width, large text and long translations; assert no clipping and a meaningful keyboard sequence. Automated DOM tests can verify the state/markup contract, not Arabic shaping, visual overflow or translation quality. These browser/fluent-review tasks remain learner practice.
