# Google sign-in

Google login uses Spring Security's OAuth authorization-code / OpenID Connect flow. React navigates to the backend; Google authenticates the user, and the backend verifies the response before creating the existing store session. Google tokens and the client secret are never sent to React. Password registration and login remain available.

## Local activation

In Google Auth Platform, create a **Web application** OAuth client. Set the frontend origin to `http://localhost:5173` and the authorized redirect URI to exactly `http://localhost:8081/login/oauth2/code/google`. Configure branding and the audience appropriate to your users. If the client is in testing, add the accounts you intend to test where Google requires test users.

Edit the ignored `backend/src/main/resources/application-local.properties` file. Uncomment and fill these fields at the bottom:

```properties
store.google.enabled=true
store.google.client-id=YOUR_CLIENT_ID.apps.googleusercontent.com
store.google.client-secret=YOUR_CLIENT_SECRET
store.google.redirect-uri=http://localhost:8081/login/oauth2/code/google
store.google.frontend-url=http://localhost:5173
```

Do not copy credentials into a tracked file. Restart the backend from `backend` using `bash mvnw spring-boot:run`, then reload Login or Register. **Continue with Google** becomes available after the backend reports that Google login is enabled. Missing credentials while enabled stop backend startup instead of exposing a broken login button.

Local development's Hibernate update adds the nullable, unique `user.google_subject` column. Existing production databases use `backend/db/migrations/003-google-login.sql` after a backup; fresh databases use the updated baseline schema. No existing user password or role is changed by the migration.

## Account rules

- New identities create CUSTOMER accounts with a verified Google email. Their Google subject is the stable identity key, rather than email.
- Returning identities reuse their account, orders and cart, preserving roles assigned by an administrator.
- An existing password account with the same email is not silently linked, including Admin/Staff accounts. The UI asks the user to use their existing password. A verified account-linking feature is not implemented.
- Google-only accounts cannot use password login. Their required password column stores an opaque random hash; no password is emailed or exposed.
- Google verifies identity, not permission. Existing backend ownership and role checks still apply.
- Google authorization uses Spring's state/nonce validation and session fixation protection. The success handler rotates the session and writes the same userId/email/role attributes as password login. Logout invalidates that session.
- Failed or cancelled authentication redirects to a friendly login error and leaves no signed-in store session. No provider exception details or tokens appear in that URL.

## Deployment

Configure `GOOGLE_LOGIN_ENABLED`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` and `GOOGLE_FRONTEND_URL` as server environment variables. Register the exact deployed HTTPS callback with Google. Keep frontend and backend behind the same public origin when possible so the session cookie works predictably.

The optional Compose setup passes these variables and Nginx forwards `/oauth2/` and `/login/oauth2/` to the backend. Its local default callback uses port **8080**, not 8081; add that exact callback to the Google client before testing Compose. Set the deployed URLs explicitly for hosting. Existing volumes need migration 003. Container execution remains unverified on this host.

## Verification and remaining real-account check

84 backend tests passed: the existing 73 plus eleven Google tests for account creation, verified claims, email collisions, returning subjects, password rejection, state/nonce redirect setup, forged callback rejection, public configuration, session rotation and failure cleanup. The full verify/package passed for the first 82 tests, followed by the two additional session tests. Frontend build and lint passed. Live ECOM health, preservation of all 52 products, admin password login/session and logout were checked. Browser checks cover both buttons, the disabled configuration state and account-collision feedback.

Actual sign-in with a real Google account still requires your local OAuth credentials. After activation, test a new Google customer, logout and repeat sign-in; confirm the same account/cart/order history. Also test cancelling Google consent and a Google email already used by a password account. No real Google login or production deployment is claimed by the automated tests.

References: [Spring OAuth login configuration](https://docs.spring.io/spring-security/reference/7.0/servlet/oauth2/login/advanced.html), [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [Google client setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).
