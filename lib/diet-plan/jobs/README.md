# Diet Plan Optimization Jobs

This directory contains background jobs for optimizing the Pinecone vector database.

## Overview

Three optimization strategies work together to keep the database efficient:

1. **Deduplication** ✅ (Real-time in saveMemory.ts)
2. **Quality Filtering** ✅ (This job - Daily cron)
3. **Aggregation** ✅ (This job - Monthly cron)

---

## 1. Quality Filter Job

**Purpose:** Delete low-quality individual plans after 90 days

**Criteria for deletion:**

- Plan age > 90 days (expires_at < today)
- Type = "individual" (aggregated plans NEVER deleted)
- Either:
  - `usage_count < 5` (unpopular)
  - `plan_length < 500` (incomplete)

**Schedule:** Daily  
**Endpoint:** `POST /api/learning/module4-task1/jobs/quality-filter`

**Example:**

```bash
# Run manually
curl -X POST http://localhost:3000/api/learning/module4-task1/jobs/quality-filter

# Check job info
curl http://localhost:3000/api/learning/module4-task1/jobs/quality-filter
```

**Response:**

```json
{
  "success": true,
  "deletedCount": 42,
  "totalScanned": 1547,
  "message": "Deleted 42 low-quality plans"
}
```

---

## 2. Aggregation Job

**Purpose:** Create "master plans" from clusters of similar plans

**How it works:**

1. Group individual plans by dietType + calorie range (±200 cal)
2. Find clusters with 50+ plans
3. Extract top 10 most frequent recipes
4. Create aggregated master plan (type: "aggregated", expires_at: null)

**Schedule:** Monthly (1st of each month)  
**Endpoint:** `POST /api/learning/module4-task1/jobs/aggregation`

**Example:**

```bash
# Run manually
curl -X POST http://localhost:3000/api/learning/module4-task1/jobs/aggregation

# Check job info
curl http://localhost:3000/api/learning/module4-task1/jobs/aggregation
```

**Response:**

```json
{
  "success": true,
  "masterPlansCreated": 12,
  "totalIndividualPlans": 847,
  "clusters": 35,
  "details": [
    {
      "dietType": "vegan",
      "planCount": 150,
      "avgCalories": 1987,
      "recipesIncluded": 10
    }
  ]
}
```

---

## Timeline Example

**Month 1 (March):**

- 1000 individual plans created
- Deduplication: 900 unique saved

**Month 2 (April 1st):**

- **Aggregation runs**: 900 plans → 15 master plans
- Individual plans still exist (age < 90 days)

**Month 3 (May):**

- 800 new individual plans
- Quality Filter: No deletions yet (age < 90 days)

**Month 4 (June 1st):**

- **Aggregation**: 700 new plans → 12 master plans
- **Quality Filter**: March's 900 plans (age = 90 days) → DELETED ❌
- March's 15 master plans → KEPT ✅ (type: "aggregated")

**Result:** ~730 total plans (instead of 2500+ without optimization!)

---

## Production Setup

### Option 1: Vercel Cron Jobs

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/learning/module4-task1/jobs/quality-filter",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/learning/module4-task1/jobs/aggregation",
      "schedule": "0 3 1 * *"
    }
  ]
}
```

### Option 2: GitHub Actions

Create `.github/workflows/diet-jobs.yml`:

```yaml
name: Diet Plan Optimization Jobs

on:
  schedule:
    - cron: "0 2 * * *" # Daily at 2 AM
    - cron: "0 3 1 * *" # Monthly at 3 AM on 1st

jobs:
  quality-filter:
    runs-on: ubuntu-latest
    steps:
      - name: Run Quality Filter
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/learning/module4-task1/jobs/quality-filter

  aggregation:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 3 1 * *'
    steps:
      - name: Run Aggregation
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/learning/module4-task1/jobs/aggregation
```

### Option 3: External Cron Service

Use services like:

- **Cron-job.org**
- **EasyCron**
- **AWS EventBridge**

Configure them to POST to your API endpoints daily/monthly.

---

## Monitoring

Add these endpoints to your dashboard to monitor job health:

```typescript
// Check last run status
GET / api / learning / module4 - task1 / jobs / quality - filter;
GET / api / learning / module4 - task1 / jobs / aggregation;
```

Consider adding:

- Alert if deletedCount > 1000 (unusual spike)
- Alert if job fails 3 times in a row
- Weekly report: total plans, master plans, storage saved
