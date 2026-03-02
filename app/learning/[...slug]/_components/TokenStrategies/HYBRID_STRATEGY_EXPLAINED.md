# 🧩 Hybrid Approach - Production Token Management Strategy

## 📚 Что это?

**Hybrid Approach** - это самая продвинутая стратегия управления токенами, которая комбинирует все предыдущие подходы:

- 🔄 **Rolling Context** (Strategy 1) - удаление нерелевантных сообщений
- 🤖 **Summarization** (Strategy 2) - сжатие через AI
- 🗂️ **Categorization** (Strategy 3) - разбивка по темам

Именно этот подход использует **GitHub Copilot** и другие production AI системы!

---

## 🎯 Как это работает? (Пошаговый алгоритм)

### ШАГ 1: CATEGORIZATION (Категоризация)

Каждое новое сообщение получает метки тем:

```typescript
User: "What's the price of Product X?"
→ Topics: ["pricing", "products"]

User: "When will it be delivered?"
→ Topics: ["delivery"]
```

**Код:**

```typescript
const categorizeMessage = (content: string): string[] => {
  const keywords = content.toLowerCase();
  const detectedTopics: string[] = [];

  if (keywords.includes("price") || keywords.includes("cost"))
    detectedTopics.push("pricing");
  if (keywords.includes("delivery") || keywords.includes("shipping"))
    detectedTopics.push("delivery");
  // ... и т.д.

  return detectedTopics.length > 0 ? detectedTopics : ["general"];
};
```

---

### ШАГ 2: RELEVANCE SCORING (Оценка релевантности)

Каждое сообщение получает **relevance score** от 0 до 10 на основе:

1. **Recency** (свежесть) - последние сообщения важнее
2. **Topic overlap** (совпадение тем) - релевантные темы важнее

```typescript
const calculateRelevanceScore = (
  message: Message,
  currentTopics: string[], // Темы ТЕКУЩЕГО вопроса
  messageIndex: number,
  totalMessages: number,
): number => {
  let score = 0;

  // 1. Recency score (0-5 points)
  // Чем новее сообщение, тем выше score
  const recencyScore = (messageIndex / totalMessages) * 5;
  score += recencyScore;

  // 2. Topic relevance score (0-5 points)
  // Чем больше совпадений тем, тем выше score
  const topicOverlap = message.topics.filter((t) =>
    currentTopics.includes(t),
  ).length;
  const topicScore = Math.min((topicOverlap / currentTopics.length) * 5, 5);
  score += topicScore;

  return Math.round(score * 10) / 10; // 0.0 - 10.0
};
```

**Пример:**

```
Current question: "What payment methods do you accept?"
→ Topics: ["account", "pricing"]

Message history:
#1 (old): "How much does shipping cost?"
  Topics: ["delivery", "pricing"]
  Recency: 1/15 * 5 = 0.3
  Topic overlap: 1/2 * 5 = 2.5
  TOTAL: 2.8/10

#14 (recent): "I want to buy Product X"
  Topics: ["products"]
  Recency: 14/15 * 5 = 4.7
  Topic overlap: 0/2 * 5 = 0
  TOTAL: 4.7/10

#15 (latest): "What's the price?"
  Topics: ["pricing"]
  Recency: 15/15 * 5 = 5.0
  Topic overlap: 1/2 * 5 = 2.5
  TOTAL: 7.5/10
```

---

### ШАГ 3: PRIORITY TIERS (Уровни приоритета)

Делим сообщения на **3 tier'а** по важности:

```typescript
const assignTier = (
  message: Message,
  index: number,
  total: number,
): 1 | 2 | 3 => {
  // 🔴 TIER 1: Последние 3 сообщения = ВСЕГДА важны
  if (index >= total - 3) return 1;

  // 🟡 TIER 2: Высокая релевантность (score >= 5)
  if (message.relevanceScore >= 5) return 2;

  // ⚪ TIER 3: Низкая релевантность (score < 5)
  return 3;
};
```

**Логика:**

- 🔴 **Tier 1 (Critical)**: Последние 3 сообщения + текущий вопрос
  - ВСЕГДА отправляем в полном виде
  - Критичны для понимания текущего контекста
- 🟡 **Tier 2 (Important)**: Релевантные сообщения (score >= 5)
  - Отправляем полностью, если есть место
  - Если токенов мало → СЖИМАЕМ через AI
- ⚪ **Tier 3 (Optional)**: Нерелевантные сообщения (score < 5)
  - УДАЛЯЕМ первыми если превышен лимит
  - Или сжимаем в краткий summary

---

### ШАГ 4: TOKEN BUDGET ALLOCATION (Распределение токенов)

Распределяем лимит токенов по приоритетам:

```typescript
const TIER_BUDGETS = {
  tier1: 0.6, // 60% для критичных
  tier2: 0.3, // 30% для релевантных
  tier3: 0.1, // 10% для опциональных
};
```

**Пример при лимите 1000 токенов:**

