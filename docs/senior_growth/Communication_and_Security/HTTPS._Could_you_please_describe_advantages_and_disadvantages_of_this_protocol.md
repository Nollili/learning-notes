# HTTPS — Advantages and Disadvantages {#https-—-advantages-and-disadvantages}

#### What is HTTPS? {#%F0%9F%94%92-what-is-https}
HTTPS (Hypertext Transfer Protocol Secure) is HTTP protected by **TLS** (SSL is obsolete historical terminology), providing **encryption**, **data integrity**, and **authentication** between client and server.
It ensures secure communication over the web.

---

### **Advantages** {#%E2%9C%85-advantages}

1. **Data Encryption**
    - Application content is encrypted between TLS endpoints; endpoint/CDN termination, logs and visible traffic metadata remain separate boundaries.
    - Protects sensitive data (passwords, tokens, personal info) from eavesdropping and man-in-the-middle attacks.

2. **Data Integrity**
    - Ensures that the data sent is not modified or corrupted during transfer.
    - TLS detects any tampering attempts.

3. **Authentication**
    - Certificates verify the identity of the server (and optionally client).
    - Certificate validation authenticates the requested endpoint identity under the trust policy; a malicious site can also have a valid certificate.

4. **Improved SEO & Trust**
    - HTTPS is a deployment/security baseline; it does not guarantee a search rank or a trustworthy application.
    - Browsers label HTTP sites as “Not Secure”.

5. **Enables Modern Features**
    - Many platform APIs require a secure context, normally HTTPS; local-development exceptions, browser support and permission policies are separate requirements.

---

### **Disadvantages** {#%E2%9D%8C-disadvantages}

1. **Performance Overhead**
    - Slight increase in CPU usage due to encryption/decryption.
    - Modern hardware and TLS session resumption reduce this impact.

2. **Certificate Management**
    - Certificates expire and must be renewed.
    - Misconfigured or expired certificates can break access.

3. **Cost & Complexity**
    - Some certificates require payment.
    - Requires configuration (redirects, HSTS, mixed content handling).

4. **Caching Complications**
    - HTTPS traffic can’t be cached by some proxies or intermediate servers unless explicitly configured.

---

### **Summary Table** {#%E2%9A%99%EF%B8%8F-summary-table}

| Aspect              | HTTP                     | HTTPS                                |
|---------------------|--------------------------|--------------------------------------|
| Security            | No TLS transport protection | Encrypted with TLS               |
| Data Integrity      | Not guaranteed           | Protected against tampering          |
| Authentication      | None                     | Verified via certificate             |
| Performance         | Depends on protocol/cache/network | Handshake/crypto costs and connection reuse must be measured |
| Application trust   | Not established          | Endpoint authentication does not establish benign content |
| Access to APIs      | Limited                  | Required for modern web features     |

---

### **Best Practice** {#%F0%9F%92%A1-best-practice}
Always use HTTPS — the minor cost of setup and overhead is far outweighed by the security, trust, and compatibility benefits.

## TLS1.3 handshake: separate key establishment and authentication

Version reference checked2026-10-22: RFC9846 (July2026) obsoletes RFC8446 while still specifying TLS1.3. The following is a conceptual certificate-authenticated handshake, not a cryptographic implementation recipe.

| Stage | Purpose |
|---|---|
| ClientHello / ServerHello | Negotiate parameters and key-establishment inputs, commonly ephemeral(E)DHE shares |
| Key schedule | Derive handshake/traffic secrets; the client does not encrypt a chosen session key with the certificate's RSA key |
| EncryptedExtensions / Certificate / CertificateVerify | Communicate parameters and certificate authentication; verify identity/trust and the transcript signature |
| Finished | Verify handshake transcript integrity before normal application use |
| Application records | Protect traffic using derived authenticated-encryption keys, e.g. AES-GCM or ChaCha20-Poly1305 |

ECDSA is a signature algorithm, not encryption or key agreement. TLS1.3 does not use RSA key transport; RSA signatures are a different role. Resumption uses a PSK derived/associated with prior establishment to bootstrap new connection secrets, not simply reuse old traffic keys. PSK-only and asymmetric-exchange modes have different forward-secrecy properties. Optional0RTT early data has replay limitations and is not equivalent to ordinary confirmed application traffic.

A1.1/2 HTTPS example normally negotiates TLS over TCP, whereas HTTP3 uses QUIC's integrated TLS1.3 handshake/keying. A certificate signature algorithm alone does not identify every negotiated exchange/cipher property. Use maintained TLS/platform implementations and their deployment guidance; do not reproduce this table as home-grown security code.

## Operational boundaries and diagnosis

Keep certificate renewal, chain/hostname/time validation, mixed content, redirects, HSTS and termination-hop policies explicit. Do not disable verification to make a failing request pass. A trusted terminating proxy can read traffic at that boundary; secure the next hop and logs according to the system design. HTTP caches still work over HTTPS at authorized endpoints/CDNs; authorization/cache-key/private response policy determines what may be shared. TLS does not fix XSS, CSRF, object authorization or leaked application secrets.


Official sources: [current TLS1.3 RFC9846](https://www.rfc-editor.org/info/rfc9846/), [historical TLS1.3 RFC8446/status](https://www.rfc-editor.org/info/rfc8446/), [early-data policy RFC8470](https://www.rfc-editor.org/info/rfc8470/), [HTTP3 RFC9114](https://www.rfc-editor.org/info/rfc9114/). Checked2026-10-22; review standards status and platform policy when deploying.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/security/HTTPS._Could_you_please_describe_advantages_and_disadvantages_of_this_protocol.md). All learner practice remains outstanding.
