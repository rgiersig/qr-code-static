# Playwright Smoke Cases (IBAN/BIC)

Diese Datei dokumentiert die Smoke-Testfälle, die den Unit-Tests aus `tests/validation.test.js` entsprechen.

## IBAN
- `iban_good_de`: `DE02100100100006820101` (gültig)
- `iban_good_at`: `AT022081500000698597` (gültig)
- `iban_empty`: leer (Fehler erwartet)
- `iban_too_short`: `DE0210010010` (Fehler erwartet)
- `iban_too_long`: `DE0210010010000682010112345678901234` (Fehler erwartet)
- `iban_bad_char`: `DE02100100!0006820101` (Fehler erwartet)
- `iban_bad_checksum`: `DE02100100100006820102` (Fehler erwartet)

## BIC
- `bic_good_pbnk`: `PBNKDEFF` (gültig)
- `bic_good_stsp`: `STSPAT2G` (gültig)
- `bic_empty`: leer (im UI optional, daher kein Feldfehler)
- `bic_too_short`: `PBNKDEF` (Fehler erwartet)
- `bic_too_long`: `PBNKDEFFXXXZ` (Fehler erwartet)
- `bic_bad_char`: `PBNKDE$F` (Fehler erwartet)

## Ausführung
Die Smoke-Tests wurden per Playwright im Browser-Container gegen `http://127.0.0.1:4173/index.html` ausgeführt und pro Testfall ein Screenshot erzeugt.
