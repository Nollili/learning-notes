### Did you have some significant fails on production? (crushes, critical bugs) How do you handle and prevent them?

### **Common Causes of Failures in Production:**

1. **Lack of Testing**: Insufficient testing, especially when it comes to integration and edge cases, can lead to bugs making it to production.
2. **Complex Deployments**: Complicated deployment processes without proper versioning, rollbacks, or validation steps can introduce errors.
3. **Unexpected User Behavior**: Sometimes, real-world usage patterns differ from what was anticipated, leading to unhandled edge cases.
4. **External Dependencies**: API failures, service downtimes, or changes in external services can cause unexpected failures.
5. **Inadequate Monitoring**: Missing or poorly configured monitoring tools can lead to undetected issues escalating into larger problems.

---

### **How to Handle Critical Bugs or Failures in Production**

1. **Immediate Response**:
    - **Triage and mitigate**: Assess user impact, stop harmful work and stabilize service using the runbook. Gather enough evidence to choose a mitigation; exhaustive root-cause analysis follows stabilization.
    - **Revert if Necessary**: If a deployment is suspected to be the cause of the issue, roll back application traffic only to an artifact compatible with the current data/schema. A destructive migration or external side effect may require a forward fix or controlled recovery, not a blind reverse deployment.
    - **Communicate with stakeholders**: Notify your team, stakeholders, and customers (if necessary) that you're aware of the issue and working to resolve it.
    - **Fix and test**: Once the root cause is found, fix the issue, and test the fix in a staging environment to ensure it resolves the issue without introducing new problems.
2. **Patch or Hotfix**:
    - **Release a patch or hotfix** to address the issue as quickly as possible. Ensure that the patch has undergone rapid testing before deployment, even if it's minimal (e.g., unit tests, smoke tests).
    - **Deploy in smaller chunks**: Use a canary for a measured subset, or blue-green for a switch between prepared environments. They can be combined, but blue-green alone does not imply a small user cohort.
3. **Post-Incident Analysis (Postmortem)**:
    - After the issue is resolved, conduct a **postmortem** analysis to understand what went wrong and why the bug was not detected earlier.
    - **Root cause analysis (RCA)** helps identify gaps in processes, tools, or testing that allowed the issue to slip through.
    - Document the incident and share findings with the team to prevent recurrence.

---

### **How to Prevent Failures in Production**

1. **Testing Strategy**:
    - **Unit Tests**: Ensure the individual components of the application are tested and can handle various edge cases.
    - **Integration Tests**: Test how different modules of the application work together to ensure there are no conflicts.
    - **End-to-End Tests**: Simulate the user experience in a controlled environment to catch critical failures before reaching production.
    - **Load Testing**: Verify how the application behaves under heavy usage or traffic, especially for APIs or microservices that may handle high concurrency.
2. **Continuous Integration / Continuous Deployment (CI/CD)**:
    - Implement CI/CD pipelines that automatically run tests and deploy the application in stages to production.
    - A failed predeployment build stops promotion. For a deployed failure, gate any automatic traffic rollback on a known-compatible artifact/schema contract and explicit health criteria.
3. **Feature Flags**:
    - Use **feature flags** to release new functionality incrementally. This allows you to turn off specific features in production if they cause issues, without needing a full rollback.
    - Feature flags also make it easier to test in production and gradually roll out changes.
4. **Automated Monitoring & Alerts**:
    - Set up real-time **monitoring** (e.g., using tools like Prometheus, Grafana, New Relic, or Datadog) to track application performance, errors, and system health.
    - Implement **alerting** for critical issues like high error rates, slow response times, or service outages. Ensure alerts are actionable and reach the appropriate teams for a quick response.
5. **Log Aggregation and Analysis**:
    - Centralize logs from various services and applications using tools like **ELK Stack (Elasticsearch, Logstash, Kibana)**, **Splunk**, or **LogRocket**.
    - Analyze logs to identify patterns or potential issues before they escalate into critical bugs.
6. **Versioning and Rollback Procedures**:
    - Version code and migration history, but distinguish application rollback from data recovery. Dropped values and already committed side effects are not recreated by version control or a down migration.
    - A canary exposes a selected subset; blue-green switches traffic between environments. Both still need schema compatibility, monitoring and a tested mitigation plan.
7. **Chaos Engineering**:
    - Conduct **chaos engineering** experiments (e.g., using tools like **Gremlin** or **Chaos Monkey**) to intentionally introduce failures into your system in a controlled manner. This helps test the resilience of your system and how it handles unexpected situations.
8. **Clear Documentation and Runbooks**:
    - Maintain clear **documentation** and **runbooks** for handling critical failures. Ensure that everyone in the team knows what steps to take in case of issues, including debugging processes, escalation procedures, and troubleshooting guides.
9. **Code Reviews & Pair Programming**:
    - Encourage thorough **code reviews** and practices like **pair programming** to catch potential bugs early and ensure high code quality before deployment.
10. **Proactive Load and Stress Testing**:
    - Stress-test your system periodically under realistic load scenarios, especially before major releases or changes. This helps prevent performance bottlenecks in production.

---

### **Summary**

- **In case of a critical bug or failure in production**, the key steps are diagnosing quickly, fixing the issue, communicating effectively, and learning from the incident through postmortem analysis.
- **Preventative measures** include robust testing (unit, integration, end-to-end), CI/CD pipelines, feature flags, comprehensive monitoring, and thorough documentation.
- A proactive approach to system stability, including chaos engineering and periodic load testing, can significantly reduce the likelihood of production failures.

By adopting these practices, you can not only minimize the risk of failures but also respond quickly when they do occur, ensuring that your applications remain reliable and resilient.

## A concrete incident decision

If a renamed database column breaks an old replica, first stop the unsafe rollout/affected intake and assess whether a compatibility view/additive column or a forward fix restores service safely. Do not drop the new column to make an old binary start when new writes already depend on it.

If data was deleted, preserve evidence, isolate ongoing damage and follow a tested restore/PITR plan on a separate target with a declared recovery point and reconciliation. A backup existing is not proof it can restore within the required time or preserve later valid writes.

Assign an incident lead, one operational change owner and a communication cadence. Record timestamps/observations/actions without credentials or personal payloads. Use reversible mitigation where feasible and verify the user-facing invariant, not only process liveness. Postmortem actions need owners and verification criteria; avoid inventing personal incident experience from this template.


Reference checked2026-10-22: [Google SRE canary release safeguards](https://sre.google/workbook/canarying-releases/). Do not run chaos experiments against production merely because a study checklist mentions them; use an owned isolated lab.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/design/Did_you_have_some_significant_fails_on_production%2C_crushes%2C_critical_bugs%2C__%26_How_do_you_handle_and_prevent_them.md). All learner practice remains outstanding.
