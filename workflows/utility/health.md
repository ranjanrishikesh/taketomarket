<purpose>
Health audit workflow for /ttm-health. Validates .taketomarket/ directory integrity,
reference file completeness, per-campaign state consistency, reference file staleness,
campaign velocity, DRIFT-LOG integrity, and gate result consistency. Reports text
output with pass/warn/fail per check category. Does NOT self-heal -- only reports.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.taketomarket/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you detect positioning drift:
- In verify: use the Escalate option to launch /ttm-positioning-shift
- In other workflows: flag the issue and recommend running /ttm-positioning-check

Only /ttm-positioning-shift and /ttm-init may modify POSITIONING.md.

## Diagnostic Only -- No Self-Healing

This workflow reports problems. It does NOT fix them. Never modify any file during
this workflow. All output is informational. If issues are found, recommend specific
commands or manual actions the user should take.
</constraints>

<process>

## Step: Legacy folder check

Before running the main audit, detect whether the project still uses the legacy
`.marketing/` state directory and offer migration to the canonical `.taketomarket/`.

Run the legacy-folder check:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" legacy-folder check --raw
```

Parse the JSON `state` field:

- **legacy**: print `WARN: Legacy '.marketing/' folder detected.` Then use `AskUserQuestion`:
  - question: "Migrate `.marketing/` to `.taketomarket/` now?"
  - options: "Yes, migrate now" / "Skip for now"
  - On Yes:
    ```bash
    node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" legacy-folder migrate --raw
    ```
    Then verify `.taketomarket/` exists.
  - On Skip: continue to Step 1 with a note that the audit will report `.marketing/` paths.
- **conflict**: print `ERROR: Both .marketing/ and .taketomarket/ exist. Manual resolution required.` Halt the workflow.
- **current** or **none**: continue silently to Step 1.

---

## Step 1: Run Health Audit

```
takeToMarket > RUNNING HEALTH AUDIT
```

Run the full health audit via CLI:
```bash
HEALTH_JSON=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" health --full --raw)
```

Parse the JSON output. Expected shape:
```json
{
  "healthy": true/false,
  "checks": [
    { "name": "...", "status": "pass|fail|warn|missing", "path": "...", "detail": "..." }
  ],
  "summary": "N/M checks passed"
}
```

If the CLI command fails (non-zero exit or invalid JSON), display:
"Health audit CLI failed. This may indicate a broken installation. Try running
`node \"${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs\" health --full --raw` manually
to see the error."
Exit.

---

## Step 2: Format Report

```
takeToMarket > HEALTH REPORT
```

Group checks by category based on their `name` prefix or type:
- **Structural Integrity** -- directory existence, required structure
- **Reference Files** -- POSITIONING.md, BRAND.md, ICP.md, etc.
- **Campaign State Consistency** -- per-campaign phase validity, field integrity
- **Staleness** -- files not updated within expected timeframes
- **Velocity** -- campaign progress rate checks
- **Drift Log** -- DRIFT-LOG.md integrity and format
- **Gate Consistency** -- review/verification result coherence

### Output Format

```
## Health Report

### Structural Integrity
  [PASS] .taketomarket/ directory exists
  [PASS] CAMPAIGNS/ directory exists
  [PASS] Required subdirectories present

### Reference Files
  [PASS] POSITIONING.md exists and has content
  [PASS] BRAND.md exists and has content
  [WARN] ICP.md -- not updated in 90+ days (staleness warning)
  [PASS] CHANNELS.md exists and has content
  [PASS] STATE.md exists and has content
  [PASS] CALENDAR.md exists and has content
  [PASS] COMPETITORS.md exists and has content
  [PASS] METRICS.md exists and has content
  [PASS] LEARNINGS.md exists and has content

### Campaign State Consistency
  [PASS] spring-launch -- phase: shipped (valid)
  [FAIL] test-campaign -- invalid phase: bogus
  [PASS] summer-promo -- phase: briefed (valid)

### Staleness
  [WARN] BRAND.md -- last modified 95 days ago
  [PASS] POSITIONING.md -- last modified 12 days ago

### Velocity
  [PASS] Campaign throughput: 2 shipped in last 30 days
  [WARN] No campaigns advanced in 14+ days

### Drift Log
  [PASS] DRIFT-LOG.md format valid
  [PASS] All drift entries have required fields

### Gate Consistency
  [PASS] All reviewed campaigns have verification reports
  [PASS] Fix counts consistent with review results

---

### Overall: HEALTHY (12/14 passed, 2 warnings)
```

**Status determination:**
- If `healthy` is `true` in CLI output: "HEALTHY"
- If `healthy` is `false`: "UNHEALTHY"
- Include total pass count and warning count

---

## Step 3: Recommendations (If Issues Found)

If any checks have `warn` or `fail` status, add a Recommendations section:

```
### Recommendations

**Failures (must fix):**
- <check name>: <specific fix suggestion>
  Run: <suggested command or manual action>

**Warnings (should address):**
- <check name>: <specific suggestion>
  Consider: <suggested action>
```

Recommendations are advisory only. This workflow does NOT execute any fixes.

If all checks pass with no warnings:
```
All systems healthy. No action needed.
```

</process>

<success_criteria>
- [ ] Health audit run via CLI (`health --full --raw`)
- [ ] Results grouped by category with clear pass/warn/fail indicators
- [ ] Overall healthy/unhealthy status displayed
- [ ] Recommendations provided for any issues found
- [ ] No files modified (diagnostic command)
</success_criteria>

<output>
No files modified (diagnostic command).
</output>
