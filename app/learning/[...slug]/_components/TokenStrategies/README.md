# Token Management Strategies - Quick Reference

## 📁 Files in this folder

### **Strategy1RollingContext.tsx** 🔄

Simple rolling window - deletes oldest messages when limit exceeded.

**When to use:** Short chats, not critical old context  
**Complexity:** ⭐ Simple  
**Performance:** ⭐⭐⭐ Fast

---

### **Strategy2Summarized.tsx** 🤖

AI compresses old messages into summaries.

**When to use:** Important conversations  
**Complexity:** ⭐⭐ Medium  
**Performance:** ⭐⭐ Medium

---

### **Strategy3Categorized.tsx** 🗂️

Topic-based filtering - send only relevant categories.

**When to use:** Huge histories, many topics  
**Complexity:** ⭐⭐⭐ Advanced  
**Performance:** ⭐ Slow (many API calls)

---

### **Strategy4Hybrid.tsx** 🧩 ⭐ PRODUCTION READY

Combines all approaches:

- Categorization (topics)
- Relevance scoring (0-10)
- Priority tiers (Tier 1/2/3)
- Smart optimization (delete → summarize → emergency)

**When to use:** Production chatbots (GitHub Copilot uses this!)  
**Complexity:** ⭐⭐⭐ Advanced  
**Performance:** ⭐⭐ Medium  
**Context Preservation:** ⭐⭐⭐ Excellent

📖 **Read full explanation:** [HYBRID_STRATEGY_EXPLAINED.md](./HYBRID_STRATEGY_EXPLAINED.md)

---

## 🎯 How Hybrid Works (Quick Overview)

```typescript
// 1. CATEGORIZE: Detect topics
messages.forEach(msg => {
  msg.topics = ["pricing", "delivery", "products"];
});

// 2. SCORE: Calculate relevance (0-10)
messages.forEach(msg => {
  msg.relevanceScore = calculateRelevance(msg, currentQuestion);
});

// 3. ASSIGN TIERS: Prioritize
messages.forEach(msg => {
  if (isLast3) msg.tier = 1; // Critical
  else if (score >= 5) msg.tier = 2; // Important
  else msg.tier = 3; // Optional
});

// 4. OPTIMIZE: Apply 3 phases
Phase 1: Delete Tier 3 (lowest priority)
Phase 2: Summarize Tier 2 (if still over limit)
Phase 3: Summarize older Tier 1 (emergency, keep last 2 full)

// Result: Under token limit with maximum context preserved! ✅
```

---

## 📊 Comparison Table

| Strategy      | Complexity | Speed  | Context | Best For          | Cost   |
| ------------- | ---------- | ------ | ------- | ----------------- | ------ |
| Rolling       | ⭐         | ⭐⭐⭐ | ⭐      | Short chats       | $ Free |
| Summarized    | ⭐⭐       | ⭐⭐   | ⭐⭐    | Important history | $$     |
| Categorized   | ⭐⭐⭐     | ⭐     | ⭐⭐⭐  | Multi-topic       | $$$    |
| **🧩 Hybrid** | ⭐⭐⭐     | ⭐⭐   | ⭐⭐⭐  | **Production**    | $$$    |

---

## 🚀 Try it out!

1. Go to `/learning/module1/task6`
2. Select "🧩 Hybrid Approach"
3. Send 10+ messages
4. Watch Tiers and relevance scores change
5. Compare with other strategies

---

## 📚 Learn More

- **Deep dive:** [HYBRID_STRATEGY_EXPLAINED.md](./HYBRID_STRATEGY_EXPLAINED.md)
- **Code:** Open `Strategy4Hybrid.tsx` and study `optimizeMessages()` function
- **OpenAI Docs:** [Managing Tokens](https://platform.openai.com/docs/guides/text-generation/managing-tokens)

---

**🎓 Key Takeaway:** Hybrid = Best balance for production apps!
