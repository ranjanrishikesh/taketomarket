# Phase 8: Core Playbooks - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.

**Date:** 2026-04-29
**Phase:** 08-core-playbooks
**Areas discussed:** Inheritance model, Gate depth per discipline, Playbook file structure, Cross-playbook consistency

---

## Inheritance Model

| Option | Description | Selected |
|--------|-------------|----------|
| Additive only | Discipline gates added on top of base 10, no changes to base. | |
| Additive + weight override | Discipline adds gates AND can change tier of base gates. | Yes |
| Full override | Discipline can add, remove, or replace base gates. | |

**User's choice:** Additive + weight override

---

## Gate Depth Per Discipline

| Option | Description | Selected |
|--------|-------------|----------|
| 3-5 focused gates | Each discipline adds 3-5 checks. Total 13-15 per asset. | |
| 5-8 comprehensive | More thorough. Risk: slow verification, low-signal gates. | |
| Variable per discipline | Technical (SEO/AEO/Email) get more, creative (LinkedIn/Social) get fewer. | Yes |

**User's choice:** Variable per discipline

---

## Playbook File Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Production + Gates + Format | Three-section structure. Clean but minimal. | |
| Full playbook | Production + Gates + Format + Examples + Anti-patterns + Metrics. 300-400 lines. | Yes |
| Gates-only | Minimal, production guidance in separate files. | |

**User's choice:** Full playbook

---

## Cross-Playbook Consistency

| Option | Description | Selected |
|--------|-------------|----------|
| Same template, different content | Identical structure. N/A sections for non-applicable. | |
| Shared core + discipline-specific | Common header/gates/format + discipline-specific sections. | Yes |
| Free-form per discipline | Each structures however makes sense. | |

**User's choice:** Shared core + discipline-specific sections

---

## Claude's Discretion

- Exact gate definitions per discipline
- YAML frontmatter vs pure Markdown for playbook files
- How verify discovers discipline gates
- Example and anti-pattern content
- Platform-specific subsection organization in social playbook

## Deferred Ideas

None
