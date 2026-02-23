# Prompts Used for Development

Key prompts used with AI assistance during development. As an experienced developer, I used AI primarily for acceleration and specific implementation details rather than architectural decisions.

---

## Content Extraction

```
Write a Cheerio-based content extractor that strips nav, footer, scripts, and hidden elements, then normalizes whitespace. Should prioritize main/article tags when present.
```

---

## OpenAI Integration

```
Implement OpenAI chat completion with JSON response format for change summarization. Include: summary, array of important changes, severity enum (major/minor/cosmetic), and isImportant boolean. Handle API failures gracefully with fallback.
```

---

## Diff Visualization

```
React component for rendering unified diff with line-by-line highlighting. Support collapsible view for large diffs (50+ lines) with "show more" functionality.
```

---

## TypeORM Cascade Deletes

```
Configure TypeORM entity relationships where deleting a Competitor cascades to its Snapshots and Changes. Using PostgreSQL with uuid primary keys.
```

---

## Docker Health Checks

```
Add health check to docker-compose for a Node.js backend that waits for PostgreSQL to be ready before starting. Backend should expose /api/health endpoint.
```

---

## Tailwind Component Styling

```
Style a card component with hover border effect, status indicator badges (success/error/pending), and responsive grid layout for the competitor list.
```

---

## Notes

- Used AI to accelerate implementation of well-defined tasks
- Architecture, data modeling, and error handling strategies were self-designed
- All generated code was reviewed and modified as needed
