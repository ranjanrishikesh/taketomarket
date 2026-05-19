# Landing Page Headline Examples — Reference

Category-tagged headline pairs demonstrating the Clarity layer (DISC-LANDING-PAGES-01), Specificity over cleverness (DISC-POSITIONING-04, playbook §"Specificity Over Cleverness"), and the Plain-Language Floor rule.

Loaded by `/ttm-landing` alongside `playbooks/landing-pages.md` and `references/landing-page-anatomy.md`. Used by `ttm-producer` (production-time calibration of hero H1 / taglines) and `ttm-verify` (gate-evaluation reference for FAIL annotations).

**Pattern per entry:** trap → ❌ bad headline → ✅ good headline → why + gate IDs demonstrated.

---

## 1. SaaS & B2B Platforms — The "Enterprise Buzzword" Trap

Trap signature: stacking abstract nouns ("paradigms", "synthesis", "velocity") in place of naming the actual workflow.

### Analytics Tool

- ❌ "Unlock actionable data paradigms with unified predictive intelligence."
- ✅ "See exactly where your website visitors click, scroll, and get stuck."
- **Why bad:** invented category language ("paradigms", "predictive intelligence") with no plain-language floor; visitor cannot name the category. **Why good:** names the literal observed actions (click / scroll / get stuck) the ICP recognizes from their own work.
- **Gates demonstrated:** DISC-LANDING-PAGES-01 (clarity), DISC-POSITIONING-04 (specificity), banned-phrase compliance.

### CRM / Sales Tool

- ❌ "Accelerate pipeline velocity via hyper-personalized touchpoint synthesis."
- ✅ "Track your sales deals and get reminders to follow up with leads before they go cold."
- **Why bad:** "pipeline velocity" and "touchpoint synthesis" are seller-internal vocabulary the champion (an AE) does not use about their own day. **Why good:** names the literal jobs (track deals, follow-up reminders, leads going cold) in champion vocabulary.
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-02 (audience-vocabulary check), DISC-POSITIONING-04.

### Customer Support Software

- ❌ "Orchestrate multi-channel customer success flywheels at scale."
- ✅ "Manage all your customer emails, chats, and tweets in one shared inbox."
- **Why bad:** "orchestrate" + "flywheels" + "at scale" stacks 3 banned phrases; no named channel, no named workflow. **Why good:** names the channels explicitly (emails / chats / tweets) and the mechanism (one shared inbox).
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-03 (outcome framing), banned-phrase compliance.

### AI Writing Assistant

- ❌ "Leverage generative semantic frameworks to amplify content velocity."
- ✅ "Write high-converting landing pages and ad copy in seconds, not hours."
- **Why bad:** "leverage" + "generative semantic frameworks" + "content velocity" is internal-to-AI-team vocabulary; no named output type. **Why good:** names the output (landing pages, ad copy) and the contrast (seconds vs hours) the buyer measures themselves on.
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-03 (numeric specificity), DISC-LANDING-PAGES-04 (named alternative = manual writing).

### Collaboration Hub

- ❌ "The single source of truth for cross-functional alignment and asynchronous operational velocity."
- ✅ "One central place for your team to share notes, assign tasks, and track project deadlines."
- **Why bad:** "single source of truth" + "cross-functional alignment" + "operational velocity" = three abstract phrases stacked in one sentence; visitor cannot name what verbs they perform with the tool. **Why good:** names the three verbs (share notes, assign tasks, track deadlines) directly.
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-POSITIONING-04, anti-pattern #10 (stuffing all four layers).

---

## 2. FinTech & Crypto — The "We Sound Sophisticated" Trap

Trap signature: dressing money workflows in latinate / actuarial vocabulary to signal seriousness; loses the founder/finance-team buyer who just wants their books closed.

### Accounting Software

- ❌ "Streamline fiscal reconciliation and end-to-end ledger mitigation."
- ✅ "Track your business expenses and send professional invoices that get paid on time."
- **Why bad:** "fiscal reconciliation" + "ledger mitigation" reads like a CFO compliance memo; SMB owner audience does not use those words. **Why good:** named verbs (track expenses, send invoices) and a named pain (getting paid on time).
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-02 (champion vocabulary check), DISC-POSITIONING-03 (champion vs buyer).

### Expense Management App

