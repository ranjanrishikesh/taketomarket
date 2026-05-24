# Contributing to taketomarket

## Reporting bugs

Open a GitHub Issue at https://github.com/ranjanrishikesh/taketomarket/issues.
Include: OS, Node version, runtime (Claude Code/Codex/other), and the exact error output.

## Proposing features

Open a discussion issue first — describe the use case, not the implementation.
Feature PRs without a linked discussion may be closed without review.

## Development setup

```bash
git clone https://github.com/ranjanrishikesh/taketomarket
cd taketomarket
node --test   # run full test suite — no install step needed
```

## Code style

- Zero npm dependencies — `bin/` tools use Node.js built-ins only
- CJS (`.cjs`) for all `bin/` scripts — no TypeScript, no transpilation
- Markdown for all skills, workflows, templates, references
- `node --test` must pass before every commit

## Pull request requirements

- `node --test` passes
- No new npm dependencies
- One clear purpose per PR — link to the issue it closes
- Commits follow conventional commit style (`feat:`, `fix:`, `docs:`, `chore:`, `test:`)

## Submitting plugin manifest changes

Before opening a PR that touches `.claude-plugin/plugin.json` or `.claude-plugin/marketplace.json`, run:

```bash
claude plugin validate .
```

The Anthropic community-marketplace review pipeline runs the same check on every submission. Failing locally = failing in review.

Also verify all three version manifests stay in lockstep:

```bash
grep '"version"' package.json .claude-plugin/plugin.json .claude-plugin/marketplace.json
```

All three must report the same version per the release playbook.
