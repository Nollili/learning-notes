# How would you onboard new people on a project? What kind of documentation/style guide would you use? {#how-would-you-onboard-new-people-on-a-project-what-kind-of-documentation-style-guide-would-you-use}

Onboarding new team members effectively is crucial for productivity and team cohesion. A well-structured onboarding process ensures that new members quickly understand the project, tools, and best practices, enabling them to contribute efficiently. Here's how to approach it:

---

## **Prepare for Onboarding** {#_1-prepare-for-onboarding}

### **Key Steps:**

1. **Identify Goals**: Clarify what the new hire should accomplish in their first days/weeks.
2. **Set Up Accounts**: Provide access to tools, repositories, environments, and communication channels in advance.
3. **Assign a Mentor/Buddy**: Pair the new hire with an experienced team member for guidance.

---

## **Provide a Comprehensive Overview** {#_2-provide-a-comprehensive-overview}

### **Project Overview**

- **Mission and Vision**: Explain the project’s purpose, goals, and value.
- **Current Status**: Share details about ongoing features, challenges, and future plans.
- **Architecture Diagram**: Visualize the system’s architecture, components, and data flow.

---

## **Documentation for Onboarding** {#_3-documentation-for-onboarding}

### **Types of Documentation**

1. **Project Documentation**
    - **README File**: Concise, high-level introduction to the project.
    - **Getting Started Guide**: Step-by-step instructions to set up the local development environment.
    - **Architecture Documentation**: Includes diagrams, data flows, and high-level design decisions.
    - **API Documentation**: Endpoint descriptions, data schemas, and example requests/responses.
    - **Key Features**: Highlight core functionalities and their purpose.
2. **Process Documentation**
    - **Team Roles and Responsibilities**: Clarify who owns what in the project.
    - **Development Workflow**: Explain branching strategies, code review processes, CI/CD pipelines, and deployment procedures.
    - **Ticket Workflow**: Describe how issues or stories are created, prioritized, and tracked.
3. **Technical Documentation**
    - **Codebase Walkthrough**: Guide through folder structures, naming conventions, and critical files.
    - **Tech Stack Overview**: Explain the technologies, libraries, and frameworks used, including why they were chosen.
    - **Error Handling**: Document common issues and their solutions.
    - **Testing Guidelines**: Describe unit, integration, and end-to-end testing processes and tools.
4. **Style Guide**
    - **Code Style**: Follow a standard like **Airbnb for JavaScript/React** or use a tool like ESLint/Prettier.
    - **Design Guidelines**: Use a design system (e.g., Material Design, Tailwind) and maintain a UI component library.
    - **Documentation Style**: Set standards for writing clear and concise comments, commit messages, and documentation.
5. **FAQs and Knowledge Base**
    - **Common Questions**: Address frequently asked questions about the project, tools, or setup.
    - **Troubleshooting Guide**: Help new members resolve common errors.

---

## **Leverage Tools** {#_4-leverage-tools}

### **Documentation Tools**

- **Internal Wikis**: Confluence, Notion, or GitHub Wiki.
- **Code Comments**: Inline comments for critical parts of the codebase.
- **Diagrams**: Tools like Lucidchart, Miro, or Mermaid.js for architectural diagrams.

### **Style Guides and Linters**

- **Code Linters**: ESLint, Stylelint, or RuboCop to enforce standards automatically.
- **Prettier**: For consistent formatting.
- **UI Style Guide**: Storybook for React/Vue components.

---

## **Onboarding Roadmap** {#_5-onboarding-roadmap}

### **Day 1–3**

- Introduce the team and provide a project overview.
- Set up development environment and tools.
- Walk through the documentation and key workflows.

### **Week 1–2**

- Complete hands-on tasks (e.g., fixing a small bug or implementing a minor feature).
- Attend team meetings to understand collaboration and decision-making processes.
- Conduct codebase walkthroughs with a mentor.

