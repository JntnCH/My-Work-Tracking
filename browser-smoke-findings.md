# Browser Smoke Findings

## Latest local production build

The latest production artifact renders `/auth` with the existing Google, GitHub, phone, email, signup, and Guest controls plus the new `เข้าสู่ระบบด้วย LINE` button. The LINE button is visible in the rendered mobile-sized Login card and does not replace the existing authentication methods.

Guest Mode successfully opened the authenticated app shell at `/` without OAuth. The app displayed the Guest banner, Check-in/Out, Dashboard, History, Settings tabs, Thai date `19 ส.ค. 69`, and a Thai time in the header. The Check-in page rendered work type, location, GPS, OT, wage, allowance, evidence, Check-in, and Check-out controls.

The first smoke test used a stale server process and did not show LINE; after restarting the server from the latest build, the bundle markers and browser page confirmed `เข้าสู่ระบบด้วย LINE` and `custom:line` are present.

## Next tests

Continue by clicking the header dark/light toggle and verifying that the tab remains `checkin`, the URL stays `/`, and the runtime theme changes. Then open Settings, change a theme preset/color, verify the app-wide preview changes immediately, use Cancel to restore the saved theme, and test category-scoped Save behavior.

## Theme toggle and Settings navigation

After entering Guest Mode, clicking the header theme button changed its hint from `เปลี่ยนเป็นโหมดมืด` to `เปลี่ยนเป็นโหมดสว่าง` while the URL remained `/` and the active tab remained `Check-in / Out`; it did not navigate to Settings. Opening Settings then showed the new `Save หมวดนี้` action and the existing Unlock/Lock/Cancel controls. Unlock changed the state to `Editing` without a route change.

The next browser step is the Theme tab, followed by changing a palette, checking app-wide live preview, and cancelling to verify restoration.

## Live theme preview and Cancel rollback

The Theme tab rendered the preset buttons, Light/Dark/System controls, color inputs, live preview card, and explicit `ยกเลิกการแสดงตัวอย่าง` / `บันทึกธีมและสี` actions. Selecting Google Red changed the entire app shell immediately to the red/dark palette without pressing Save; the color inputs reflected the new red palette and the page showed an unsaved state. Clicking Cancel restored the original Google Blue/light values, returned the header icon to `เปลี่ยนเป็นโหมดมืด`, and changed the status to `Locked / Saved`. This confirms runtime preview and rollback behavior in the local production build.

## Dashboard and History tabs

After leaving Settings, the Dashboard tab displayed the monthly summary cards, charts, and zero-data states without a route change. The History tab then displayed its month filter, sync-to-sheet, pull-from-sheet, CSV, and empty-history states. Both tabs switched through the authenticated shell as intended and did not trigger form submission or unexpected navigation.

## General category save isolation

The General category exposed separate rate and Spreadsheet ID fields plus a local `บันทึกค่าแรงและ Google Sheets ID` action. Entering a temporary Guest Mode Spreadsheet ID and clicking that button produced the toast `บันทึกค่าแรง Global แล้ว`; no Theme preview or other category action was triggered. This confirms the category-level coordinator is isolated from Theme and Layout. The temporary value is local to this smoke-test browser session only.

## Visual verification

The rendered Login screenshot shows the new green LINE action aligned beneath Google and GitHub, with readable Thai text and consistent rounded-card styling. The Google Red screenshot shows the entire authenticated shell, Settings tabs, preset cards, Dark Mode control, and live preview card using the red/dark palette with readable text and visible contrast. The visual evidence is saved as attachments for the pre-commit example.
