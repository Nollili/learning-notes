## How would you onboard new people on a project? What kind of documentation/style guide would you use?

Onboarding new team members effectively is crucial for productivity and team cohesion. A well-structured onboarding process ensures that new members quickly understand the project, tools, and best practices, enabling them to contribute efficiently. Here's how to approach it:

---

## **1. Prepare for Onboarding**

### **Key Steps:**

1. **Identify Goals**: Clarify what the new hire should accomplish in their first days/weeks.
2. **Set Up Accounts**: Provide access to tools, repositories, environments, and communication channels in advance.
3. **Assign a Mentor/Buddy**: Pair the new hire with an experienced team member for guidance.

---

## **2. Provide a Comprehensive Overview**

### **Project Overview**

- **Mission and Vision**: Explain the project’s purpose, goals, and value.
- **Current Status**: Share details about ongoing features, challenges, and future plans.
- **Architecture Diagram**: Visualize the system’s architecture, components, and data flow.

---

## **3. Documentation for Onboarding**

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

## **4. Leverage Tools**

### **Documentation Tools**

- **Internal Wikis**: Confluence, Notion, or GitHub Wiki.
- **Code Comments**: Inline comments for critical parts of the codebase.
- **Diagrams**: Tools like Lucidchart, Miro, or Mermaid.js for architectural diagrams.

### **Style Guides and Linters**

- **Code Linters**: ESLint, Stylelint, or RuboCop to enforce standards automatically.
- **Prettier**: For consistent formatting.
- **UI Style Guide**: Storybook for React/Vue components.

---

## **5. Onboarding Roadmap**

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

## **6. Continuous Learning and Feedback**

- **Learning**: Encourage participation in workshops, code reviews, and pairing sessions.
- **Feedback**: Regularly check in with the new hire to identify blockers and improve the onboarding process.

## Read a decision record, then test its boundary

Start with [ADR-STUDY-01: UI uses an application port](../React/application_struvture.md#a-proposed-decision-with-an-executable-boundary). Its status is proposed for a learner fixture, not an adopted decision in a real employer's project. Context: direct UI imports of concrete infrastructure make adapter changes leak into UI tests. Forces: a small understandable feature, test substitution, dependency ownership and a migration cost that must stay reviewable. Alternatives are a direct import for a tiny isolated script, a feature port/composition boundary, or broader dependency-graph enforcement when actual cycles/bypasses justify it.

Decision: try the feature port for one caller. Consequences: one explicit contract and composition owner; easier substitution if the contract is stable; added indirection and possible barrel/alias bypass if enforcement is only a string rule. Validation: the ESLint fixture rejects known direct infrastructure spellings and accepts the application port. It cannot establish a whole dependency graph or server permission boundary. Revisit on a real exception/cycle or when migration cost exceeds the observed value; accept/supersede the record through the team's review process rather than silently changing its meaning.

**Onboarding exercise:** locate the UI → application port → adapter path, explain who constructs the adapter and run both positive and negative boundary cases. Propose one justified exception, record the risk/owner/expiry and explain whether the rule or architecture should change. Then trace the title helper's [incremental migration and estimate](./How_would_you_approach_significant_refactoring.md#estimate-uncertainty-and-make-the-debt-decision-reviewable). Acceptance: a new reader can identify the decision, alternatives, forces, consequences, current status, evidence and revisit trigger without relying on undocumented chat history. The record is worked learning material; actual teammate onboarding, decision adoption and measured communication outcomes remain learner practice.

A decision log complements a current architecture diagram: the diagram shows today's structure, while the record explains why a choice was made under then-known constraints. Keep accepted records stable and add a superseding record with links when the choice changes. Avoid invented personal experience or “all decisions must be permanent” claims. For a record format see [Markdown Architectural Decision Records](https://adr.github.io/madr/); the schema is an alternative to an existing team template, not a new mandatory tool.
