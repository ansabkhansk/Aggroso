import * as Diff from 'diff';

export interface DiffResult {
  diff: string;
  additions: number;
  deletions: number;
  hasChanges: boolean;
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber?: number;
}

export class DifferService {
  static generateDiff(oldContent: string, newContent: string): DiffResult {
    const changes = Diff.diffLines(oldContent, newContent);
    
    let additions = 0;
    let deletions = 0;
    const diffParts: string[] = [];

    changes.forEach((part) => {
      const prefix = part.added ? '+' : part.removed ? '-' : ' ';
      const lines = part.value.split('\n').filter(line => line.length > 0);
      
      lines.forEach(line => {
        diffParts.push(`${prefix} ${line}`);
      });

      if (part.added) {
        additions += lines.length;
      } else if (part.removed) {
        deletions += lines.length;
      }
    });

    return {
      diff: diffParts.join('\n'),
      additions,
      deletions,
      hasChanges: additions > 0 || deletions > 0,
    };
  }

  static parseDiff(diffString: string): DiffLine[] {
    const lines = diffString.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('+')) {
        return {
          type: 'added',
          content: line.substring(2),
          lineNumber: index + 1,
        };
      } else if (line.startsWith('-')) {
        return {
          type: 'removed',
          content: line.substring(2),
          lineNumber: index + 1,
        };
      }
      return {
        type: 'unchanged',
        content: line.substring(2),
        lineNumber: index + 1,
      };
    });
  }

  static getSummaryStats(diffString: string): { added: number; removed: number; total: number } {
    const lines = this.parseDiff(diffString);
    const added = lines.filter(l => l.type === 'added').length;
    const removed = lines.filter(l => l.type === 'removed').length;
    return { added, removed, total: added + removed };
  }

  static getSignificantChanges(diffString: string): string[] {
    const lines = this.parseDiff(diffString);
    const changes: string[] = [];

    const pricePatterns = [/\$[\d,]+(?:\.\d{2})?/, /\d+(?:\.\d{2})?\s*(?:USD|EUR|GBP)/i, /price/i, /cost/i, /fee/i];
    const featurePatterns = [/new feature/i, /deprecated/i, /removed/i, /added/i, /introducing/i, /launch/i];
    
    lines.forEach(line => {
      if (line.type === 'unchanged') return;
      
      const matchesPrice = pricePatterns.some(p => p.test(line.content));
      const matchesFeature = featurePatterns.some(p => p.test(line.content));
      
      if (matchesPrice || matchesFeature) {
        const prefix = line.type === 'added' ? '[ADDED]' : '[REMOVED]';
        changes.push(`${prefix} ${line.content.trim()}`);
      }
    });

    return changes.slice(0, 10);
  }
}
