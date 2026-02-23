# AI Notes

## Development Approach

Used AI as a productivity tool for boilerplate and repetitive code, while handling architecture decisions, complex logic, and system integration myself.

## What I Built Myself

- **System Design**: Chose PostgreSQL over MongoDB for relational history tracking; designed the Competitor → Snapshot → Change data model with proper foreign keys and cascades
- **Content Extraction Pipeline**: Cheerio-based scraper with intelligent content prioritization (main/article tags), noise removal, and text normalization
- **Change Detection Logic**: Hash-based change detection, diff generation with context preservation, and severity classification algorithm
- **LLM Integration Strategy**: Prompt engineering for structured JSON output, token management for large diffs, and graceful degradation when API is unavailable
- **Docker Orchestration**: Multi-stage builds, health check dependencies, volume persistence, and environment variable flow between services
- **Debugging & Troubleshooting**: Resolved database authentication issues, environment configuration mismatches, and frontend-backend integration

## What I Used AI For

- Accelerating React component markup and Tailwind styling
- Generating TypeORM entity boilerplate with decorators
- Scaffolding Express route handlers
- Writing TypeScript interfaces from my schema design

## LLM Choice: OpenAI GPT-4o-mini

Selected for this project because:
- **Cost**: ~$0.15/1M input tokens vs $30/1M for GPT-4 - significant for a tool that processes many diffs
- **Latency**: Sub-second responses keep the "Check Now" action feeling instant
- **JSON Mode**: `response_format: { type: 'json_object' }` guarantees parseable output without regex hacks
- **Quality**: Summarization and classification tasks don't need GPT-4's reasoning capabilities

The integration includes fallback handling - if OpenAI is down or unconfigured, the app still functions with basic statistical summaries.
