# React application structure

Folder layouts express ownership; they do not enforce dependencies or establish project experience by themselves.

---

## **React Application Structure Best Practices** {#%F0%9F%A7%AD-react-application-structure-best-practices}

| Structure                  | Description                                                                                                           | Pros                                                                  | Cons                                             | When to use                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| **Flat layout (CRA is historical)**    | All JS/TS files, components, and styles mixed in `src`                                                                | Quick to start, minimal setup                                         | Hard to scale, messy for big apps                | Small projects, experiments, learning                            |
| **Tech Separation**        | Each component has its folder with `.tsx`, `.scss`/`.css`, and tests                                                  | Cleaner organization, easy to find component files                    | Can get verbose if too many small folders        | Mid-size apps, growing team                                      |
| **Domain / Feature-based** | Components grouped by domain/feature; separate folders for containers, UI, hooks, services, utils                     | Scalable, promotes separation of concerns, easier team collaboration  | Requires upfront planning, slightly more complex | Medium to large projects, teams with multiple devs               |
| **Deep Domain / Modular**  | Deeply nested folders by domain/feature, possibly with subdomains, plus shared `hooks`, `services`, `utils`, `assets` | Excellent scalability, supports large teams, promotes maintainability | Can be overkill for small projects, longer paths | Enterprise-scale projects, multiple teams, long-term maintenance |

---

### **Additional Best Practices** {#%F0%9F%92%A1-additional-best-practices}

* **Shared folders**: Put reusable hooks, utils, assets, and services at the root or a `shared/` folder.
* **Containers vs UI components**: Separate data/transition owners from reusable UI where that boundary helps. Presentational function components may still have local interaction state.
* **Consistency is key**: React doesn’t enforce structure, so the most important part is **team agreement and maintainability**.
* **Keep paths reasonable**: Avoid extremely deep nesting unless necessary — large size alone does not justify deep nesting.

---

### **30-second interview answer** {#%F0%9F%97%A3%EF%B8%8F-30-second-interview-answer}

> “For small projects, the default CRA structure is fine. For mid-size apps, I prefer **tech separation** where each component has its folder with styles and tests. For larger projects, I go **domain-based**, separating containers, UI components, services, and utils by feature.
> For enterprise apps, deeper domains may help when actual ownership/dependency boundaries justify them. Shared hooks, utils, and assets usually sit in a root `shared/` or `common/` folder. The key is maintainability and team consistency.”

---

```
[ CRA / Default ]
 src/
 ├─ App.js
 ├─ Component1.js
 ├─ Component2.js
 ├─ styles.css
-----------------
→ small projects / prototypes

[ Tech Separation ]
 src/
 ├─ components/
 │   ├─ Button/
 │   │   ├─ Button.tsx
 │   │   ├─ Button.module.css
 │   │   └─ Button.test.tsx
 │   └─ Card/
 └─ App.tsx
-----------------
→ mid-size projects

[ Domain / Feature-based ]
 src/
 ├─ features/
 │   ├─ Auth/
 │   │   ├─ components/
 │   │   ├─ containers/
 │   │   ├─ hooks/
 │   │   └─ services/
 │   └─ Dashboard/
 └─ shared/
     ├─ hooks/
     ├─ utils/
     └─ assets/
-----------------
→ medium to large projects

[ Deep Domain / Modular ]
 src/
 ├─ features/
 │   ├─ Auth/
 │   │   ├─ login/
 │   │   │   ├─ components/
 │   │   │   └─ hooks/
 │   │   └─ register/
 │   │       ├─ components/
 │   │       └─ hooks/
 │   └─ Dashboard/
 │       ├─ overview/
 │       └─ analytics/
 └─ shared/
     ├─ hooks/
     ├─ utils/
     └─ assets/
-----------------
→ large enterprise apps, multi-team
```

**Tips for presenting in an interview:**

* Start small → large (arrows or “scaling up” metaphor works).
* Mention **why each structure fits the project size**.
* Highlight **shared folders** for hooks, utils, assets.
* Emphasize **containers vs presentational components** in domain-based structure.


## A proposed decision with an executable boundary

**ADR-STUDY-01 — UI uses an application port. Status: proposed learner fixture.** Context: catalog UI imports concrete storage/network modules, making UI tests and migrations depend on infrastructure. Decision: the UI consumes an application service/port; composition at the application edge chooses the concrete adapter. Start with one feature, preserving public entry points. Alternatives: keep the direct import for a tiny isolated script, or introduce a broader graph tool when direct rules are insufficient. Costs: another explicit interface and migration ownership. Risks: barrels/aliases/dynamic imports can bypass a string-pattern rule; a folder rename can break the configured scope. Revisit when a real exception or dependency cycle appears, rather than add folders speculatively.

The following ESLint10.13.0 flat configuration runs on a deliberately small JavaScript-module lab under Node24.18.0. It is not installed into the notes project or a submission template. A real TS/TSX application must retain/configure its compatible TypeScript parser and file coverage.

```js
// eslint.config.mjs
export default [{
  files: ['src/features/**/ui/**/*.js'],
  languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{ group: ['**/infra', '**/infra/**', '@infra', '@infra/**'],
        message: 'UI must use the application port, not a concrete infrastructure adapter.' }],
    }],
  },
}];
```

In src/features/catalog/ui/card.js, importing ../application/catalog.js should pass; importing ../infra/catalog.js or @infra/catalog should fail. Run eslint src/features/catalog/ui/card.js in the lab and retain actual results. The rule checks configured direct static import/re-export spellings; it does not resolve an entire graph, validate exports or block a runtime network request. Test the known aliases/barrels/dynamic paths and either cover them with the actual graph/parser policy or document the remaining gap. CI enforcement is still needed because a local hook can be skipped.


Official references checked 2026-10-22: [ESLint restricted imports](https://eslint.org/docs/latest/rules/no-restricted-imports), [flat configuration and file coverage](https://eslint.org/docs/latest/use/configure/configuration-files).


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/application_struvture.md). All learner practice remains outstanding; the worked examples above are explanatory material.
