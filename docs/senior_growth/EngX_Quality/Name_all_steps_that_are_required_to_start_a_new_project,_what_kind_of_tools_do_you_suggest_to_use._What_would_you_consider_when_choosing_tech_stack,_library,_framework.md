# Name all steps that are required to start a new project, what kind of tools do you suggest to use? What would you consider when choosing tech stack, library/framework? {#name-all-steps-that-are-required-to-start-a-new-project-what-kind-of-tools-do-you-suggest-to-use-what-would-you-consider-when-choosing-tech-stack-library-framework}


---

## **Steps to Start a New Project**

1. **Define the Project Requirements**:
    - Understand the business goals.
    - Identify the target audience.
    - Define functional and non-functional requirements.
2. **Plan the Project Scope**:
    - Create a project charter or roadmap.
    - Define deliverables, timelines, and milestones.
3. **Set Up Version Control**:
    - Use version control tools like Git and host repositories on GitHub, GitLab, or Bitbucket.
4. **Choose the Tech Stack**:
    - Select the appropriate languages, frameworks, and tools based on project requirements.
5. **Establish Development Workflow**:
    - Define processes for code reviews, pull requests, and deployment.
    - Use Agile methodologies like Scrum or Kanban if applicable.
6. **Set Up the Development Environment**:
    - Prepare local development tools and configurations.
    - Ensure a uniform setup across team members (e.g., using Docker or Vagrant).
7. **Design the Architecture**:
    - Create the application's structure (e.g., monolithic, microservices, serverless).
    - Define API contracts, database schemas, and service integrations.
8. **Implement CI/CD Pipeline**:
    - Automate build, test, and deployment processes using tools like Jenkins, CircleCI, or GitHub Actions.
9. **Create Boilerplate Code**:
    - Set up the basic structure of the project (e.g., folder hierarchy, base configurations).
    - Include linting and formatting tools.
10. **Setup Documentation and Communication**:
    - Create a README file, document the setup process, and define coding standards.
    - Use tools like Confluence, Notion, or Markdown files for documentation.
11. **Start Development**:
    - Begin with core features and follow the planned sprints or iterations.

---

## **Tools to Use**

- **Project Management**: Jira, Trello, Asana
- **Version Control**: Git, GitHub, GitLab
- **Development Environment**: Visual Studio Code, JetBrains IDEs, Docker
- **CI/CD**: Jenkins, CircleCI, GitHub Actions
- **API Development**: Postman, Swagger, Insomnia
- **Testing**: Jest, Cypress, Mocha, Selenium
- **Documentation**: Notion, Confluence, Docusaurus
- **Monitoring**: New Relic, Datadog, Sentry
- **Communication**: Slack, Microsoft Teams, Zoom

---

## **Considerations When Choosing Tech Stack, Library/Framework**

1. **Project Requirements**:
    - Ensure the chosen tech aligns with functional and non-functional requirements (e.g., scalability, performance).
2. **Team Expertise**:
    - Consider the team's familiarity with the tools and frameworks to reduce the learning curve.
3. **Community and Ecosystem**:
    - Select tools with active communities, regular updates, and rich ecosystems.
4. **Scalability**:
    - Choose technologies that can handle future growth in users, data, and features.
5. **Performance**:
    - Evaluate runtime performance, resource usage, and response times.
6. **Ease of Integration**:
    - Ensure the stack integrates well with third-party tools and services.
7. **Development Speed**:
    - Opt for frameworks/libraries that provide high-level abstractions, out-of-the-box features, and good documentation.
8. **Security**:
    - Choose technologies with strong security measures and good community support for handling vulnerabilities.
9. **License and Cost**:
    - Check licensing terms to avoid potential legal issues. Consider the cost of tools if using proprietary solutions.
10. **Longevity and Trends**:
    - Avoid adopting technologies that may become obsolete in the near future.