- Tier 1: 600 tokens (last 3 messages)
- Tier 2: 300 tokens (relevant messages)
- Tier 3: 100 tokens (optional, can delete)

---

### ШАГ 5: DYNAMIC OPTIMIZATION (Динамическая оптимизация)

Если все еще превышен лимит → применяем **3 фазы оптимизации**:

#### **PHASE 1: Delete Tier 3** 🗑️

```typescript
// Удаляем все Tier 3 (самые нерелевантные)
optimized = optimized.filter((m) => m.tier !== 3);
```

#### **PHASE 2: Summarize Tier 2** ✂️

```typescript
// Сжимаем Tier 2 через AI (если еще превышен лимит)
for (let i = 0; i < optimized.length; i++) {
  if (optimized[i].tier === 2 && !optimized[i].isSummarized) {
    optimized[i] = await summarizeMessage(optimized[i]);
    // Summary: "User asked about delivery times" (сжато с 150 → 30 tokens)

    if (totalTokens <= TOKEN_LIMIT) break;
  }
}
```

#### **PHASE 3: Emergency - Summarize older Tier 1** ⚠️

```typescript
// В крайнем случае: сжимаем даже Tier 1 (но оставляем последние 2 полными)
const tier1ToSummarize = tier1Messages.slice(0, -2); // Keep last 2 full

for (const message of tier1ToSummarize) {
  message = await summarizeMessage(message);
}
```

---

## 📊 Полный пример работы

### Исходная ситуация:

```
История: 15 сообщений (1200 токенов)
Лимит: 800 токенов
Превышение: 400 токенов ❌

Messages:
#1-#10: Разговор о доставке (delivery) - 600 tokens
  Topics: [delivery]

#11-#12: Вопрос о цене (pricing) - 200 tokens
  Topics: [pricing]

#13-#15: Недавние сообщения - 400 tokens
  Topics: [pricing, products]

Current Question: "What payment methods do you accept?"
→ Detected topics: [account, support]
```

### Step 1: Relevance Scoring

```
#1-#10 (delivery):
  - Старые (recency: 1-10/15 = low)
  - Не релевантные для "account" (topic overlap: 0)
  - Score: 2/10

#11-#12 (pricing):
  - Средние по времени (recency: 11-12/15 = medium)
  - Чуть релевантные (topic: pricing связан с account)
  - Score: 4/10

#13-#15 (recent):
  - Последние 3 (recency: 13-15/15 = high)
  - ВСЕГДА важны (по правилу last 3)
  - Score: 10/10
```

### Step 2: Assign Tiers

```
Tier 1 (Critical): #13-#15 (400 tokens) ← KEEP FULL
Tier 2 (Important): #11-#12 (200 tokens) ← Can summarize if needed
Tier 3 (Optional): #1-#10 (600 tokens) ← DELETE or SUMMARIZE
```

### Step 3: Optimize (Apply phases)

#### **PHASE 1: Delete Tier 3**

```
Before: 1200 tokens (#1-#15)
After: 600 tokens (#11-#15)
Status: Still over 800 limit, continue...
```

Не удаляем Tier 3 полностью, пробуем сжать:

#### **PHASE 2: Summarize Tier 3 instead of deleting**

```
#1-#10 summary:
  Original: 600 tokens (10 messages about delivery)
  Compressed: "User asked about delivery times, shipping costs,
               and international shipping options."
  Tokens: 100 tokens ✂️

New total: 100 (Tier 3 summary) + 200 (Tier 2) + 400 (Tier 1) = 700 tokens ✅
```

### Final Result:

```
✅ 700 tokens (under 800 limit!)

Context sent to AI:
- 🗑️ #1-#10: [Summary] User asked about delivery (100 tokens)
- 📝 #11-#12: Full messages about pricing (200 tokens)
- 🔴 #13-#15: Full recent messages (400 tokens)

AI теперь имеет:
- Полный контекст последних 3 сообщений
- Полные релевантные сообщения (#11-#12)
- Краткую суть старого контекста (summary)
```

---

## 🏆 Преимущества Hybrid Approach

### ✅ 1. Умная приоритизация

Не просто "удалить старые", а **оценить важность** каждого сообщения.

### ✅ 2. Сохранение контекста

Tier 1 (последние 3) ВСЕГДА полные → AI помнит immediate context.

### ✅ 3. Масштабируемость

Tier 3 удаляется → можно обработать историю из 1000+ сообщений.

### ✅ 4. Эффективность

Сжимаем только то, что нужно (не все подряд).

### ✅ 5. Production-ready

GitHub Copilot использует похожий подход!

---

## ❌ Недостатки

### ❌ 1. Сложность реализации

Много логики: relevance scoring, tier assignment, phases.

### ❌ 2. Больше API вызовов

Summarization для Tier 2/3 → дороже (каждый summary = 1 API call).

### ❌ 3. Требует настройки

Нужно подобрать:

