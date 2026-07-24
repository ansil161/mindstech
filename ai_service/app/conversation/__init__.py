"""
Conversation engine.

Sits in front of retrieval and decides what a turn actually *is* before any
embedding or vector search happens. In v1 every message — including "hi",
"thanks" and "yes" — was embedded and searched, which produced nonsense
answers for conversational turns and burned an LLM call plus a vector query
on each of them.

Layering:
    intents      - the taxonomy
    state        - per-conversation state model
    memory       - async persistence (Redis, with a bounded in-process fallback)
    rules        - tier-1 deterministic classification (free, instant)
    classifier   - tier-2 LLM classification for genuinely ambiguous turns
    faq          - structured company answers that must not depend on retrieval
    rewriter     - turns a fragment into a standalone retrieval query
    dialogue     - routes a classified turn to the right handler
"""