11. **Testing and Debugging**:
    - Ensure tools support robust testing and debugging workflows.
12. **Cross-platform Needs**:
    - For front-end projects, consider frameworks like React Native or Flutter for shared codebases across platforms.

## Worked project slice: private course catalogue

**Outcome:** an authenticated reader can browse their tenant's course titles in bounded pages. Begin with one vertical slice rather than a list of every possible framework. Primary choices: React/TypeScript frontend, Node24/Express5, PostgreSQL/MikroORM, one runtime validation approach and the existing test/build tooling. MongoDB, GraphQL, extra frameworks and cloud orchestration are alternatives when a requirement justifies them.

### Proposed ADR-CATALOGUE-01

Status: proposed for learner implementation; not an adopted team decision. Context: private data, shared frontend/backend contract and limited implementation scope. Decision: a modular single service with server-established identity, tenant-scoped queries, bounded cursor pagination and explicit public DTOs; keep transport/contracts separate from use cases and persistence. Alternative: arbitrary GraphQL projections could help several clients, but add query-cost/schema governance that this single operation does not yet need.

Microservices/microfrontends add deployment/coordination cost without a current independent-release requirement. Consequence: simple local ownership and one deployment, with an explicit repository/auth port and migration/rollback policy. Revisit when client projection needs or independent ownership measurably exceed this design.

Use [the actual OpenAPI workbench](../../workbench/node-js/backend/rest-contracts.md) for generated/checked response contracts, auth/errors/pagination and drift tests. Its real local HTTP checks are evidence for that fixture; real issuer/PostgreSQL/frontend/deployment integration remains a learner deliverable. A Swagger link alone is not a completed API contract.

### Small work breakdown and uncertainty

The following are **illustrative planning ranges**, not measured completion times or commitments. Confirm actual team skills, template and dependencies before promising dates.

| Increment | Acceptance artifact | Initial estimate/uncertainty |
|---|---|---|
| Contract and boundary fixture | Reviewed OpenAPI, positive/negative contract checks |2–4h; schema/tool familiarity |
| Identity and tenant repository | Actual verifier, scoped SQL, denied/revoked access tests |4–10h; issuer setup/driver configuration |
| Accessible React page | Query/selection/focus/error states and manual observations |4–8h; device/browser accessibility findings |
| Release/recovery slice | Immutable artifact, migration/restore/rollback evidence |4–10h; deployment permissions/environment |

These work items total14–32h of estimated hands-on work before unknown dependency wait time; they are not an assertion that an intermediate learner can finish on that schedule. Run a small spike for the highest uncertainty, update the range from evidence and record why it changed. Break each increment into reviewable changes; do not hide integration/review/repair time inside “done.”

### Risk register

| Risk | Impact/trigger | Owner and response | Evidence/revisit |
|---|---|---|---|
| Tenant context taken from input | Private data leak | API owner: verified principal + scoped query before slicing | Cross-tenant/revoked tests before release |
| Contract/server change together | Older client breakage | Feature owner: consumer checks and semantic contract review | Deliberately broken field/status detected |
| Unknown issuer/DB setup | Estimate and startup failure | Learner/mentor: bounded spike and fail-closed startup | Actual configuration/connection checks, no invented access |
| Large responses/slow dependency | Saturation or unusable UI | Service owner: byte/page/deadline/pool bounds | Recorded workload and failure drill |
| Schema change closes rollback window | Failed release recovery | Release owner: expand/contract plus tested restore/rollback allowlist | Compatibility evidence from the release lesson |

Role labels are proposed responsibilities, not assigned real people or messages sent. Acceptance: produce the actual ADR, a revised evidence-based estimate, a current risk register, one contract-tested vertical slice and a handoff showing what is complete, failed and untested. Learner practice remains required. Official references: [OpenAPI specification](https://spec.openapis.org/oas/v3.1.2.html), [Markdown ADR format](https://adr.github.io/madr/); use an existing team format when available.
