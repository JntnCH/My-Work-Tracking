# Interaction Audit — Baseline

## Scope

Audit baseline captured on branch `feature/line-login-settings-audit` for `JntnCH/My-Work-Tracking`. The audit covered routes, authentication, authenticated app shell, header, Settings, Check-in/Out, Dashboard, History, Sheets/Airtable, dialogs, Face Lock, and shared navigation primitives.

## Confirmed defects

| Severity | Location                                                                                 | Finding                                                                                                                                                                                                                       | Planned correction                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| High     | `src/routes/_authenticated/index.tsx:198-199`                                            | `AppHeader` receives `onToggleTheme={() => requestTabChange("settings")}`. The icon button itself is correctly `type="button"`, but its parent handler navigates to Settings instead of toggling the theme.                   | Wire the header action to a runtime theme toggle/preview handler and keep tab navigation separate.                                     |
| High     | `src/components/work/SettingsPanel.tsx:344-414`                                          | `handleSaveAll` submits theme, rates, spreadsheet, branch profile, branch rates, and layout through one global coordinator. A global Save can write multiple unrelated scopes and the page-level dirty state aggregates them. | Keep the existing scope model but expose independent Save/Cancel/dirty state per settings category; do not write untouched categories. |
| Medium   | `src/components/work/SettingsPanel.tsx:161-177`, `src/hooks/use-work-tracker.ts:360-387` | Theme controls update `draftColors`, but `applyTheme()` and app-wide `themeSettings` update only when the theme save handler is called. The preview is therefore local to Settings until Save.                                | Add a runtime preview callback that applies draft theme to the app shell immediately; persist only on category Save.                   |

## Confirmed negative findings

The source, `package.json`, and `.env.example` contain no existing LINE/LIFF SDK, LINE button, `custom:line`, Channel ID, Channel Secret, OIDC issuer, or LIFF environment variable. The existing auth flow is Google, GitHub, phone OTP, email/password, and Guest Mode. The existing Supabase browser client already uses PKCE, session persistence, automatic refresh, and URL detection. `/auth/callback` already exists and must be reused.

## Interaction audit candidates requiring runtime verification

The static scan found interactive elements in `AppHeader`, `AuthenticationSettings`, `CategoryDialog`, `CheckInPanel`, `DashboardCustomizationCanvas`, `DashboardLayoutEditor`, `DashboardPanel`, `FaceLock`, `HistoryPanel`, `SettingsPanel`, `SheetsPanel`, auth routes, authenticated route guards, and root error handling. Many buttons are not explicitly typed in JSX; each candidate must be checked for whether it is inside a form. Buttons inside forms must be `type="button"` unless they intentionally submit. Buttons outside forms must be tested for navigation, focus, loading, disabled, and event propagation behavior.

The audit must verify, at minimum, that Settings tab buttons do not submit or navigate, Check-in/Out controls do not submit unrelated forms, History edit/delete controls do not change the route, Sheets/Airtable actions do not cause full-page reloads, Face Lock actions do not escape the authenticated route, and the root error retry button only retries as intended.

## LINE configuration result

No real LINE credentials are present in the repository. Channel ID and Channel Secret must remain outside frontend code and must be configured by the user in LINE Developers/Supabase Dashboard or server-side Edge Function secrets. The implementation must verify the current LINE OIDC issuer and Supabase Custom Provider field names from official documentation before writing setup guidance.

## Baseline safety

No business-logic, database-schema, RLS, GPS, calculation, or timezone change has been made in this audit phase. The working tree was clean when the feature branch was created. This file is an audit artifact and will be updated after runtime regression testing.

## Post-change regression classification

A second source scan reviewed button attributes, form boundaries, submit controls, navigation calls, and external links across the repository. The only buttons participating in actual HTML forms are the intentional authentication submit actions and the identity-linking form submit. The remaining buttons without an explicit `type` attribute are outside an HTML form or are component-level actions, so they cannot reproduce the original accidental form-submit behavior in their current DOM placement. The header theme button now calls the runtime preview callback and no longer calls `requestTabChange("settings")`; browser smoke testing confirmed that clicking it keeps the URL at `/` and the active tab at Check-in / Out.

The source scan also identified expected navigation boundaries: auth redirects, OAuth redirects, Google Maps/Sheets external links, and tab-local `requestTabChange` calls. No additional control was found that routes a theme or color interaction to another page.
