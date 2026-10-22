# ZGPM_STOCK — CMMS Stock Search

Migrated SAPUI5 freestyle application for CMMS/PM stock search (previously `ZGPM_STOCK_1`, SAP Web IDE/Neo).

## Application

| Item | Value |
|---|---|
| UI5 namespace | `PO_STOCK` |
| BSP application | `ZGPM_STOCK` |
| ABAP package | `ZPM` |
| OData service | `ZGPM_STOCK_SEARCH_SRV` (read-only: `MRO_LISTSet`, `STORAGE_LOCSet`) |
| SAPUI5 version | `1.71.84` |
| Tooling | UI5 Tooling 3.x, SAP Fiori Tools |

## Project Structure

```text
webapp/
  Component.js
  manifest.json
  controller/
  view/
  model/
  util/
  i18n/
  css/
  test/
    flpSandbox.html
    unit/
```

## Common Commands

```powershell
npm install
npm run start        # opens test/flpSandbox.html (FLP sandbox preview)
npm run start-gwq
npm run start-local
npm run build
npm run deploy
npm run lint
```

## Local FLP Sandbox

`npm run start`, `start-local`, and `start-gwq` all open `test/flpSandbox.html` by default (instead of the plain `index.html`), so the app always launches inside the FLP sandbox shell.

## Deployment

Deployment uses `ui5-deploy.yaml` and ABAP BSP target `ZGPM_STOCK`. Add the Basis-provided transport request before running deployment. Do not commit credentials.

## Known Limitations

- FLP semantic object/action are not yet configured (`sap.app.crossNavigation` omitted) — pending business input, previously blank in `flp-config.json`.
- `sap:pageable="false"` on both entity sets — table does not use `growing` paging; large result sets are fetched in a single request.
- No OPA/integration test suite yet; only QUnit unit tests for formatters and the error-handling utility are included.