- ❌ "De-risk corporate spend architectures with automated compliance rails."
- ✅ "Give employees company cards with built-in spending limits so no one blows the budget."
- **Why bad:** "spend architectures" + "compliance rails" is CFO/audit-firm vocabulary; the practitioner buyer (ops/finance lead) does not describe their problem that way. **Why good:** names the artifact (company cards), the mechanism (built-in limits), and the named-alternative pain (someone blowing the budget).
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-04 (named alternative = the rogue spender), DISC-POSITIONING-03.

### Personal Finance Tracker

- ❌ "Optimize your holistic capital deployment and micro-budgetary allocations."
- ✅ "See exactly how much money you have left to spend this month after paying bills."
- **Why bad:** "capital deployment" is wealth-manager language; consumer audience reads it as "not for me." **Why good:** names the exact moment of decision the user has every month (money left after bills).
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-02 (audience-vocabulary), DISC-LANDING-PAGES-03 (concrete after-state).

### Crypto / Web3 Wallet

- ❌ "A decentralized non-custodial gateway to cross-chain liquidity aggregation."
- ✅ "A secure app to store, send, and trade your digital currency without a middleman."
- **Why bad:** "non-custodial gateway" + "cross-chain liquidity aggregation" is protocol-team vocabulary; the retail wallet buyer does not yet know what those words mean. **Why good:** names the verbs (store / send / trade) and the named alternative (without a middleman) in 12-year-old language.
- **Gates demonstrated:** DISC-LANDING-PAGES-01 (plain-language floor), DISC-LANDING-PAGES-04 (named alternative = "middleman" = exchanges/banks).

### Payment Processor

- ❌ "Frictionless global monetary infrastructure powering the internet economy."
- ✅ "Accept credit card payments from customers anywhere in the world with a few lines of code."
- **Why bad:** "global monetary infrastructure" + "internet economy" is press-release talk; the developer integrator buyer needs to know what the SDK does. **Why good:** names the action (accept credit card payments), the scope (anywhere in the world), and the integration cost (a few lines of code).
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-02 (developer audience), DISC-LANDING-PAGES-03 (specific cost).

---

## 3. DevTools & Cloud Infrastructure — The "Heavy Jargon" Trap

Trap signature: stacking distributed-systems vocabulary ("topology", "fabrics", "telemetry matrices") as a substitute for naming the developer pain.

### Cloud Hosting Platform

- ❌ "Automated containerization topology with edge-optimized elasticity."
- ✅ "Deploy your code to the web instantly without worrying about configuring servers."
- **Why bad:** "containerization topology" + "edge-optimized elasticity" is ops-team vocabulary; the application developer buyer wants to forget servers exist. **Why good:** names the action (deploy code), the speed (instantly), and the named-alternative pain (configuring servers).
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-04 (named alternative = traditional ops), DISC-POSITIONING-03 (champion = app developer, not SRE).

### Database Service

- ❌ "Highly available, horizontally scalable distributed relational data fabrics."
- ✅ "A database that automatically grows with your app so it never crashes during a traffic spike."
- **Why bad:** "horizontally scalable distributed relational data fabrics" is four abstract modifiers; the buyer cannot say which problem this solves. **Why good:** names the failure mode (crash during traffic spike) and the mechanism (automatic growth).
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-03 (concrete failure-mode contrast), DISC-LANDING-PAGES-04 (named alternative = manual scaling).

### APM / Monitoring Tool

- ❌ "End-to-end telemetry and observability matrices for distributed microservices."
- ✅ "Get alerted the exact second your website goes down or a bug breaks the checkout page."
- **Why bad:** "telemetry" + "observability matrices" is monitoring-vendor vocabulary; the engineering manager buyer wants to know what they will be paged for. **Why good:** names the trigger (website down / checkout broken) and the named-alternative pain (finding out from a customer).
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-02 (named scenarios), DISC-LANDING-PAGES-03 (concrete outcome).

### API Gateway

- ❌ "Unify ingress governance and request routing across heterogeneous endpoints."
- ✅ "A single, secure front door for all your external software tools to talk to your app."
- **Why bad:** "ingress governance" + "heterogeneous endpoints" is networking-team vocabulary; the application developer audience needs the metaphor. **Why good:** uses the "front door" metaphor (concrete enough to picture) and names the actors (external tools talking to your app).
- **Gates demonstrated:** DISC-LANDING-PAGES-01 (plain-language floor — metaphor permitted because it lands instantly), DISC-POSITIONING-04.

### No-Code App Builder

