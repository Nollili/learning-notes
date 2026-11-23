---
outline: [2, 3]
---

# Monitoring Node.js systems

The primary path is Node.js 24 → `@prometheus-io/client`0.16.1 → Prometheus → Grafana. Other products below are alternatives with different operating contracts. Pin versions in a real lab and check deployment compatibility before upgrading. Official references checked 2026-11-05.

<!-- tech-check: t22-q01; level: 5 -->

## Which signals tell you whether the service is healthy?

*Study depth: Foundational*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐⭐⭐⭐⭐

Source mapping: [R095](./requirements.md#r095), [R146](./requirements.md#r146).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**Start by checking whether users' operations succeed**, then use diagnostic signals to explain the result. Metrics summarize measurements over time. Logs describe individual events. Traces connect the steps of an operation. Profiles show where execution or memory costs arise.

**A running process or green dashboard does not prove requests are succeeding.** Check traffic, errors, response times and resource pressure together. Also distinguish missing measurements from zero failures: a broken monitoring path can hide an unhealthy service.

</div>

Define an SLI precisely: successful eligible requests / all eligible requests, measured at a stated boundary, or the fraction completing within a latency objective. Define which outcomes and time window count before drawing an SLO/error-budget conclusion. An error budget is the permitted unreliability under that objective; it is not permission to hide failed traffic by changing the denominator.

Track request rate, errors, latency distribution and saturation. Add queue oldest-message age, consumer lag, retry/dead-letter rate, database pool wait and event-loop delay when they explain the service. A growing queue with steady consumers differs from a disconnected consumer. A low average can hide a bad tail; show p95/p99 alongside volume and distribution.

A trace shows selected spans, not every request if sampling is enabled. Correlate a slow trace with safe logs and a CPU/heap profile when necessary. A high event-loop delay is a symptom; use the [diagnostic signals lesson](../module-11-performance-diagnostics.md#_12-logs-metrics-traces-and-profiles) and [performance questions](./12-performance-and-v8.md) to distinguish CPU work, GC, blocking calls and host contention.

**Missing telemetry is not a zero failure rate.** Monitor the observer: target discovery, scrape/ingestion failures, clocks, retention and alert routing. Avoid raw URLs, request IDs, emails and unbounded tenant IDs in metric labels: every combination creates a series, multiplying storage and query cost. Put carefully controlled correlation IDs in logs/traces instead.

<span class="notes-section-label">**Practice and acceptance**</span>

Define two user-facing SLIs and one saturation signal for the products service. Inject a dependency failure and stopped telemetry. Accept when the dashboard distinguishes failed requests, absent data and zero traffic, with a written denominator and actionable owner. Reference: [Prometheus instrumentation practices](https://prometheus.io/docs/practices/instrumentation/).

---

<!-- tech-check: t22-q02; level: 5 -->

## How do you expose bounded, correctly labelled application metrics?

*Study depth: Intermediate*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐⭐⭐

Source mapping: [R096](./requirements.md#r096).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Use a counter for accumulated events, a gauge for a current value and a histogram for the distribution of measurements, such as response times. **Count each completed request once and use consistent units.** If you increment an active-request gauge, decrement it on every completion or failure path.

**Keep metric labels to a small, controlled set.** Every different combination creates another time series. Raw URLs, request IDs and private user data can create huge numbers of series, expose information and exhaust monitoring resources. Use bounded route names or outcome categories instead.

</div>

Install the example dependency in an owned study directory with `npm install --save-exact @prometheus-io/client@0.16.1`. This package replaces the deprecated `prom-client` name; existing projects need a reviewed migration rather than a blind search-and-replace. An isolated registry keeps fixture metrics separate from global registrations.

```js [metrics-fixture.mjs]
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { Registry, Counter, Gauge, Histogram } from "@prometheus-io/client";
const registry = new Registry();
const requests = new Counter({
  name: "study_http_requests_total",
  help: "Completed requests",
  labelNames: ["route", "outcome"],
  registers: [registry],
});
const active = new Gauge({
  name: "study_http_active_requests",
  help: "Active requests",
  registers: [registry],
});
const duration = new Histogram({
  name: "study_http_request_duration_seconds",
  help: "Request duration in seconds",
  labelNames: ["route"],
  buckets: [0.005, 0.02, 0.1, 0.5, 1],
  registers: [registry],
});
const server = http.createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  if (path === "/metrics") {
    try {
      res.writeHead(200, { "Content-Type": registry.contentType });
      res.end(await registry.metrics());
    } catch {
      res.writeHead(500);
      res.end();
    }
    return;
  }
  const route =
    req.method === "GET" && path === "/work" ? "/work" : "unmatched";
  const start = performance.now();
  let observed = false;
  active.inc();
  const observe = () => {
    if (observed) return;
    observed = true;
    const outcome = !res.writableFinished
      ? "aborted"
      : res.statusCode >= 500
        ? "error"
        : res.statusCode >= 400
          ? "rejected"
          : "ok";
    active.dec();
    requests.inc({ route, outcome });
    duration.observe({ route }, (performance.now() - start) / 1000);
  };
  res.once("finish", observe);
  res.once("close", observe);
  res.writeHead(route === "/work" ? 200 : 404);
  res.end();
});
server.listen(0, "127.0.0.1");
await once(server, "listening");
const base = `http://127.0.0.1:${server.address().port}`;
try {
  for (const path of ["/work", "/private?token=canary-secret"]) {
    const response = await fetch(base + path);
    await response.arrayBuffer();
  }
  const response = await fetch(base + "/metrics");
  const text = await response.text();
  assert.match(response.headers.get("content-type"), /text\/plain|openmetrics/);
  assert.match(
    text,
    /study_http_requests_total\{route="\/work",outcome="ok"\} 1/,
  );
  assert.match(
    text,
    /study_http_requests_total\{route="unmatched",outcome="rejected"\} 1/,
  );
  assert.match(text, /study_http_active_requests 0/);
  assert(!text.includes("canary-secret") && !text.includes("/private"));
} finally {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}
```

This self-closing HTTP fixture checks two responses and exposition, not production throughput. The scrape endpoint excludes itself, avoiding feedback in application traffic metrics. In a real router assign the matched route template rather than parsing arbitrary paths into labels. Protect metrics through an internal network/authentication boundary; they can reveal system shape even without personal labels. Configure timeouts and bounded export work so a scrape cannot become unbounded application work.

An isolated registry does not magically aggregate multiple workers. Each process has its own memory: scrape per-instance targets and aggregate queries deliberately, or use a compatible documented multiprocess strategy. Never sum a gauge that represents duplicated shared state without understanding its meaning.

<span class="notes-section-label">**Practice and acceptance**</span>

Extend an owned HTTP application with aborted, failed and successful requests. Accept when completion is counted once, the active gauge returns to zero, units are seconds, scrape requests are excluded and no raw path/query/ID becomes a label. Reference: [official Node client](https://github.com/prometheus/client_js).

---

<!-- tech-check: t22-q03; level: 5 -->

## How do scraping, PromQL and alerts fit together?

*Study depth: Intermediate*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐⭐⭐

Source mapping: [R096](./requirements.md#r096), [R146](./requirements.md#r146).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Prometheus periodically fetches metrics from configured targets; this is called scraping. It stores labelled samples and uses PromQL queries and rules to evaluate them. Alertmanager groups alerts and routes notifications to the intended destination.

**Distinguish real user failures, too little traffic to judge, and missing measurements.** A failed scrape or absent error series is not automatically a zero error rate. Test alert expressions and the notification path, and give each alert a clear owner and response procedure.

</div>

For a persistent study server listening on port 9464, a minimal Prometheus configuration is:

```yaml [prometheus-study.yml]
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: products-study
    static_configs:
      - targets: ['127.0.0.1:9464']
```

The earlier fixture chooses an ephemeral port and exits: it is not that persistent target. Replace the address with the reachable owned server and validate using the matching `promtool check config`. Inside a container, localhost refers to that container, not the host or another service. Keep scrape endpoints and the Prometheus UI private; configure TLS/authentication according to the actual network boundary.

Use `sum(rate(study_http_requests_total[5m]))` for request throughput. `rate` accounts for counter resets over its window; subtracting two dashboard counter values is fragile. Classic histogram p95 across instances is:

```text
histogram_quantile(0.95,
  sum by (le) (rate(study_http_request_duration_seconds_bucket[5m]))
)
```

Keep `le` when combining classic buckets. Add `route` to the grouping for per-route p95. Do not average per-instance quantiles. Buckets must bracket the objective meaningfully; a p99 above your largest finite bucket cannot tell you the detailed tail. Queries for native histograms have a different shape; do not mix the two representations accidentally.

An illustrative high-failure rule combines error ratio with minimum volume:

```yaml [alerts-study.yml]
groups:
  - name: products-study
    rules:
      - alert: ProductsHighFailureRatio
        expr: |
          (sum(rate(study_http_requests_total{job="products-study",outcome="error"}[5m]))
          / sum(rate(study_http_requests_total{job="products-study"}[5m])) > 0.05)
          and (sum(rate(study_http_requests_total{job="products-study"}[5m])) > 1)
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: Products request failures exceed the study threshold
      - alert: ProductsTargetDown
        expr: up{job="products-study"} == 0
        for: 2m
      - alert: ProductsTargetAbsent
        expr: absent(up{job="products-study"})
        for: 2m
```

The 5%/one-request-per-second/10-minute values are teaching choices, not an SLO policy. A never-created `error` series makes the ratio absent until initialized/observed; decide whether to preinitialize bounded labels or explicitly handle absent outcomes. `up == 0` detects discovered targets with failed scrapes; `absent` covers removal of the whole selected target set, not each missing replica. Use expected-target inventory for that case. A dashboard showing zero instead of no data can hide this problem.

<span class="notes-section-label">**Practice and acceptance**</span>

Validate config/rules with the chosen Prometheus distribution and write `promtool test rules` cases for low volume, real failure, counter reset and missing target. Add a runbook: impact, owner, evidence, mitigation and recovery criteria. Accept when notifications are tested in an owned destination and telemetry outages are separately visible. References: [configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/), [rule tests](https://prometheus.io/docs/prometheus/latest/configuration/unit_testing_rules/).

---

<!-- tech-check: t22-q04; level: 5 -->

## When should you use Grafana or Kibana?

*Study depth: Intermediate*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐⭐⭐

Source mapping: [R096](./requirements.md#r096), [R191](./requirements.md#r191), [R192](./requirements.md#r192).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Grafana queries configured data sources to build dashboards of metrics and other signals. Kibana searches and visualizes data stored in Elasticsearch. Choose based on the data and investigation you need, and configure collection and storage separately.

**Check the query, time range, access permissions and underlying data before trusting a graph.** A blank panel can mean a bad query or missing ingestion rather than no events. Neither tool makes incomplete or incorrectly collected data reliable simply by displaying it.

</div>

For the primary Grafana path, add a Prometheus data source with the server-reachable URL, test connectivity, then build a request-rate panel with the previous `rate` query. Add error ratio, histogram latency and saturation panels with explicit units, legend, time window and missing-data behavior. Save/provision the dashboard with its data-source identifier rather than relying on a personal unsaved setup. Grant viewers read-only access; keep credentials in configured secrets, not dashboard JSON. Inspect the query output before interpreting a beautiful graph.

For Kibana, first ingest safe structured logs into an owned Elasticsearch index/data stream. Check timestamp mapping and field types, then create a data view matching that data with a chosen time field. In Discover, a KQL example is `service : "products-api" and level : "error"`; ensure those fields actually exist and are mapped appropriately. A missing timestamp or wrong time zone/range can make present events look absent. Current ES|QL workflows can query without a data view; follow the workflow your version provides.

Kibana does not automatically read a local Winston stream or scrape `/metrics`. Grafana does not itself replace every underlying storage backend. Both need access control, retention/cost ownership and a supported deployment version. Alternative tool familiarity is enough here; implement the primary stack deeply before operating two parallel telemetry estates.

<span class="notes-section-label">**Practice and acceptance**</span>

Build one Grafana dashboard, and in an owned Elastic sandbox locate a deliberately generated safe error event. Accept with matching event/time evidence, no-data behavior, restricted viewer access and exported setup instructions. References: [Grafana Prometheus source](https://grafana.com/docs/grafana/latest/datasources/prometheus/), [Kibana data views](https://www.elastic.co/docs/explore-analyze/find-and-organize/data-views).

---

<!-- tech-check: t22-q05; level: 5 -->

## Where do Graphite, Zabbix and New Relic fit?

*Study depth: Intermediate*

Level Up: L4 — Lead\
Tech Check level: ⭐⭐⭐⭐⭐

Source mapping: [R096](./requirements.md#r096), [R193](./requirements.md#r193).



<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Graphite collects time-series metrics. Zabbix monitors hosts and services through measured items, checks and triggers. New Relic provides a managed observability platform, including application performance monitoring, or APM.

**Choose an alternative to meet a concrete integration or operating need.** Naming or installing the product is not enough: configure data collection, access, retention and failure detection, then verify the measurements actually arrive. You do not need to operate every product to understand their different roles.

</div>

| Alternative | First owned setup | Evidence and failure check |
|---|---|---|
| Graphite | Configure Carbon receiver and storage retention/aggregation; send one bounded metric; query it through Graphite | Verify timestamp seconds, path, retention resolution and missing samples; never expose a plain receiver publicly |
| Zabbix | Register a study host, configure an appropriate agent/HTTP item and interval, then a trigger/action | Confirm item values and unsupported-item state; stop the study target, verify recovery; restrict active/passive agent trust |
| New Relic | Check supported Node/agent versions, install pinned agent, configure application name/region and secret credentials; initialize before instrumented application imports | Generate a safe transaction, find it in APM and test exporter loss; inspect attributes/sampling/cost and cleanup |

A Graphite plaintext sample is `study.products.queue_depth 3 1793836800` followed by a newline: metric path, numeric value and Unix seconds. Use the current timestamp in a real test. Set appropriate aggregation for queue-depth gauges versus event totals; downsampling can erase peaks. Do not put per-request identifiers in the metric path.

Zabbix's item is a measured value, a trigger evaluates a problem condition and an action routes the response. A host appearing in the UI is insufficient if its item is unsupported or collection is stale. For an HTTP check, define expected status/body and authentication so a generic proxy 200 is not mistaken for application health.

For New Relic, CommonJS preloading and ESM loader setup can differ; follow the pinned agent's documented startup procedure. Installing a package after application modules already loaded can miss instrumentation. Keep license keys out of Git/logs, choose approved data region and review captured headers/SQL/attributes before exporting. No account or remote destination is required to understand these comparisons; creating one is separate practice with cost/privacy approval.

<span class="notes-section-label">**Practice and acceptance**</span>

Choose one alternative that addresses a real gap in the primary lab. Document setup, safe sample, query, missing-data alert and teardown. Introductory coverage here does not require operating all three products. References: [Graphite ingestion](https://graphite.readthedocs.io/en/latest/feeding-carbon.html), [Zabbix quickstart](https://www.zabbix.com/documentation/current/en/manual/quickstart), [New Relic Node setup](https://docs.newrelic.com/docs/apm/agents/nodejs-agent/installation-configuration/install-nodejs-agent/).

## Revision and mixed practice

1. Error ratio disappears after restart. Is that proof no requests failed?
2. Every request gets a unique route label. Why can a small application overload telemetry storage?
3. A Grafana panel is blank while the process is running. What do you check first?

<span class="notes-section-label">**Answer guide — attempt the scenarios first**</span>

1. Check scrape health, counter initialization, traffic and window; absent is not zero.
2. Unique labels multiply series across metrics/buckets/instances; normalize to bounded route templates.
3. Query the data source directly, inspect scrape/ingestion health and time range, then panel permissions/query/units.
