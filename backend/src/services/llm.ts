import OpenAI from 'openai';
import { ChangeSeverity } from '../entities';

export interface LLMSummaryResult {
  summary: string;
  importantChanges: string[];
  severity: ChangeSeverity;
  isImportant: boolean;
}

export class LLMService {
  private static client: OpenAI | null = null;

  private static getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
      }
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
  }

  static async checkConnection(): Promise<boolean> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
        return false;
      }
      const client = this.getClient();
      await client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  static async summarizeChanges(
    competitorName: string,
    pageType: string,
    diff: string
  ): Promise<LLMSummaryResult> {
    const client = this.getClient();

    const truncatedDiff = diff.length > 8000 ? diff.substring(0, 8000) + '\n... (truncated)' : diff;

    const prompt = `You are analyzing changes detected on a competitor's ${pageType} page.
Competitor: ${competitorName}

Here is the diff of changes (lines starting with + are additions, - are removals):

${truncatedDiff}

Please provide:
1. A concise summary (2-3 sentences) of the key changes
2. A list of the most important changes (max 5) with brief explanations
3. Severity assessment: "major" (significant pricing/feature changes), "minor" (small updates), or "cosmetic" (formatting only)
4. Whether these changes are business-important (true/false)

Respond in JSON format:
{
  "summary": "...",
  "importantChanges": ["change 1", "change 2"],
  "severity": "major|minor|cosmetic",
  "isImportant": true|false
}`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a competitive intelligence analyst. Analyze website changes and provide actionable insights. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from LLM');
      }

      const result = JSON.parse(content);
      
      return {
        summary: result.summary || 'Unable to generate summary',
        importantChanges: result.importantChanges || [],
        severity: (['major', 'minor', 'cosmetic'].includes(result.severity) ? result.severity : 'minor') as ChangeSeverity,
        isImportant: result.isImportant === true,
      };
    } catch (error) {
      console.error('LLM summarization error:', error);
      return {
        summary: 'Unable to generate AI summary. Changes detected but analysis failed.',
        importantChanges: [],
        severity: 'minor',
        isImportant: false,
      };
    }
  }

  static generateFallbackSummary(diff: string): LLMSummaryResult {
    const lines = diff.split('\n');
    const additions = lines.filter(l => l.startsWith('+')).length;
    const deletions = lines.filter(l => l.startsWith('-')).length;

    const pricePattern = /\$[\d,]+|\d+(?:\.\d{2})?\s*(?:USD|EUR)/gi;
    const hasPriceChanges = pricePattern.test(diff);

    return {
      summary: `Detected ${additions} additions and ${deletions} deletions.${hasPriceChanges ? ' Price-related content may have changed.' : ''}`,
      importantChanges: hasPriceChanges ? ['Potential pricing changes detected'] : [],
      severity: hasPriceChanges ? 'major' : additions + deletions > 50 ? 'minor' : 'cosmetic',
      isImportant: hasPriceChanges,
    };
  }
}