### **Month 1**

- Take ownership of a feature or module.
- Participate in code reviews and deploy code.
- Provide feedback on the onboarding process.

---

## **Continuous Learning and Feedback** {#_6-continuous-learning-and-feedback}

- **Learning**: Encourage participation in workshops, code reviews, and pairing sessions.
- **Feedback**: Regularly check in with the new hire to identify blockers and improve the onboarding process.

## Read a decision record, then test its boundary

Start with [ADR-STUDY-01: UI uses an application port](../React/application_struvture.md#a-proposed-decision-with-an-executable-boundary). Its status is proposed for a learner fixture, not an adopted decision in a real employer's project. Context: direct UI imports of concrete infrastructure make adapter changes leak into UI tests. Forces: a small understandable feature, test substitution, dependency ownership and a migration cost that must stay reviewable. Alternatives are a direct import for a tiny isolated script, a feature port/composition boundary, or broader dependency-graph enforcement when actual cycles/bypasses justify it.

Decision: try the feature port for one caller. Consequences: one explicit contract and composition owner; easier substitution if the contract is stable; added indirection and possible barrel/alias bypass if enforcement is only a string rule. Validation: the ESLint fixture rejects known direct infrastructure spellings and accepts the application port. It cannot establish a whole dependency graph or server permission boundary.

Revisit on a real exception/cycle or when migration cost exceeds the observed value; accept/supersede the record through the team's review process rather than silently changing its meaning.


A decision log complements a current architecture diagram: the diagram shows today's structure, while the record explains why a choice was made under then-known constraints. Keep accepted records stable and add a superseding record with links when the choice changes. Avoid invented personal experience or “all decisions must be permanent” claims. For a record format see [Markdown Architectural Decision Records](https://adr.github.io/madr/); the schema is an alternative to an existing team template, not a new mandatory tool.


## A component contract that a new contributor can run

A story captures one rendered state with fixed inputs; it is useful for discussing behavior before a consumer depends on it. Keep React/TypeScript as the primary UI stack. This example was checked with React19.3, TypeScript5.9.3 and Storybook10.6.3/React-Vite on Node24.18. The component owns presentation and native button semantics; its parent owns the asynchronous request, error handling and `busy` state. Do not make the callback silently swallow rejected requests.

`ActionButton.tsx`:

```tsx
import React from 'react';
export type ActionButtonProps = Readonly<{
  label: string;
  onActivate: () => void;
  disabled?: boolean;
  busy?: boolean;
}>;
export function ActionButton({label,onActivate,disabled=false,busy=false}:ActionButtonProps){
  return <button type="button" disabled={disabled||busy} aria-busy={busy} onClick={onActivate}>
    {busy?'Working…':label}
  </button>;
}
```

`label` is required visible text; `onActivate` is a required command callback. `disabled` means unavailable by policy and `busy` means work is in progress; both prevent activation. Native `type="button"` prevents accidental form submission. Native disabled buttons leave the tab sequence: if a user must discover why an action is unavailable, place a visible explanation nearby; substituting `aria-disabled` requires explicit event prevention and keyboard decisions. This small API deliberately has no polymorphic `as`, arbitrary HTML rendering or network dependency. Add flexibility only with consumer evidence.

`ActionButton.stories.tsx`, next to the component:

```tsx
import type {Meta, StoryObj} from '@storybook/react-vite';
import {fn} from 'storybook/test';
import {ActionButton} from './ActionButton.js';
const meta = {
  title: 'Study/ActionButton', component: ActionButton, tags: ['autodocs'],
  args: {label: 'Retry lookup', onActivate: fn()},
} satisfies Meta<typeof ActionButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Ready: Story = {};
export const Disabled: Story = {args: {disabled: true}};
export const Busy: Story = {args: {busy: true}};
```

`.storybook/main.ts`:

```ts
import type {StorybookConfig} from '@storybook/react-vite';
const config: StorybookConfig = {framework: '@storybook/react-vite', stories: ['../*.stories.tsx']};
export default config;
```

Create this in a separate local UI exercise, pin dependencies and include a React/Vite-compatible Storybook setup. Run `storybook build --config-dir .storybook --output-dir storybook-static`; stories stay in development tooling rather than being application entry points. `fn()` records interactions without performing a real write. CSF3 is sufficient here; an experimental story syntax or another framework is not a prerequisite. An `autodocs` tag alone does not prove an addon is configured or that documentation rendered correctly.

**Behavior checks:** render inside a form; clicking Ready invokes once and does not submit. Render Disabled then Busy; each blocks activation, and Busy exposes `aria-busy=true`. Return to Ready and require one activation. These two RTL/JSDOM tests passed; a static Storybook build passed. The component passed strict checking including exact optional properties. The story/config passed strict application checking with `skipLibCheck`; the full dependency declaration check failed in Storybook/docgen generic declarations, so it is not reported as passing. No native-browser, screen-reader, keyboard or visual regression observation is inferred from this build.

### Release and review policy

For a shared package, declare the supported React range, exported types, documented semantics, CSS/theme contract and accessible naming/focus behavior as its public API. Publish immutable artifacts with source revision and changelog. A backward-compatible optional visual variant is normally minor; correcting an accidental form submit to match the declared contract can be patch; renaming `onActivate`, changing its argument contract or removing a supported behavior requires a major release after1.0.

A visual/focus change can break consumers even when TypeScript compiles. Under0.x explicitly document the team's compatibility policy instead of assuming stability.

Before release, typecheck/build the component, run behavior and consumer-contract checks, build stories, inspect the changed states in a browser and exercise a real consumer. Include migration examples and deprecation window for breaking changes. Keep React a reviewed peer dependency in a shared library to avoid duplicate runtime copies. A monorepo-internal component may instead ship with its application; do not create a package/release process solely for this exercise. Do not publish a package from these notes.


## An actual failure turned into a review and communication case

During the Node startup verification (B182), a test expected zero `listening` listeners after cleanup but observed one. Investigation showed Node's own `setupConnectionsTracking` listener existed at construction. Removing all listeners would damage ownership boundaries. The corrected test records the constructor baseline, checks that the helper's listeners disappear, and leaves Node's listener intact. The subsequent real HTTP/parser/bind-failure checks passed.

This is a retained local engineering failure/correction, not an incident in an employer's production system. The measured outcome is the corrected assertion and passing checks; no business-impact or delivery-time measurement exists.

A review comment should identify the false assumption, explain ownership, and request the smallest corrective assertion. For example: “The server already owns a listening listener before our helper runs. Compare with that baseline and assert our helper's removal; clearing the entire event list could remove Node lifecycle behavior.” Teach the contributor to inspect before changing code, then ask them to explain which object owns each listener. Reproduction → diagnosis → scoped correction → rerun → evidence is a repeatable mentoring sequence.

A stakeholder update can say: “A startup-cleanup check failed because it counted a runtime-owned listener. The assertion now checks only our cleanup obligation; startup/error checks pass locally. Hosted proxy and deployment behavior still need their separate checks.” This gives outcome, residual uncertainty and next owner/action without raw logs or an invented severity claim. In a real team, agree an owner and follow-up date rather than leaving a vague promise.


References checked2026-10-26: [Storybook stories and CSF](https://storybook.js.org/docs/writing-stories), [Storybook interaction tests](https://storybook.js.org/docs/writing-tests/interaction-testing), [Semantic Versioning2.0](https://semver.org/), [React input/event ownership](https://react.dev/learn/responding-to-events). The release choices above are a proposed policy, not claims about a real team's agreement.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/design/How_would_you_onboard_new_people_on_a_project%2C_What_kind_of_documentation%2C_style_guide_would_you_use.md). All learner practice remains outstanding.