- ❌ "Democratizing application development through visual programmatic synthesis."
- ✅ "Build custom mobile apps using a drag-and-drop editor—no coding skills required."
- **Why bad:** "democratizing" + "visual programmatic synthesis" is investor-deck vocabulary; the non-developer audience reads it as "not for me." **Why good:** names the output (mobile apps), the mechanism (drag-and-drop editor), and the prerequisite (no coding skills).
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-02 (explicit ICP opt-in: non-coders), DISC-LANDING-PAGES-04 (named alternative = traditional coding).

---

## 4. UX Microcopy & Product UI — The "Engineering Speaks First" Trap

Trap signature: surfacing internal error/system vocabulary into end-user-facing strings. Same Clarity-first rule applies to microcopy as to hero H1s — the user reads a string at a moment of friction and must understand it instantly.

### File Upload Failure

- ❌ "Fatal Exception: Payload exceeds maximum multi-part form allocation threshold."
- ✅ "This file is too big. Please upload an image smaller than 5MB."
- **Why bad:** "Fatal Exception" + "multi-part form allocation threshold" is the stack trace bleeding into the UI. **Why good:** names the problem (file too big) and the fix (image smaller than 5MB) in one breath.
- **Gates demonstrated:** DISC-LANDING-PAGES-01 (clarity), DISC-POSITIONING-04, anti-pattern #1 (clever-over-clear extended to microcopy).

### Account Creation Success

- ❌ "Profile provisioning completed. Session tokens have been successfully initialized."
- ✅ "Your account is ready! Let's set up your profile."
- **Why bad:** "profile provisioning" + "session tokens" is server-log vocabulary; user has no model for what just happened. **Why good:** confirms the state ("your account is ready") and previews the next action.
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-03 (named next action = outcome).

### Session Timeout Notice

- ❌ "Security protocol enforcement: Authentication window has elapsed due to zero user interaction inputs."
- ✅ "You've been logged out due to inactivity to keep your account safe."
- **Why bad:** "authentication window has elapsed due to zero user interaction inputs" is the security log narrating itself; user only needs to know what happened and why. **Why good:** states the state (logged out), the cause (inactivity), and the why (account safety) in one sentence.
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-03.

### Pricing Plan Limit

- ❌ "Usage parameters have reached tier capacity. Please upgrade to lift throughput constraints."
- ✅ "You've used all 5 free projects this month. Upgrade to Pro to create unlimited projects."
- **Why bad:** "usage parameters" + "tier capacity" + "throughput constraints" hides the actual limit and the actual benefit of upgrading. **Why good:** names the limit ("5 free projects this month") and the unlock ("unlimited projects").
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-03 (named after-state), DISC-LANDING-PAGES-04 (named contrast = free vs Pro).

### Search Field Placeholder

- ❌ "Execute dynamic query generation against database parameters..."
- ✅ "Search for orders, invoices, or customer names..."
- **Why bad:** "execute dynamic query generation" is engineering's description of what the input field does; the user wants to know what they can search. **Why good:** names the searchable entities (orders / invoices / customer names) so the user knows what kinds of queries land hits.
- **Gates demonstrated:** DISC-LANDING-PAGES-01, DISC-LANDING-PAGES-02 (named entities = audience-recognizable).

---

## How to use these examples

- **At production time** (`ttm-producer`): when generating a hero H1, compare candidate output to the matched trap-category bad example. If candidate stacks ≥2 abstract nouns from the trap signature, regenerate using the good example's concrete-verb pattern as a calibration anchor.
- **At verification time** (`ttm-verify`): when annotating a FAIL on DISC-LANDING-PAGES-01 or DISC-POSITIONING-04, cite the closest trap category here and quote the good-side rewrite as the recommendation.
- **At humanize time** (`/ttm-humanize`): if hero copy survives the gates but still reads like a buzzword stack, run it past the trap-category good example as a tone calibration.

## Cross-references

- Discipline gates evaluated: `playbooks/landing-pages.md` § Discipline Gates (DISC-LANDING-PAGES-01..06).
- Positioning gate cross-applied: `playbooks/positioning.md` DISC-POSITIONING-04 (Specificity Over Cleverness).
- Banned phrases: `workflows/setup/init-validation.md` § Banned Phrases (Global).
- Operational hero structure: `references/landing-page-anatomy.md` § Hero headline rules.

## Sources

Examples curated from common SaaS / FinTech / DevTools / UX-microcopy buzzword-trap patterns. Categories adapted from the four traps identified in user-provided source material (May 2026).
