### Could you please the differentiate between Functional and Non-functional reqs(NFRs)? How and when to take them into consideration?

### **Functional vs. Non-Functional Requirements**

Both **functional** and **non-functional requirements (NFRs)** are critical in the software development process, but they focus on different aspects of the system. Here's a detailed comparison:

---

### **1. Functional Requirements**

### **Definition**

Functional requirements define **what the system should do**. They describe the core features and functionalities of the application, specifying the behavior of the system under certain conditions.

### **Examples**

- User authentication (login, logout, registration).
- Ability to add, edit, delete, or retrieve data (CRUD operations).
- Payment processing and order management.
- Search functionality with filters.
- Generating reports or exporting data.

### **Characteristics**

- **Action-Oriented**: Focus on tasks the system must perform.
- **Specific**: Clearly defined actions and outputs for given inputs.
- **Use Case Driven**: Often derived from user stories or workflows.

### **When to Consider**

- During the initial phases of project planning and requirements gathering.
- To ensure the app meets the core business objectives and user needs.
- In writing use cases, user stories, and acceptance criteria.

---

### **2. Non-Functional Requirements (NFRs)**

### **Definition**

NFRs define **how the system should perform**. They describe the quality attributes, constraints, and system behavior under specific conditions.

### **Examples**

- **Performance**: The system must handle 10,000 concurrent users with a response time of <1 second.
- **Scalability**: The app should scale horizontally to accommodate traffic spikes.
- **Security**: User data must be encrypted both in transit and at rest.
- **Usability**: The app should be accessible to users with disabilities (e.g., WCAG compliance).
- **Availability**: The system should maintain 99.9% uptime.
- **Maintainability**: Code should follow defined coding standards and be easy to refactor.
- **Portability**: The app must run on Windows, MacOS, and Linux.

### **Characteristics**

- **System-Oriented**: Focus on how the system behaves and performs.
- **Verifiable**: Quality goals need explicit measures, workload, environment and acceptance evidence; a vague adjective is not an acceptance criterion.
- **Cross-Cutting**: Apply across multiple features or the entire system.

### **When to Consider**

- **Early in the design phase**: Architectural decisions like choosing tech stacks and frameworks are influenced by NFRs.
- **Continuously throughout development**: To ensure compliance with performance, security, and scalability goals.
- **During testing**: To validate metrics like load times, uptime, and accessibility.

---

### **Comparison Table**

| **Aspect** | **Functional Requirements** | **Non-Functional Requirements (NFRs)** |
| --- | --- | --- |
| **Focus** | What the system should do | How the system should perform |
| **Examples** | Login, search, data processing | Performance, security, scalability |
| **Measurement** | Based on behavior or actions | Based on quality metrics |
| **Impact on Design** | Drives application features | Drives architectural and operational decisions |
| **Testing** | Validated with functional testing (e.g., unit, integration) | Validated with performance, security, or stress testing |
| **Importance** | Addresses user and business needs | Ensures the system is reliable, efficient, and user-friendly |

---

### **How and When to Take Them into Consideration**

### **1. During Requirements Gathering**

- **Functional Requirements**: Engage stakeholders (e.g., product owners, business analysts) to gather user stories, use cases, and workflows.
- **NFRs**: Work with architects, DevOps engineers, and compliance teams to identify quality goals and constraints.

### **2. During Architecture and Design**

- Define how the system will achieve both functional goals (features) and non-functional goals (e.g., performance, reliability).
- Select tech stacks, frameworks, and tools that support NFRs (e.g., load balancers for scalability, encryption libraries for security).

### **3. Prioritize Requirements**

- Use techniques like **MoSCoW (Must Have, Should Have, Could Have, Won’t Have)** to ensure critical functional and non-functional requirements are addressed early.

### **4. During Development**

- Ensure functional requirements are implemented as specified in user stories or documentation.
- Continuously validate NFRs using automated tests, code reviews, and adherence to coding standards.

### **5. During Testing and Validation**

- **Functional Testing**: Validate that features meet user requirements.
- **Non-Functional Testing**: Perform performance testing (e.g., stress, load testing), security audits, and usability testing.

### **6. Post-Deployment**

- Monitor NFRs like availability, performance, and scalability using tools like New Relic, Datadog, or Prometheus.
- Gather user feedback to refine both functional and non-functional aspects.

---

### **Key Takeaways**

- Functional requirements are **feature-focused**, while NFRs are **quality-focused**.
- Both are equally important—functional requirements ensure the app meets user needs, and NFRs ensure it performs reliably under real-world conditions.
- Addressing NFRs early prevents costly architectural changes later in the development lifecycle.

## Quality scenarios and acceptance evidence

The examples above are starting points, not complete specifications. “10,000 concurrent users below one second” needs request mix, arrival rate, payload sizes, cache state, device/network, percentile, timeout/error treatment and measurement window. “99.9% uptime” needs an eligible-request denominator, success definition, observation window and exclusions agreed in advance. Encryption alone does not establish authorization; naming WCAG does not establish conformance. Functional and quality requirements overlap: a security invariant can be tested as observable behavior, and both influence architecture.

Use: **stakeholder → stimulus → environment → affected component → response → measurable criterion**. Agree on thresholds before implementation, keep failures in the denominator, and record measured results separately from intended targets.

| Scenario | Design decision and acceptance criterion | Evidence and remaining check |
|---|---|---|
| User submits B while earlier query A is delayed | Epoch plus abort ownership; only the newest accepted query renders, even if A ignores abort | [Worked workflow](./Large_Data_Workflow.md) deferred-response test passed; real adapter still needs integration |
| User requests another page in a large catalogue | One native page, stable IDs and snapshot-bound server cursors; accept no more than 50 rows, no more than 100 selected IDs | Schema rejects 51 rows; fixture proves page replacement and selection retention. Cross-page selection cap and server cursor authorization remain learner tests |
| User restores filters on a shared device | Explicit, scoped, versioned intent only; fetch fresh first page and reject bad stored shape/version | Unicode/scope/version/oversized-storage fixture checks passed; shared-device policy and logout deletion must be implemented before enabling persistence |
| Catalogue changes during browsing | Server rejects expired/inconsistent snapshot; client shows recovery and clears selection | Mismatched-token client test passed; actual stable snapshot implementation is not supplied by a token alone |
| Keyboard user advances a page | Initial load preserves focus; user-requested accepted page focuses result heading and announces a status | DOM-focus check passed; native browser, screen reader, zoom and reflow observations still required |
| Product needs responsive results | Proposed page budget: 50 rows, agreed maximum response bytes and p95 interaction latency under a recorded workload | Set and measure byte/latency/heap budgets on specified hardware/network; no browser performance result is claimed |

The linked workflow contains an authored **decision record** with context, chosen pagination/persistence policy, alternatives and consequences. It is an actual design artifact for this fixture, not proof that a stakeholder approved it or a learner implemented it. Revisit the decision if users need arbitrary page jumps, editable rows, bulk selection or offline operation.

### Practical exercise

Choose one feature and write three quality scenarios before coding. For each, record stakeholder, stimulus, load/environment, measurable response, architecture choice, cost/trade-off and exact verification method. Implement one negative test and one measurement. Retain raw results and reconcile failures against the original threshold; do not change the threshold after a failed run without recording the decision.

Acceptance: all scenarios trace to tests/measurements, proposed versus observed values are visibly distinct, and remaining manual checks have an owner. Use the [official React](https://react.dev/reference/react/useEffect) and [WAI table guidance](https://www.w3.org/WAI/tutorials/tables/) when validating the example's lifecycle and semantics. Learner practice remains outstanding.
