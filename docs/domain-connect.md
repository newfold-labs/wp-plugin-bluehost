# Domain Connect payment eligibility

The `tenwebDomainConnect` feature flag controls the WVC editor integration. When enabled, only the local adapter loads initially. It gets the authenticated shopper context from `/bluehost/v1/domain-connect/context`, then checks saved payment methods directly from the browser before creating a button, SDK mount, remote MFE script or remote MFE stylesheet.

## Browser request

The storefront BFF is a browser-facing service. Requests from the WordPress hosting server can receive an HTML Cloudflare browser challenge (`403`, `cf-mitigated: challenge`). Eligibility therefore uses the same browser-side `GET /api/v1/ms-shopping/get-payments` request as the MFE, with `Authorization: Bearer <userJwt>` and `X-Account-Id: <accountId>`. The check has a 10-second abort timeout, no cache, no redirects and no cross-origin cookies.

The REST response preserves the existing shopper context and adds `paymentsUrl`. PHP makes no payment API request and does not assert an `eligible` value. The endpoint follows the same `domain_connect_use_qa_mfe` filter and environment rules as the MFE:

| Environment | Payment endpoint |
|-------------|------------------|
| Production | `https://sfbff.bluehost.com/api/v1/ms-shopping/get-payments` |
| QA | `https://sfbff-user-service-bh-qa.apis.newfold.com/api/v1/ms-shopping/get-payments` |

The browser accepts only these two endpoints before sending the JWT. WordPress context still requires `edit_pages`, its REST nonce and existing Hiive authentication. Responses use `Cache-Control: no-store`.

## Eligibility

The parser follows the selectable-method rule in the [published MFE bundle](https://sfbff.bluehost.com/bh-ai-builder-mfe/domain-connect/main.js): the `payments` list must contain a usable `walletItemId`, card `lastFourDigits` or PayPal `email`, and no `expired: true`. Malformed fields and non-boolean expiry values when present are rejected. The contract has no separate documented `enabled` field. A selectable method does not guarantee a successful charge.

- A confirmed selectable method enables the entry point and loads the MFE assets.
- An empty wallet or only unusable/expired methods leaves the integration hidden.
- HTTP failures, CORS/network errors, timeouts, HTML challenges and malformed payloads leave the integration hidden. Debug state reports a safe `payments` error without response bodies or credentials.

Wallet details are used only to derive a boolean and are never persisted, logged or passed to the MFE by the adapter. This is a UI rollout condition; payment authorization remains the checkout API's responsibility. JWT refresh repeats the browser check. A failed check closes an open MFE and removes its entry point. External wallet changes are reflected on the next context request or page reload, and checkout retrieves the current list again before purchase.

The external MFE still owns its “Add a new payment method” control. Hiding that option requires a supported MFE option or a separate MFE change.

## Console diagnostics

Enable `define( 'WP_DEBUG', true );` in `wp-config.php` before loading `wp-settings.php`, then reload the WVC editor. The plugin reads the effective constant; it never defines or overrides it. If the constant was already defined, PHP keeps its first value. `WP_DEBUG_LOG` and `WP_DEBUG_DISPLAY` do not control browser diagnostics.

When debug is enabled, the adapter uses `console.info` so messages appear at Chrome's default log level. Filter the top-frame console by `[Bluehost Domain Connect]` and keep the Info level enabled.

Messages include adapter startup, context loading/readiness, payment checking/eligibility, entry-point visibility, and MFE loading/readiness/errors. Details are printed as a small JSON string; credentials, account identifiers, wallet fields, response bodies and SDK exception messages are never logged. Repeated entry-point checks log only state changes. With debug disabled, these messages are silent.

| Event/reason | Meaning |
|--------------|---------|
| `payment_eligibility` / `eligible` | A usable saved method exists. |
| `payment_eligibility` / `empty_wallet` | No saved method passed the selectable-method rule, including expired or unusable methods. This is an eligibility result, not an API failure. |
| `payment_eligibility` / `http_403`, `network`, `timeout`, `invalid_json`, `invalid_payload` | The payment check failed; eligibility could not be confirmed. |
| `shopper_context` / `http_401`, `invalid_json`, `invalid_context`, `network`, `account_mismatch` | The authenticated context could not be used. |
| `entry_point` / `header_missing` | Eligibility passed, but the editor header is not present or visible yet. |
| `mfe` / `mfe_load`, `mfe_api`, `mfe_init`, `mfe_open` | The remote SDK could not load, expose its API, initialize or open. |

`BluehostTenWebDomainConnectDebug.getState()` returns safe state including `debug`, `eligible`, `visible`, `phase`, `error` and `reason`. If the config or debug helper is absent, check that the `tenwebDomainConnect` feature flag is enabled and the plugin build is installed: an adapter that is not enqueued cannot write console messages. Rebuild JavaScript and include its `.asset.php` manifest when packaging; its version updates the asset URL to invalidate browser caches.

## Verification

Run `php tests/php/domain-connect-context.php` and `php tests/php/domain-connect-payments.php` for offline context checks. The payment contract test explicitly forbids server-side payment HTTP. `tests/wpunit/DomainConnectPaymentsWpunitTest.php` and `DomainConnectWpunitTest.php` cover endpoint selection and WordPress REST integration. The two `tests/jest/tenweb-domain-connect*.test.js` suites cover wallet parsing, authenticated browser headers, timeout, pending/denied eligibility, lazy SDK loading, refresh revocation, debug on/off, and safe diagnostics for context, payment, header and SDK failures using synthetic responses.

Live validation must use matching credentials and environment, and both eligible and empty-wallet accounts. See [BH Domain Connect MFE](https://confluence.newfold.com/display/SFAM/BH+Domain+Connect+MFE).
