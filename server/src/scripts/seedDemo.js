/**
 * Seed 25 rich demo posts across 5 authors so the feed looks alive.
 * Usage (from server/ folder):
 *   node src/scripts/seedDemo.js
 *
 * Safe to re-run — skips anything already in the DB by title.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('Set MONGODB_URI in .env'); process.exit(1); }

  await mongoose.connect(uri);
  const User = require('../models/User');
  const Post = require('../models/Post');

  /* ── Create / find demo authors ── */
  const AUTHORS = [
    { name: 'Aria Chen',     email: 'aria@quilio.app',    bio: 'Software engineer. Writes about distributed systems, databases, and developer experience.' },
    { name: 'Marcus Webb',   email: 'marcus@quilio.app',  bio: 'ML researcher turned indie dev. Obsessed with making AI legible to humans.' },
    { name: 'Priya Nair',    email: 'priya@quilio.app',   bio: 'Frontend architect. I think in components, dream in CSS, ship in React.' },
    { name: 'Eliot Ramos',   email: 'eliot@quilio.app',   bio: 'DevOps / Platform eng. Kubernetes, reliability, and the art of not waking up at 3am.' },
    { name: 'Sofia Andrade', email: 'sofia@quilio.app',   bio: 'Full-stack + product. Building SaaS and writing about the whole lifecycle.' },
  ];

  const hash = await bcrypt.hash('demo1234', 10);
  const users = [];
  for (const a of AUTHORS) {
    let u = await User.findOne({ email: a.email });
    if (!u) {
      u = await User.create({ name: a.name, email: a.email, password: hash, bio: a.bio });
      console.log(`Created author: ${a.email} / demo1234`);
    }
    users.push(u);
  }

  const [aria, marcus, priya, eliot, sofia] = users;

  /* ── 25 articles ── */
  const posts = [

    /* ══ ARIA — systems / databases ══ */
    {
      author: aria._id,
      title: 'Understanding Binary Search Trees',
      tags: ['data-structures', 'algorithms'],
      content: `A binary search tree (BST) stores ordered data so lookups, inserts, and deletes average O(log n).

Each node has at most two children. Left subtree values are smaller; right subtree values are larger.

## Why balance matters
Insert sorted data into a naive BST and it degrades into a linked list — O(n) operations. Self-balancing variants like AVL and Red-Black trees maintain balance through rotations.

## In-order traversal
Walking a BST in-order (left → root → right) yields elements in sorted order — a property no hash map can offer.

## When to reach for a BST
- You need ordered iteration
- Range queries are common
- You want O(log n) predecessor / successor lookups

Hash maps give O(1) average point lookup but can't answer "give me all keys between 42 and 100" efficiently.

## Takeaway
BSTs are the right tool when order and structure matter, not just speed.`,
    },

    {
      author: aria._id,
      title: 'How Postgres Plans a Query — a visual walk-through',
      tags: ['databases', 'postgres', 'performance'],
      content: `EXPLAIN ANALYZE is the most underused debugging tool in a backend developer's kit.

## What the planner does
Before running a query, Postgres builds a plan tree: a graph of operations (SeqScan, IndexScan, HashJoin, Sort…) with cost estimates based on statistics.

## Reading EXPLAIN output
\`\`\`
Seq Scan on users  (cost=0.00..180.00 rows=10000 width=64)
                   Filter: (age > 25)
\`\`\`

- **cost**: estimated start cost .. total cost (in planner units, not ms)
- **rows**: estimated row count
- **width**: average row size in bytes

ANALYZE appends actual timing and row counts.

## Common plan shapes
| Pattern | When it appears |
|---------|----------------|
| SeqScan | No useful index, small table |
| IndexScan | Selective index, random access |
| IndexOnlyScan | Covering index |
| HashJoin | Large unsorted join inputs |
| MergeJoin | Pre-sorted inputs |

## The single biggest win
Run ANALYZE on your tables. Outdated statistics lead to bad row-count estimates → bad plan choices.

Always look at the difference between *estimated* and *actual* rows — large divergences are where performance bugs hide.`,
    },

    {
      author: aria._id,
      title: 'CAP Theorem — what it actually means for your stack',
      tags: ['distributed-systems', 'databases', 'architecture'],
      content: `CAP is one of the most cited and most misunderstood theorems in distributed computing.

## The theorem
A distributed data store can guarantee at most two of three properties:
- **C**onsistency — every read receives the most recent write
- **A**vailability — every request receives a response (not necessarily the latest data)
- **P**artition tolerance — the system continues operating when network partitions occur

## The catch
Network partitions happen. They are not optional. So the real choice is between CP and AP — not between CA, CP, and AP as though P is optional.

## CP systems
Sacrifice availability during a partition. Reads may block until the partition heals. Example: HBase, Zookeeper, etcd.

## AP systems
Sacrifice consistency during a partition. Reads may return stale data. Example: Cassandra, DynamoDB, CouchDB.

## PACELC extends this
During normal operation, there is still a latency/consistency trade-off. PACELC (Partition-Availability-Consistency-Else-Latency-Consistency) captures this more fully.

## Practical takeaway
Most web applications can tolerate eventual consistency for most data. Reserve CP guarantees for financial transactions, inventory counts, and distributed locks.`,
    },

    {
      author: aria._id,
      title: 'Redis beyond caching — pub/sub, streams, and probabilistic data structures',
      tags: ['redis', 'databases', 'backend'],
      content: `Most people use Redis as a cache. That barely scratches the surface.

## Pub/Sub
Redis Pub/Sub lets services broadcast and receive messages. Unlike Kafka, messages are not persisted — subscribers miss anything sent while they're offline. Good for real-time dashboards, not event sourcing.

## Streams (Redis 5.0+)
Redis Streams are an append-only log with consumer groups. Messages persist and consumers track offsets. Think Kafka-lite, without Zookeeper, inside your existing Redis instance.

## HyperLogLog
Count unique items with ~0.81% error using only 12 KB of memory — regardless of cardinality. Perfect for unique visitor counts where approximate answers are fine.

## Bloom filters (with RedisBloom)
Test set membership with zero false negatives and tuneable false-positive rate. Use for URL deduplication in a crawler or spam detection.

## Sorted sets as leaderboards
ZADD, ZRANK, ZRANGE BY SCORE give you a leaderboard with O(log n) inserts and O(log n + k) range queries. No need for a separate leaderboard database.

Redis is a toolkit. Know the whole toolkit.`,
    },

    /* ══ MARCUS — ML / AI ══ */
    {
      author: marcus._id,
      title: 'RAG in plain English',
      tags: ['ai', 'rag', 'llm'],
      content: `Retrieval-Augmented Generation grounds an LLM in your documents instead of its training data alone.

## The pipeline
1. **Chunk** — split the document into passages (300–600 tokens each)
2. **Embed** — convert each chunk into a vector with a sentence transformer
3. **Index** — store vectors in a vector DB (Pinecone, pgvector, Qdrant…)
4. **Query** — embed the user question, find the k nearest chunks by cosine similarity
5. **Generate** — pass the retrieved chunks as context to the LLM, ask it to answer using only them

## Why citations matter
When the model must cite the retrieved passage, hallucinations drop. Readers can verify.

## Chunking strategy matters more than people think
- Too small: answers lack context
- Too large: retrieval returns low-density chunks that dilute the signal
- Overlap between chunks helps preserve context that spans chunk boundaries

## Hybrid retrieval
Combine dense (vector) retrieval with BM25 sparse retrieval. Dense handles semantic similarity; BM25 handles exact keywords. Combining both (RRF fusion) consistently outperforms either alone.`,
    },

    {
      author: marcus._id,
      title: 'Transformer attention — the intuition without the math',
      tags: ['ai', 'transformers', 'deep-learning'],
      content: `Attention is the core idea that made transformers dominant. Here's the intuition.

## What attention replaces
RNNs processed tokens sequentially, compressing history into a fixed-size hidden state. Long dependencies got lost. Attention lets every token directly compare itself to every other token.

## Query, Key, Value
Think of it as a soft database lookup:
- **Query**: what this token is looking for
- **Key**: what each token advertises it contains
- **Value**: the actual information each token carries

The attention score = similarity(Query, Key). High scores mean "pay a lot of attention to this token's Value."

## Multi-head attention
Run this lookup in parallel across h heads, each learning different relationship patterns. One head might learn subject-verb agreement; another might learn coreference.

## Why positional encoding?
Attention is position-agnostic — "the cat sat on the mat" and "the mat sat on the cat" produce the same token similarity scores. Positional encodings inject order.

## Quadratic cost
Standard attention is O(n²) in sequence length because every token attends to every other. Flash Attention and linear attention approximations tackle this.`,
    },

    {
      author: marcus._id,
      title: 'Fine-tuning vs. prompting — when to reach for each',
      tags: ['ai', 'llm', 'fine-tuning'],
      content: `Adding a new capability to an LLM can go two ways: prompt it or fine-tune it. The answer isn't always obvious.

## Prompting (zero-shot / few-shot)
Start here. A good system prompt with 3–5 examples often matches fine-tuning for many tasks — at zero incremental compute cost.

### When prompting is enough
- Task is well-described in text
- You need fast iteration
- Input/output is in natural language

## Fine-tuning
Adapt the model weights on your labelled data. Improves consistency on structured output (JSON schemas, code formatting, domain vocabulary).

### When to fine-tune
- Prompting has a high error rate you can't fix with more examples
- You need the model to internalize style/format, not just follow instructions
- You're paying high per-token costs and can amortize fine-tuning cost across volume

## LoRA / QLoRA
Full fine-tuning of a 7B model requires serious VRAM. LoRA trains low-rank adapters (a tiny fraction of params) and achieves comparable results. QLoRA quantizes the base model first to 4-bit, making 70B fine-tuning feasible on a single A100.

## The hierarchy
Zero-shot → few-shot → retrieval → fine-tune. Exhaust earlier options first.`,
    },

    {
      author: marcus._id,
      title: 'Embeddings — what they are and why they work',
      tags: ['ai', 'embeddings', 'machine-learning'],
      content: `An embedding is a list of numbers that represents meaning. That's it. The magic is in what the numbers encode.

## Training
Embeddings emerge from training on prediction tasks. Word2Vec trained on "predict the word from context." Modern sentence transformers train on sentence-pair similarity. The network learns to map semantically similar inputs to nearby points in vector space.

## Geometric intuition
- "King" - "Man" + "Woman" ≈ "Queen" — arithmetic in embedding space tracks semantic relationships
- Cosine similarity (dot product of normalized vectors) measures the angle between vectors
- Vectors close in angle have similar meaning

## Dimensionality
Most production embedding models output 768 or 1536 dimensions. More dimensions → more expressive but more storage and compute. Quantizing to int8 can cut storage by 4× with minimal accuracy loss.

## Use cases
| Task | How embeddings help |
|------|---------------------|
| Semantic search | Find similar documents by vector distance |
| Deduplication | Cluster near-duplicate records |
| Recommendation | Find items similar to a user's history |
| Classification | Use embeddings as input features |

Embeddings turn unstructured text into a space where math works.`,
    },

    {
      author: marcus._id,
      title: 'Evaluating LLM outputs — beyond vibes',
      tags: ['ai', 'llm', 'evals'],
      content: `"It feels right" is not an evaluation framework. Here's how to measure LLM quality systematically.

## Why eval is hard
LLM outputs are open-ended. Traditional ML metrics (accuracy, F1) assume discrete labels. Language is continuous and context-dependent.

## Reference-based metrics
When you have ground-truth answers:
- **Exact match** — too strict for generative tasks
- **ROUGE** — n-gram recall vs. reference (used for summarisation)
- **BERTScore** — embedding similarity between generated and reference

## LLM-as-judge
Use a stronger model (e.g., GPT-4) to grade outputs on a rubric. Scores correlate well with human judgement for coherence, relevance, and correctness — but beware self-preference bias (GPT-4 favours GPT-4-style outputs).

## Task-specific evals
Define concrete pass/fail criteria:
- Does the JSON parse?
- Does the code run?
- Does the SQL return the right rows on a test database?

## Regression testing
Every time you change a prompt, run the full eval set. This catches regressions that feel invisible in ad-hoc testing.

Invest in evals early. They are the unit tests of AI products.`,
    },

    /* ══ PRIYA — frontend / React / CSS ══ */
    {
      author: priya._id,
      title: 'React Hooks without the magic',
      tags: ['react', 'frontend', 'javascript'],
      content: `Hooks let function components hold state and run side effects. No magic — just closures and React's reconciler.

## useState
Returns [value, setter]. Calling the setter schedules a re-render with the new value. React batches setter calls in event handlers.

\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

## useEffect
Runs after the DOM has been painted. Use for network requests, subscriptions, timers — anything that syncs with the outside world.

The dependency array controls when the effect re-runs:
- `[]` → once on mount
- `[a, b]` → when a or b changes
- no array → after every render (rare)

## useRef
Holds a mutable value that does not trigger re-renders. Two main uses: accessing a DOM node (`ref.current = element`) and storing a value that persists across renders without causing them.

## useCallback / useMemo
Both memoize across renders. useCallback memoizes a function. useMemo memoizes a computed value. Don't add them pre-emptively — measure first.

## Custom hooks
Extract stateful logic into reusable functions. The convention is `useFoo`. They can call other hooks. This is the cleanest abstraction pattern in React.`,
    },

    {
      author: priya._id,
      title: 'CSS container queries — the layout revolution you missed',
      tags: ['css', 'frontend', 'responsive-design'],
      content: `Media queries ask "how wide is the viewport?" Container queries ask "how wide is my parent?" This small shift changes everything.

## The problem with media queries
A sidebar card and a hero card might both be 300 px wide, but one lives in a narrow sidebar and one in a full-width grid. A media query targeting 300 px viewport width is useless here.

## Container queries
\`\`\`css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card { flex-direction: row; }
}
\`\`\`

Now the card reflows based on its own container's width — regardless of where that container lives on the page.

## Container query units
`cqw` = 1% of container width. `cqh` = 1% of container height. Useful for fluid typography inside components.

## Browser support
Baseline 2023. Full support in Chrome 105+, Firefox 110+, Safari 16+. No polyfill needed for modern web targets.

## When to use them
Anywhere you're writing the same component and overriding it with modifier classes based on its context. Container queries eliminate the need for those overrides.

This is the biggest layout primitive since flexbox.`,
    },

    {
      author: priya._id,
      title: 'Accessibility is not a feature — it\'s architecture',
      tags: ['accessibility', 'frontend', 'a11y'],
      content: `Bolting on accessibility after the fact is like soundproofing after the walls are up. It needs to be structural.

## The semantic foundation
HTML has decades of accessibility built in. Use the right element:
- \`<button>\` not \`<div onClick>\`
- \`<nav>\` not \`<div class="nav">\`
- \`<h1>\`...\`<h6>\` in logical order

Screen readers build a tree from semantics. Div-soup breaks this.

## Keyboard navigation
Every interactive element must be reachable and operable with a keyboard. Focus order should follow visual / logical order. Visible focus rings are not optional.

## ARIA — use sparingly
ARIA adds semantic metadata where native HTML falls short. But ARIA on the wrong element can make things worse. Rule: native element first, ARIA as a last resort.

## Colour contrast
WCAG AA requires 4.5:1 for normal text, 3:1 for large text. Use a contrast checker in your design system, not just in review.

## Automated testing + manual review
axe-core and Lighthouse catch ~30% of issues. The remaining 70% require keyboard testing, screen reader testing (NVDA + Firefox, VoiceOver + Safari), and real users.

Accessibility is easier to build in than to retrofit.`,
    },

    {
      author: priya._id,
      title: 'State management in 2024 — do you even need Redux?',
      tags: ['react', 'state-management', 'frontend'],
      content: `Redux became the default in 2016. The ecosystem has moved on. Here's how to think about state in 2024.

## Types of state
| Type | Where it lives | Example |
|------|---------------|---------|
| Local UI state | Component | modal open/closed |
| Shared UI state | Context / store | current user, theme |
| Server state | Cache | posts, profiles |
| URL state | Router | current page, filters |

## Server state is different
Most of what people put in Redux is server state: data fetched from an API. Libraries like TanStack Query handle fetching, caching, invalidation, background refresh, and error states. That's 80% of what Redux was doing.

## For shared UI state
Zustand: 1 KB, no boilerplate, Immer support. Context + useReducer for simpler cases.

## When Redux is still the answer
- Very complex state with many actors
- Time-travel debugging is a product requirement
- You need the full Redux DevTools ecosystem
- Large team with strict predictability requirements

## Practical default
TanStack Query for server state + Zustand for the small amount of client UI state. Redux only when the complexity justifies it.`,
    },

    /* ══ ELIOT — DevOps / Platform ══ */
    {
      author: eliot._id,
      title: 'Kubernetes pod scheduling — how it actually works',
      tags: ['kubernetes', 'devops', 'platform'],
      content: `When you kubectl apply a Deployment, a lot happens before a container starts. Let's trace it.

## The scheduler's job
The Kubernetes scheduler watches for unscheduled pods and assigns them to nodes. It does this in two phases:

**Filtering** — eliminate nodes that can't run the pod:
- Insufficient CPU / memory
- Taint/toleration mismatch
- Node affinity rules not satisfied

**Scoring** — rank remaining nodes:
- Least-requested resource ratio
- Image locality (prefer nodes that already have the image)
- Inter-pod affinity / anti-affinity

## Resource requests vs. limits
- **Request**: what the scheduler uses to fit the pod
- **Limit**: what the kubelet enforces at runtime (CPU throttling, OOM kill for memory)

Set requests close to actual usage. Oversized requests waste cluster capacity.

## Node affinity vs. taints
- **Node affinity**: pods prefer / require specific nodes ("run on GPU nodes")
- **Taints + tolerations**: nodes repel pods unless they tolerate the taint ("only run ML workloads on GPU nodes")

## Pod disruption budgets
Define the minimum number of replicas that must stay up during voluntary disruptions (node drains). Without a PDB, node maintenance can take down all replicas.`,
    },

    {
      author: eliot._id,
      title: 'Observability: the three pillars and why you need all three',
      tags: ['observability', 'devops', 'sre'],
      content: `Metrics, logs, and traces are not interchangeable. Each answers a different question.

## Metrics — what is happening
Time-series numbers. CPU%, request rate, error rate, p99 latency. Cheap to store, fast to query, terrible for debugging individual requests.

Good for: alerting, dashboards, capacity planning.

## Logs — what happened
Structured event records. Rich context per event. Expensive at scale; searching across gigabytes is slow.

Good for: root cause analysis after you know something went wrong.

## Traces — how it happened
A trace captures the journey of a single request across services, with timing for each span. Answers "why is this particular user slow?" without digging through logs.

Good for: latency debugging, service dependency mapping.

## The golden signals (SRE)
Focus metrics on:
1. Latency — p50, p95, p99
2. Traffic — requests/second
3. Errors — error rate
4. Saturation — CPU, queue depth, DB connections

## OpenTelemetry
OTel is becoming the standard SDK for all three pillars. Instrument once; route to Prometheus, Jaeger, Loki, Datadog — whatever you run. Avoid vendor lock-in at the instrumentation layer.`,
    },

    {
      author: eliot._id,
      title: 'Zero-downtime deployments — a practical checklist',
      tags: ['devops', 'deployment', 'reliability'],
      content: `"We're taking the site down for maintenance" should be a phrase from 2005. Here's how to ship without a window.

## Rolling deployments
Replace pods one at a time. Kubernetes does this by default with RollingUpdate strategy. Configure maxUnavailable=0, maxSurge=1 to ensure capacity is never reduced.

## Blue-green deployments
Run two identical environments. Route traffic to green. Deploy new version to blue. Switch the load balancer. Roll back by switching back. High cost (double infra) but instant rollback.

## Canary releases
Route 1–5% of traffic to the new version. Monitor error rates and latency. Gradually increase. Catch regressions before they hit all users.

## Database migrations
The hard part. Rules:
1. Expand before contract — add a nullable column first, then backfill, then make it NOT NULL in a later deploy
2. Never drop a column until all code versions that read it are retired
3. Use feature flags to gate code reading a new column until migration is complete

## Health checks
Readiness probe: is this pod ready to receive traffic?
Liveness probe: is this pod alive? (restart if not)
Always implement both. Readiness prevents routing to pods that are still starting up.`,
    },

    {
      author: eliot._id,
      title: 'Linux networking for developers — the bits you actually need',
      tags: ['linux', 'networking', 'devops'],
      content: `You don't need to be a network engineer. But understanding a few fundamentals will save you hours of debugging.

## The TCP handshake
SYN → SYN-ACK → ACK. Three packets before a single byte of application data moves. High-latency networks (satellite, cross-continent) multiply this cost.

TIME_WAIT keeps connections in a half-closed state for 2×MSL (typically 4 minutes). Under high connection churn, you can exhaust ports. Solution: enable SO_REUSEADDR or connection pooling.

## Sockets and file descriptors
Everything in Linux is a file. Network connections are file descriptors. Default ulimit is often 1024. Under load, you'll hit "too many open files" before you'd expect. Raise it in /etc/security/limits.conf.

## DNS
Most production DNS issues boil down to:
- TTL confusion (cached stale entries)
- ndots threshold (Kubernetes DNS search path)
- NXDOMAIN vs. SERVFAIL confusion in retry logic

## iptables / nftables
Kubernetes networking is iptables rules all the way down (or eBPF-based Cilium on modern clusters). kube-proxy writes rules to NAT ClusterIPs to pod IPs.

Run \`iptables -t nat -L -n --line-numbers\` to see the actual rules on a node.`,
    },

    /* ══ SOFIA — full-stack / SaaS / product ══ */
    {
      author: sofia._id,
      title: 'Building a SaaS pricing page that actually converts',
      tags: ['saas', 'product', 'growth'],
      content: `The pricing page is the highest-leverage page on a SaaS site. Most are terrible.

## Anchoring
Show the most expensive plan first. Users anchor to the first price they see. A plan that costs $99/month feels cheap when seen after $299/month.

## Three tiers, one recommended
Three options reduces decision paralysis vs. two or four. Mark one as "Most Popular" with a visual highlight. This is the plan you want to sell.

## What to put on each tier
- **Free / Starter**: enough to create value and habit, not enough to run a business on
- **Pro**: the recommended plan. Priced for individuals and small teams
- **Team / Enterprise**: per-seat or custom. Contact sales above a threshold.

## FAQ on the page
Address the three biggest objections immediately below the pricing table:
1. "Can I change plans?" → Yes, anytime.
2. "Is there a free trial?" → Yes, 14 days, no card required.
3. "What happens when I exceed limits?" → We'll notify you and you can upgrade.

## Annual vs. monthly toggle
Annual pricing should show monthly-equivalent price. "Billed annually" in small text. The difference between $49/month and $29/month (billed annually) feels larger than paying $348 upfront.

Price your product. Then test it.`,
    },

    {
      author: sofia._id,
      title: 'API design principles I wish I knew earlier',
      tags: ['api-design', 'backend', 'developer-experience'],
      content: `APIs outlive their authors. Design them as if you can never change them.

## Names are a contract
Choose names carefully. \`created_at\` is better than \`ts\`. \`user_id\` is better than \`uid\`. Plural for collections (\`/posts\`), singular for items (\`/posts/:id\`).

## Errors should be informative
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email must be a valid email address",
    "field": "email"
  }
}
\`\`\`
Not just: \`{ "error": "Bad Request" }\`

## Pagination from the start
You will have more data than you expect. Design pagination in from day one:
- Offset pagination: simple, works with SQL, inconsistent under mutations
- Cursor pagination: stable under concurrent writes, harder to implement

## Versioning
/v1/, /v2/ in the URL. Break things in a new version, not in the existing one. Never remove a field — deprecate it with a sunset date.

## Rate limiting
Return \`X-RateLimit-Remaining\` and \`Retry-After\` headers. HTTP 429 not 503. Let clients build respectful integrations.

## Idempotency
POST endpoints that create resources should accept an idempotency key. Same key, same result. Prevents duplicate records when clients retry on timeout.`,
    },

    {
      author: sofia._id,
      title: 'The art of the technical spec',
      tags: ['engineering', 'process', 'writing'],
      content: `A technical spec is not documentation for what you built. It's a tool for thinking through what you're about to build.

## Why write one
Writing forces precision. "We'll cache the results" is a thought. "We'll cache post metadata in Redis with a 5-minute TTL, invalidated on update, keyed by post ID" is a decision.

## What to include
1. **Problem statement** — what user pain or product gap does this solve?
2. **Goals and non-goals** — explicit non-goals save you from scope creep
3. **Solution overview** — the approach, not the implementation
4. **Detailed design** — API contracts, data models, algorithm choices
5. **Alternatives considered** — shows your reasoning
6. **Open questions** — surfaces decisions you haven't made yet
7. **Rollout plan** — how you'll deploy, feature-flag, and monitor

## What to leave out
Implementation details that will change. The spec should guide, not constrain.

## Review process
Share early. A spec reviewed after coding is documentation, not a spec. The goal is to find the holes in the thinking before you're 80% through the implementation.

## Length
Long enough to communicate the decision, short enough to be read. Aim for 1–3 pages for a medium feature, not 15.`,
    },

    {
      author: sofia._id,
      title: 'Auth from scratch — what you need to know',
      tags: ['auth', 'security', 'backend'],
      content: `Authentication is where most security mistakes happen. Here's what actually matters.

## Never roll your own crypto
Use bcrypt or Argon2 for passwords. bcrypt's work factor is tunable — increase it as hardware improves. SHA-256 is not a password hashing function.

## JWT vs. sessions
Sessions store state server-side; a session ID is a reference. JWTs store state client-side; the token is the state. 

JWTs can't be revoked without extra infrastructure (a blocklist defeats the point). Sessions can be invalidated instantly. For most web apps, sessions win.

## Refresh tokens
Short-lived access tokens (15–60 minutes) + long-lived refresh tokens. If an access token is stolen, damage is limited by its TTL. Refresh tokens should be rotated and stored in an HttpOnly cookie.

## OAuth / OIDC
Don't ask users to create another password if you can help it. "Sign in with Google" reduces friction and moves credential security to providers who do it full-time.

## Rate limit auth endpoints
Login and registration endpoints are the primary target for credential stuffing. Rate limit by IP and by account. Add CAPTCHA on repeated failures.

## Audit logs
Log every auth event: login, logout, failed attempt, password change, token revocation. You need this for incident response.

Security is not a feature you add at the end.`,
    },

    {
      author: sofia._id,
      title: 'Designing for loading states — the UX nobody ships',
      tags: ['ux', 'frontend', 'product'],
      content: `Most apps design the happy path in detail and ship skeleton spinners as an afterthought. Loading states deserve real design.

## The spectrum
1. **Instant (< 100ms)** — no indicator needed. Any spinner here adds perceived jitter.
2. **Fast (100–1000ms)** — skeleton screens. Mirror the shape of the content so the page feels stable.
3. **Slow (1–5s)** — progress indicator + context ("Generating your report...")
4. **Very slow (> 5s)** — give the user something to do. Let them navigate away and notify when done.

## Skeleton screens > spinners
Skeletons reduce perceived wait time by showing structure. The brain interprets filled-in shapes as "almost done" not "waiting."

## Optimistic updates
Update the UI immediately on user action. Roll back if the request fails. Feels instant. Works brilliantly for likes, bookmarks, and non-critical writes.

## Error states are loading states
Design the error case as carefully as the loading case. What can the user do? Retry? Go back? Contact support? A blank or frozen UI is not an answer.

## Stale-while-revalidate
Show cached content immediately, fetch fresh data in the background, swap in quietly when ready. Users see content fast; data is still fresh.

The best loading state is the one the user doesn't notice.`,
    },

    /* ══ Mixed / cross-topic ══ */
    {
      author: aria._id,
      title: 'Git internals — what actually happens when you commit',
      tags: ['git', 'version-control', 'engineering'],
      content: `Git is a content-addressable filesystem with a commit graph on top. Understanding this makes git less mysterious.

## Objects
Everything in git is an object with a SHA-1 hash as its ID:
- **blob** — file contents
- **tree** — directory listing (maps names to blob/tree hashes)
- **commit** — tree hash + parent hash(es) + author + message
- **tag** — pointer to a commit

## A commit is a snapshot, not a diff
Git stores complete snapshots, not deltas. Blobs are deduplicated by content hash — if two files have identical content, they share one blob.

## Branches are just pointers
A branch is a file in .git/refs/heads/ containing a commit hash. Creating a branch is O(1). HEAD is a pointer to the current branch (or directly to a commit in detached HEAD mode).

## What git commit does
1. Hash every changed file → new blobs
2. Build a tree object for the directory structure
3. Create a commit object pointing to the tree and the current HEAD
4. Update HEAD (or the current branch) to the new commit hash

## Garbage collection
Orphaned objects (unreachable from any ref) are collected by \`git gc\`. Until then, nothing is lost — you can recover deleted commits with the reflog.`,
    },

    {
      author: marcus._id,
      title: 'Prompt engineering — patterns that actually work',
      tags: ['ai', 'prompting', 'llm'],
      content: `Prompt engineering is part craft, part empirical science. Here are patterns with consistent results.

## Chain-of-thought
Add "Let's think step by step" or show a worked example. Forces the model to reason before outputting an answer. Improves accuracy on multi-step problems dramatically.

## Persona / role
"You are a senior software engineer reviewing a pull request." Activates knowledge relevant to that role and sets tone expectations.

## Format specification
"Respond in JSON with fields: summary, confidence (0–1), tags." Structured output is far more reliable when specified explicitly.

## Few-shot examples
Three worked examples beat five pages of instructions for most tasks. The model learns format and style from examples faster than from descriptions.

## Decomposition
Break complex tasks into subtasks. Ask the model to outline before writing. Ask it to check its own work. Multi-pass prompting beats single-pass for long, complex outputs.

## Negative constraints
"Do not include any explanation, only the code block." Constraints reduce filler text and hallucinated caveats.

## Evaluation loop
The best prompt is the one that passes your eval suite, not the one that feels cleverest. Test on at least 20 examples before declaring victory.`,
    },

    {
      author: priya._id,
      title: 'Web performance fundamentals — the metrics that matter',
      tags: ['performance', 'frontend', 'web-vitals'],
      content: `Performance is a feature. Core Web Vitals are how Google measures it — and how users experience it.

## The three Core Web Vitals

**LCP (Largest Contentful Paint)** — how fast does the main content load?
- Target: < 2.5 s
- Usually a hero image or heading. Optimize: preload, CDN, modern formats (WebP/AVIF)

**INP (Interaction to Next Paint)** — how responsive is the page to input?
- Target: < 200 ms
- Caused by long tasks blocking the main thread. Break up JavaScript, defer non-critical work.

**CLS (Cumulative Layout Shift)** — does content jump around?
- Target: < 0.1
- Caused by images without dimensions, late-loading fonts, injected banners. Always specify width/height.

## Tools
- Chrome DevTools → Performance tab → record while interacting
- Lighthouse in DevTools or CI
- PageSpeed Insights for field data (real user metrics)
- WebPageTest for waterfall analysis

## The low-hanging fruit
1. Serve images in modern formats with proper dimensions
2. Avoid render-blocking scripts (defer, async, or move to end of body)
3. Use a CDN
4. Set long cache-control headers for static assets

10% faster page load = 1% more conversions. It compounds.`,
    },

  ];

  let created = 0;
  let skipped = 0;

  for (const p of posts) {
    const exists = await Post.findOne({ title: p.title, author: p.author });
    if (exists) { console.log(`  skip: "${p.title}"`); skipped++; continue; }
    await Post.create({ ...p, status: 'published' });
    console.log(`  ✓ "${p.title}"`);
    created++;
  }

  console.log(`\nDone. Created ${created} posts, skipped ${skipped} duplicates.`);
  console.log('Login with any demo author: demo password is "demo1234"');
  console.log('  aria@quilio.app  |  marcus@quilio.app  |  priya@quilio.app');
  console.log('  eliot@quilio.app  |  sofia@quilio.app');
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
