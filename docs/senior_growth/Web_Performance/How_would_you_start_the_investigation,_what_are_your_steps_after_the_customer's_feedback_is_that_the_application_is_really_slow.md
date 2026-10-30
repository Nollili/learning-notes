# How would you start the investigation, what are your steps after the customer's feedback is that the application is really slow?


---

## **Collect Context and Define “Slow”** {#%F0%9F%A7%AD-1-collect-context-and-define-slow}
Before touching code, clarify what “slow” means to the user:
- When does the slowdown occur? (initial load, after interaction, specific page)
- How often and for whom? (all users, specific regions, browsers)
- What devices or network conditions?
- Are there logs or performance metrics available (e.g., Sentry, Datadog, New Relic)?

> Goal: Narrow the scope. “Slow” can mean slow rendering, high network latency, or sluggish UI.

---

## **Reproduce the Issue** {#%F0%9F%A7%A9-2-reproduce-the-issue}
- Attempt to reproduce the issue under similar conditions (browser, network speed, device).
- Use **browser throttling** (Network tab → Slow 3G) to simulate user experience.
- Observe what part of the experience is lagging:
  - Blank screen → likely large bundle or render-blocking script.
  - Late data → API latency.
  - Janky UI → inefficient rendering or heavy JavaScript.

---

## **Gather Data** {#%F0%9F%A7%A0-3-gather-data}
### **Browser DevTools** {#%F0%9F%94%B9-browser-devtools}
- **Performance Tab** – Record a performance profile:
  - Detect long tasks (>50ms), layout thrashing, or re-renders.
- **Network Tab** – Check:
  - Waterfall chart for long requests.
  - Payload size, TTFB (Time To First Byte), caching headers.
- **Coverage Tab** – Detect unused CSS/JS for possible tree shaking.
- **Lighthouse / Web Vitals report**:
  - Current Core Web Vitals: LCP, INP and CLS. Use TTFB/TBT and relevant traces as diagnostics; FID/TTI are historical, and Lighthouse removed TTI in version10.

### **Backend Monitoring (if applicable)** {#%F0%9F%94%B9-backend-monitoring-if-applicable}
- Check API response times and server logs.
- Profile database queries or caching (Redis, CDN, etc.).
- Use APM tools (Datadog, New Relic) to locate bottlenecks.

---

## **Identify the Bottleneck** {#%E2%9A%99%EF%B8%8F-4-identify-the-bottleneck}
Ask: *Where is the time being spent?*
- **Network-bound:** Slow APIs, no caching, large bundles → optimize APIs, enable CDN, compress assets.
- **CPU-bound:** Heavy JS parsing, large libraries, too many renders → code-splitting, memoization, virtualization.
- **Render-bound:** Too many DOM nodes or reflows → reduce complexity, debounce updates.

---

## **Optimize** {#%F0%9F%9A%80-5-optimize}
Based on findings:
- **Frontend load performance:**
  - Implement **code-splitting**, **lazy loading**, **tree-shaking**, **minification**, **preloading critical assets**.
  - Optimize images (responsive sizes, WebP).
- **Backend / API performance:**
  - Cache responses, paginate large datasets.
  - Optimize database queries.
- **UI performance:**
  - Use React.memo, useCallback, useMemo.
  - Virtualize long lists (e.g., `react-window`).
  - Avoid unnecessary re-renders (e.g., by splitting components).

---

## **Measure and Validate Improvements** {#%F0%9F%93%88-6-measure-and-validate-improvements}
After implementing changes:
- Re-run Lighthouse and DevTools audits.
- Measure **before vs. after** for metrics like:
  - TTFB/LCP/CLS, lab blocking/interaction traces, field INP and initial/total bytes as appropriate to the reported task.
- Validate perceived speed through user feedback.

---

## Summary Checklist {#%F0%9F%93%8B-summary-checklist}
| Step | Goal | Tools |
|------|------|--------|
| 1. Gather info | Understand scope | Communication |
| 2. Reproduce | Confirm issue | Browser/dev setup |
| 3. Profile | Find bottlenecks | DevTools, Lighthouse, APM |
| 4. Analyze | Identify cause | Network + JS profiling |
| 5. Optimize | Implement fixes | Code-splitting, caching, etc. |
| 6. Verify | Measure improvement | Lighthouse, Web Vitals |

---

### Hypothetical investigation, not measured project evidence
> Customer: “App loads really slowly on mobile.”
1. Reproduce on mobile throttling (3G, mid-range CPU).
2. DevTools → Network: 5 MB JS bundle.  
   → Hypothesis: initial JavaScript contributes; inspect request criticality, parse/evaluate tasks and interaction cost before calling it the root cause.
3. Apply **code-splitting** and **lazy load non-critical components**.
4. Illustrative values only: a candidate split might change initial bytes from5MB to1.5MB. Do not infer an8s→3.5s timing improvement from byte counts; define and measure a real loading/interaction outcome.

---

### Key Mindset {#%F0%9F%93%9A-key-mindset}
> As a senior developer, focus not just on fixing *symptoms* but building *monitoring and prevention systems*:
- Integrate **performance budgets** in CI/CD.
- Use **Core Web Vitals monitoring** (e.g., with Web Vitals library).
- Regularly audit bundle sizes and dependencies.

---

**In summary:**  
> Investigate → Measure → Identify → Optimize → Validate  
> Combine technical analysis with user perspective for lasting improvements.

## An evidence ledger for one reported task

Record a release/artifact, route, dataset, device/browser, cache/network/CPU conditions and exact interaction. Keep a baseline trace plus several repeated runs; identify input delay, processing and presentation cost before selecting a fix. An empty screen can have server, CSS, font, hydration or application-error causes as well as bundle cost. Throttling is useful reproduction evidence, not a real-device equivalence guarantee.

| Stage | Record | Reject this shortcut |
|---|---|---|
| Observation | Exact slow task, affected cohort and trace marker | “The app is slow” as a diagnosis |
| Hypothesis | Owning stack/resource and mechanism | Large transfer alone proves CPU delay |
| Controlled change | One relevant change, same artifact/scenario controls | Different device/cache conditions compared |
| Result | Correctness plus repeated raw timings/variability, initial and feature-open behavior | A single Lighthouse score or invented percentage |
| Follow-up | Field collection/cohort/sample limits and regression budget | Lab TBT declared equal to field INP |

The [INP/TBT diagnostic lesson](./What_is_TTFI_%28Time_to_first_interaction%29._How_can_we_improve_TTFI.md) defines current metric boundaries. The [production split/side-effects fixture](./What_are_some_general_practices_and_techniques_to_optimize_in_the_area_Explain_tree_shaking,_code_splitting_and_bundling,_minimizing,_data_caching..md#worked-production-analysis-module-contracts-before-chunk-tuning) supplies actual synthetic build evidence, explicitly distinct from native user timing.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/performance/How_would_you_start_the_investigation%2C_what_are_your_steps_after_the_customer%27s_feedback_is_that_the_application_is_really_slow.md). All learner practice remains outstanding.
