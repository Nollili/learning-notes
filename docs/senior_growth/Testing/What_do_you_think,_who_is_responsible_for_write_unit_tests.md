# What do you think, who is responsible for write unit tests?

# 🧪 Responsibility for Writing Unit Tests

**Unit tests** are a fundamental part of software quality, and **responsibility should be shared across the team**, but primarily it falls on **developers writing the code**.

---

## 1️⃣ Primary Responsibility: Developers

- **Who:** The engineer who writes the feature or module
- **Why:**
  - They know the **implementation details and expected behavior**
  - Writing tests alongside the code ensures **immediate feedback**
  - Aligns with **TDD / FIRST principles**
- **Benefits:**
  - Fewer bugs in production
  - Faster debugging and refactoring
  - Encourages clean, modular code design

---

## 2️⃣ Secondary Responsibility: Team / Code Review

- **Code reviewers / peers** should ensure:
  - Tests exist for new features
  - Tests are meaningful and follow best practices
  - Coverage of edge cases and critical paths
- **Pair programming / mob programming** can also help maintain test quality

---

## 3️⃣ Other Stakeholders

- **QA / Test Engineers:**
  - Typically focus on **integration and E2E tests**, but may contribute unit tests in some teams
- **Tech Leads / Architects:**
  - Ensure **testing culture is enforced**
  - Set coverage standards and guidelines

---

## 4️⃣ Best Practices

1. **Write tests as you code** (TDD or alongside feature development)
2. **Test critical paths first**
3. **Review unit tests in PRs** like production code
4. **Maintain ownership**: developers who break the code should fix the tests

---

### ✅ Key Takeaways

- **Developers are primarily responsible** for unit tests.
- **QA and team leads** support and enforce quality and coverage.
- **Ownership matters:** the closer the test is to the code, the better its quality.

> 💡 Senior Tip:  
> Unit tests are **part of the definition of done (DoD)** for a feature. No code should be merged without meaningful tests.