- Tier budgets (60%/30%/10%)
- Relevance thresholds (score >= 5 для Tier 2)
- Категории тем (pricing, delivery, etc.)

### ❌ 4. Сложнее дебажить

Много moving parts → труднее понять, почему AI "забыл" что-то.

---

## 🔧 Когда использовать?

### ✅ ИСПОЛЬЗУЙ Hybrid когда:

- Production chatbot с длинными историями (>20 сообщений)
- Multi-topic разговоры (support, sales, technical)
- Важно сохранить максимум контекста
- Бюджет позволяет дополнительные API calls
- Нужен лучший баланс: context preservation + scalability

### ❌ НЕ ИСПОЛЬЗУЙ когда:

- Простой чат-бот с короткими диалогами (<10 сообщений)
- Tight budget (много API вызовов = дорого)
- Single-topic разговоры (все сообщения релевантны)
- Не критична идеальная память (Strategy 1 достаточно)

---

## 💡 Production Tips

### 1. Кэшируй relevance scores

```typescript
// Вместо пересчета каждый раз:
const cachedScores = new Map<string, number>();
```

### 2. Используй real AI для categorization

```typescript
// Вместо keyword matching:
const categorize = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content:
        "Categorize this message into: pricing, delivery, products, support, account",
    },
    { role: "user", content: message.content },
  ],
});
```

### 3. A/B тестируй tier budgets

```typescript
// Попробуй разные распределения:
const TIER_BUDGETS_V1 = { tier1: 0.6, tier2: 0.3, tier3: 0.1 };
const TIER_BUDGETS_V2 = { tier1: 0.5, tier2: 0.4, tier3: 0.1 };
// Какой дает лучшие ответы AI?
```

### 4. Мониторь performance

```typescript
console.log({
  totalMessages: messages.length,
  tier1Count: tier1Messages.length,
  tier2Count: tier2Messages.length,
  tier3Count: tier3Messages.length,
  summarizedCount: summarizedMessages.length,
  totalTokens: getTotalTokens(optimized),
  optimizationTime: Date.now() - startTime,
});
```

---

## 📚 Сравнение с другими стратегиями

| Feature                  | Rolling     | Summarized  | Categorized      | **🧩 Hybrid**    |
| ------------------------ | ----------- | ----------- | ---------------- | ---------------- |
| **Complexity**           | ⭐ Simple   | ⭐⭐ Medium | ⭐⭐⭐ Advanced  | ⭐⭐⭐ Advanced  |
| **Performance**          | ⭐⭐⭐ Fast | ⭐⭐ Medium | ⭐ Slow          | ⭐⭐ Medium      |
| **Context Preservation** | ⭐ Poor     | ⭐⭐ Good   | ⭐⭐⭐ Excellent | ⭐⭐⭐ Excellent |
| **Scalability**          | ❌ Limited  | ⚠️ Moderate | ✅ Unlimited     | ✅ Unlimited     |
| **Cost (API calls)**     | $ Free      | $$ Medium   | $$$ High         | $$$ High         |
| **Production Ready**     | ❌ No       | ⚠️ Maybe    | ⚠️ Complex       | ✅ **Yes**       |

---

## 🎓 Как учиться дальше?

### 1. Протестируй Strategy4Hybrid.tsx

- Открой `/learning/module1/task6`
- Выбери "🧩 Hybrid Approach"
- Отправь 10+ сообщений
- Наблюдай как меняются Tiers и relevance scores

### 2. Изучи код построчно

- Открой `Strategy4Hybrid.tsx`
- Найди функцию `optimizeMessages()`
- Пройдись по каждой фазе оптимизации
- Поставь breakpoints и дебажь

### 3. Модифицируй параметры

```typescript
// Попробуй разные budgets:
const TIER_BUDGETS = {
  tier1: 0.7, // Больше места для критичных
  tier2: 0.2, // Меньше для релевантных
  tier3: 0.1,
};

// Попробуй другой порог для Tier 2:
if (message.relevanceScore >= 6) return 2; // Строже
```

### 4. Интегрируй в свой проект

- Скопируй `Strategy4Hybrid.tsx` в свой проект
- Адаптируй под свои категории тем
- Подключи реальный OpenAI API для summarization
- Добавь мониторинг и логгирование

---

## 🔗 Полезные ссылки

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Token Counting with tiktoken](https://github.com/openai/tiktoken)
- [Context Window Management Best Practices](https://platform.openai.com/docs/guides/text-generation/managing-tokens)

---

## 📝 Резюме

**Hybrid Approach** - это gold standard для production чат-ботов:

1. Категоризуй сообщения по темам
2. Оцени relevance score (recency + topic overlap)
3. Раздели на 3 tier'а по важности
4. Примени 3-фазную оптимизацию (delete → summarize → emergency)
5. Мониторь и настраивай параметры

**Следующий шаг:** Изучи код → Протестируй демо → Адаптируй под свой проект!

🚀 **Happy Coding!**
