# What is a CDN and what is the benefit of using one?

## CDN (Content Delivery Network) {#%F0%9F%94%B9-cdn-content-delivery-network}

A **CDN (Content Delivery Network)** is a **distributed network of servers** located in multiple geographical locations that **deliver web content to users based on their location**. It is commonly used for **static assets** like images, CSS, JavaScript, fonts, and sometimes even videos or APIs.

---

## How a CDN Works {#_1%EF%B8%8F%E2%83%A3-how-a-cdn-works}

1. Your **website assets** are hosted on **origin servers**.
2. CDN **replicates and caches** these assets across multiple **edge servers** worldwide.
3. When a user requests content:
   - The provider routes to an available edge according to its network/routing policy; this is not necessarily the geographically nearest point.
   - This reduces **latency** and **load on the origin server**.
4. CDN may also provide:
   - **Compression** (gzip, Brotli)
   - **SSL termination**
   - **DDoS protection**
   - **Caching policies** for performance

---

## Benefits of Using a CDN {#_2%EF%B8%8F%E2%83%A3-benefits-of-using-a-cdn}

### 2.1 Improved Performance
- Assets are served from **edge locations closer to users**.
- Reduces **Time to First Byte (TTFB)** and page load times.

### 2.2 Scalability
- Handles **high traffic spikes** efficiently.
- Offloads traffic from your **origin server**.

### 2.3 Reliability & Availability
- If one server goes down, another **edge server serves the content**.
- Redundant network improves **uptime**.

### 2.4 Security
- Many CDNs provide **DDoS protection**.
- Supports **HTTPS / TLS** and **Web Application Firewalls (WAF)**.

### 2.5 SEO & User Experience
- Faster measured delivery can improve user experience; a CDN does not guarantee a search-ranking outcome.
- Enhances **user experience** on slow or mobile networks.

---

## Example of CDNs {#_3%EF%B8%8F%E2%83%A3-example-of-cdns}

- **Public CDNs** for libraries:
  - Google Hosted Libraries: `https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js`
  - jsDelivr: `https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js`
- **Full-featured CDN providers**:
  - Cloudflare
  - AWS CloudFront
  - Akamai
  - Fastly

---

## Historical syntax examples (not current library recommendations) {#_4%EF%B8%8F%E2%83%A3-historical-syntax-examples-not-current-library-recommendations}

**Using jQuery from a CDN**
```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
```

**Custom assets with CDN**

* Your static files (JS, CSS, images) can be uploaded to a CDN like **CloudFront** or **Netlify**.
* Then you reference them via the **CDN URL**:

```html
<link rel="stylesheet" href="https://cdn.example.com/styles/main.css">
```

---

### Summary {#%E2%9C%85-summary}

* **CDN** = network of distributed servers to serve content **closer to the user**.
* **Benefits**:

  * Faster load times (performance)
  * Scalable and reliable
  * Security features (DDoS, SSL)
  * Better SEO & UX
* Ideal for **static assets, large media, or global applications**.

> Senior Tip:
> Use CDNs **for libraries, static assets, images, and videos**. Combine with **caching headers** to maximize performance and reduce server load.


## Worked cache identity and private-data exclusion

Choose self-hosted, versioned public assets as the primary example; a CDN can serve them behind the application's asset origin. Cache only declared public bytes. Authenticated APIs, account HTML, responses setting cookies and requests varying by private context need a deliberate private policy. `private` forbids shared caching; `no-store` forbids storing the response. `no-cache` instead permits storage but requires revalidation before reuse. Neither a purge request nor a header change erases every copy already delivered to a user.

This conservative application policy computes an immutable asset path and SHA384 integrity metadata from **exact** synthetic source bytes. It does not configure a provider or deploy the file; the build/deployment must write those same bytes and map the headers/key into the actual edge behavior.

```js
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const source = 'console.log("public demo");\n';
const digest = createHash('sha256').update(source).digest('hex');
const assetPath = `/assets/demo.${digest}.js`;
const integrity = `sha384-${createHash('sha384').update(source).digest('base64')}`;
function cachePolicy(url, method = 'GET', requestHeaders = {}, responseHeaders = {}) {
  const request = new Headers(requestHeaders), response = new Headers(responseHeaders);
  const target = new URL(url, 'https://owned.invalid');
  if (method !== 'GET' || target.origin !== 'https://owned.invalid' || target.pathname !== assetPath || target.search ||
      request.has('authorization') || request.has('cookie') || response.has('set-cookie')) {
    return {cacheControl: 'private, no-store', sharedKey: null};
  }
  return {cacheControl: 'public, max-age=31536000, immutable', sharedKey: `asset-v1|${target.origin}|${assetPath}`};
}
assert.equal(cachePolicy(assetPath).cacheControl, 'public, max-age=31536000, immutable');
assert.equal(cachePolicy('/api/me').sharedKey, null);
assert.equal(cachePolicy(assetPath, 'GET', {Authorization: 'synthetic'}).sharedKey, null);
assert.equal(cachePolicy(assetPath, 'GET', {Cookie: 'synthetic'}).sharedKey, null);
assert.equal(cachePolicy(assetPath, 'GET', {}, {'Set-Cookie': 'synthetic'}).sharedKey, null);
assert.equal(cachePolicy(assetPath + '?variant=private').sharedKey, null);
assert.equal(cachePolicy(assetPath, 'POST').sharedKey, null);
assert.equal(cachePolicy('https://other.invalid' + assetPath).sharedKey, null);
assert.notEqual(createHash('sha384').update(source + ' ').digest('base64'), integrity.slice(7));
console.log(JSON.stringify({assetPath, integrity, checks: 'nine cache/projection/integrity assertions passed; not a CDN/browser test'}));
```

Nine Node24.18 assertions passed: declared asset caching, private API/auth/cookie/set-cookie/query/method/origin exclusion and a one-byte integrity mismatch. This local function does not prove a CDN honors that cache key or that a browser enforces SRI/CSP. All query-bearing requests bypass shared caching here; another public endpoint needing locale/filter variants must include those validated dimensions in its actual key and any required `Vary` behavior. Never drop authorization/tenant context from a shared cache key and then store a personalized response.

An emitted manifest could reference the exact computed file with the computed integrity string. Use actual build output instead of an invented digest. For cross-origin SRI-protected scripts/styles, the serving origin must provide the required CORS response and the element uses the matching anonymous fetch policy. Integrity pins bytes, not the trustworthiness of those bytes. A compromised build or an intentionally malicious pinned script still executes; audit dependencies and keep CSP as another boundary.

A restrictive illustrative response policy for a self-hosted script-only page is:

```text
Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'
```

Adapt and test this header to the actual app; it intentionally blocks inline scripts/styles and any undeclared remote host. Do not add unsafe-inline merely to silence a violation. A third-party CDN host would need an explicit reviewed source policy and availability/privacy decision. Minification is not secret protection; never ship credentials or private source maps as public assets.

For releases, upload new content-addressed assets before updating referencing HTML, retain previous assets for the supported rollback/client window and give HTML an appropriate revalidation/freshness policy. Purge mutable paths carefully and observe stale/error behavior; do not promise instant global invalidation or that stale cached private data is safe. CDN failover/security features are configuration-dependent and do not replace a healthy origin or authorization.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/specialists/What_is_a_CDN_and_what_is_the_benefit_of_using_one.md). All learner practice remains outstanding.
