# /scan — Run a PQC Readiness Scan

Scan a domain's TLS configuration for quantum-vulnerable cryptography using the Lattica backend.

## Instructions

1. **Preflight** — Confirm the Lattica backend is running:
   ```bash
   curl -s http://localhost:8000/health
   ```
   If it's not running, start it:
   ```bash
   cd ~/Projects/lattica/backend && .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
   ```
   Wait a few seconds and retry the health check.

2. **Parse the user's input** — The user may provide:
   - Just a domain: `/scan example.com` → use defaults S=3, R=3
   - Domain with parameters: `/scan example.com S=5 R=4`
   - If no domain is provided, ask for one.

3. **Run the scan** via the Lattica API:
   ```bash
   curl -s -X POST http://localhost:8000/scans/ \
     -H "Content-Type: application/json" \
     -d '{"domain": "<domain>", "data_sensitivity": <S>, "retention_horizon": <R>}'
   ```

4. **Present the results** in a clear, structured format:

   ```
   LATTICA — PQC Readiness Scan
   ═══════════════════════════════
   Target:     <domain>
   Parameters: S=<val> (Data Sensitivity) R=<val> (Retention Horizon)
   Status:     <completed | failed>
   Findings:   <total> total — <crit> critical, <high> high, <med> medium, <low> low
   Peak Risk:  <max score> / 125
   ═══════════════════════════════
   ```

   Then a findings table showing each finding with:
   - Severity (CRITICAL / HIGH / MEDIUM / LOW)
   - Type (Protocol / Cipher Suite / Certificate)
   - Value (the crypto primitive)
   - HNDL Score with formula: S<val> × R<val> × E<val> = <score>
   - NIST Deadline
   - PQC Replacement

5. **If the scan fails**, report the error message and suggest common fixes:
   - DNS resolution failure → check the domain name
   - Connection refused → target might be blocking the scan
   - Timeout → target might be unreachable

6. **After presenting results**, offer to run `/remediate` for a deep dive on any finding.

## Arguments

$ARGUMENTS will contain the user's input after `/scan`. Parse it for:
- The domain name (first argument)
- Optional `S=<1-5>` parameter (default: 3)
- Optional `R=<1-5>` parameter (default: 3)

User input: $ARGUMENTS
