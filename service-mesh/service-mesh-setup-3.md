Configure service-to-service security
Understand mutual TLS (mTLS)
TLS is used to protect network communication through encryption and authentication.

Mutual TLS, or mTLS, adds an important property: both sides authenticate each other using certificates.

In our example:
User Service
      |
      v
User Envoy Proxy
      |
      | Encrypted connection
      | Both sides authenticate
      |
      v
Payment Envoy Proxy
      |
      v
Payment Service

The proxies establish the authenticated, encrypted connection.

The Node.js application doesn't need to implement the proxy-to-proxy TLS handshake itself.

However, mTLS between the proxies does not automatically authenticate the individual end user or authorize every payment operation.

Those are separate security requirements.
Step 19: Enforce strict mTLS
Add this final Istio resource to mesh-demo.yaml:
---
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
spec:
  mtls:
    mode: STRICT

Let's understand it.

kind: PeerAuthentication

This resource configures how workloads accept connections.

mode: STRICT

This requires connections covered by the policy to use mutual TLS.

Since we have not specified a namespace in the resource metadata, it is created in the namespace used when we apply the YAML file.

We'll apply the file to the default namespace.

That means this policy is namespace-wide, so other workloads in that namespace may also be affected.

For this example to work correctly:
1. Istio must be installed.
2. The application pods must receive their Envoy sidecars.
3. The routing resources must be accepted by Istio.
4. The service-to-service connection must use compatible mesh identities and mTLS settings.