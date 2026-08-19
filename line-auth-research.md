# LINE Login / LIFF Research Findings

## Sources checked

- LINE Developers: https://developers.line.biz/en/docs/line-login/integrate-line-login/
- LINE Developers LIFF API reference: https://developers.line.biz/en/reference/liff/
- LINE Developers using user data: https://developers.line.biz/en/docs/liff/using-user-profile/
- Supabase OIDC reference target: https://supabase.com/docs/guides/auth/auth-oidc (page extraction returned no content in this session; verify in Dashboard/docs during implementation)

## Verified facts for implementation

1. LINE Login v2.1 supports OpenID Connect and the web login flow is based on OAuth 2.0 authorization code grant plus OIDC.
2. LINE requires a callback URL configured in the LINE Developers Console. The authorization response returns an authorization code and state. The code is single-use and valid for a limited period; the app must validate state to prevent CSRF.
3. LINE supports `profile`, `openid`, and optionally `email` scopes. Email permission requires the relevant LINE Developers application/permission flow; the initial integration should not assume email is available.
4. LINE documents PKCE with `code_challenge` and `code_challenge_method=S256`; the current Supabase client already uses PKCE, so the Custom OIDC path should be checked for compatible PKCE handling instead of adding a parallel hand-rolled flow prematurely.
5. LINE explicitly notes that behavior of direct web authorization requests inside the LIFF browser is not guaranteed. When the LIFF app is opened from an external browser, LINE recommends `liff.login()` rather than treating it as a normal direct LINE Login authorization request.
6. `liff.init({ liffId })` must run before other LIFF APIs and must be executed each time the page is opened. URL changes should wait until LIFF initialization completes, and LIFF query parameters should not be modified prematurely.
7. `openid` scope is required for `liff.getIDToken()` and `liff.getDecodedIDToken()`; `email` is required if the app needs email from the ID token.
8. For server use, LINE recommends sending the raw ID token from `liff.getIDToken()` to the server and verifying it with LINE's token verification endpoint. The server should not trust user profile fields copied from the client.
9. No actual issuer URL, LIFF ID, Channel ID, or Channel Secret was found in the repository. The issuer/provider metadata and Supabase Custom Provider field names must be verified against the live Supabase project/Dashboard before adding values to setup documentation.

## Implementation consequence

The first implementation attempt will use Supabase Custom OIDC only if the live provider configuration accepts LINE's verified issuer/discovery metadata and returns a normal Supabase callback/session in both ordinary browser and LIFF contexts. If LIFF in-app behavior fails, the fallback must be a server-side Edge Function that receives a raw ID token, verifies it with LINE, and then uses Supabase Admin APIs without exposing Channel Secret or service-role credentials to the browser. The fallback should be treated as a separate decision gate, not silently enabled alongside the OIDC flow.

## Supabase ID-token flow research

Additional official Supabase search results:

- JavaScript `signInWithIdToken`: https://supabase.com/docs/reference/javascript/auth-signinwithidtoken — Supabase supports signing in with an OIDC ID token when the authentication provider is enabled and configured.
- Custom OAuth/OIDC Providers: https://supabase.com/docs/guides/auth/custom-oauth-providers — custom standards-compliant OIDC providers are supported beyond built-in provider names.
- Custom OAuth/OIDC launch blog: https://supabase.com/blog/custom-oauth-oidc-providers — current Custom OAuth/OIDC feature context.

Implementation consequence: inspect the installed Supabase Auth types and use of `signInWithIdToken` before building a custom Edge Function. The installed package documents `custom:${string}` provider identifiers and accepts custom OIDC provider names. For LIFF, a safer first fallback candidate may therefore be `supabase.auth.signInWithIdToken({ provider: "custom:line", token: liff.getIDToken() })` after the provider is enabled and configured, while retaining an Edge Function only if this official client flow cannot validate LINE tokens in the target setup. No provider is enabled or credential is assumed until the live Supabase project is checked.

## Verified public LINE OIDC discovery metadata

A read-only request to `https://access.line.me/.well-known/openid-configuration` returned:

- issuer: `https://access.line.me`
- authorization endpoint: `https://access.line.me/oauth2/v2.1/authorize`
- token endpoint: `https://api.line.me/oauth2/v2.1/token`
- JWKS URI: `https://api.line.me/oauth2/v2.1/certs`
- userinfo endpoint: `https://api.line.me/oauth2/v2.1/userinfo`
- supported scopes: `openid`, `profile`, `email`

These values are public discovery metadata, not credentials. The implementation will still verify the corresponding Supabase Custom OIDC Dashboard fields and audience/client ID requirements against the live project before requesting an end-to-end login.
