# Cognito and application access

AWS infrastructure identity and customer identity are different layers. IAM authorizes AWS API actions. Cognito can manage application sign-in and, through identity pools, help users obtain temporary AWS credentials.

## Authentication versus authorization

Authentication establishes who the caller is. Authorization determines what they may do. A signed-in customer can still be forbidden from reading someone else's order.

| Mechanism | What it establishes | What it does not establish |
|---|---|---|
| JWT validation | Trusted issuer's claims, subject to proper verification | Permission to every requested record |
| API key | Possession of a configured key | A complete user login or ownership model |
| Basic authentication | Username/password credentials in an HTTP header | Encryption or sophisticated session management |
| IAM authorization | Permission for an AWS action under policies | Every application-specific business rule |

Basic authentication uses Base64 encoding, which is reversible and is not encryption. HTTPS protects the transport. An OAuth client ID/secret identifies an application in relevant flows; it is not simply another name for an API key. Browser applications cannot keep a bundled client secret confidential.

## What a JWT means

A typical signed JWT has a header, payload and signature. Its payload is encoded, not necessarily encrypted. Do not store secrets in it. Decoding a token does not verify it.

Verification includes the expected signing algorithm and trusted key, issuer, audience or client binding appropriate to the token type, expiration and intended use. ID tokens describe authentication; access tokens serve authorization purposes in their intended context. A token's exact validation rules depend on the issuer and integration.

Bearer tokens require careful storage and log handling. Cookie-based sessions introduce CSRF considerations; browser-accessible storage exposes tokens to JavaScript compromise. Reuse the hub's [authentication chapter](../node-js/module-09-authentication-authorization.md) for the underlying web-security tradeoffs.

## User pools and identity pools

| Cognito component | Main responsibility | Example |
|---|---|---|
| User pool | Sign-up, sign-in, user directory and token issuance | Customer logs into the store |
| Identity pool | Exchange supported identity evidence for temporary AWS credentials | Customer accesses a restricted S3 prefix directly |

You can use a user pool without an identity pool. With browser → API Gateway → Lambda → S3, the customer token is checked at the API boundary while Lambda accesses S3 through its execution role. If the browser needs direct AWS access, an identity pool is one possible design; a narrowly scoped presigned URL is another for specific file operations. [Cognito user pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html), [identity pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html).

## API Gateway authorizers

A REST API can use a Cognito user pool authorizer. HTTP APIs have JWT authorizers. Lambda authorizers implement custom authorization logic when supported by the selected API product. These are related mechanisms with different configuration contracts.

An authorizer can reject unauthenticated or insufficiently scoped requests before business logic. The handler must still enforce record-level access using a trusted subject. A caller-supplied `userId` is not proof of ownership.

Caching authorizer decisions can improve efficiency, but cache keys and policies must match the scope of the decision. A decision about one route or user must not accidentally authorize unrelated access.

## Responses and visibility

Use `401` for missing or invalid authentication when appropriate and `403` for authenticated callers who lack permission. Some applications deliberately conceal resource existence; document that contract consistently. Do not copy the source diagrams' `400` response as the universal authentication error.

CORS controls browser access to responses; it does not protect an endpoint from unauthorized non-browser requests. The same authorization rules must hold regardless of client type.

Continue with [compute](./compute-and-scaling.md) and [networking](./networking.md).
