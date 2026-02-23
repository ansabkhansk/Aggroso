import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Change } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DiffView } from './DiffView';
import {
  AlertTriangle,
  TrendingUp,
  Minus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
} from 'lucide-react';

interface ChangesSummaryProps {
  change: Change;
  expanded?: boolean;
  showDiff?: boolean;
}

export function ChangesSummary({ change, expanded = false, showDiff = false }: ChangesSummaryProps) {
  const [showFullDiff, setShowFullDiff] = useState(showDiff);

  const getSeverityBadge = () => {
    switch (change.severity) {
      case 'major':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Major
          </Badge>
        );
      case 'minor':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Minor
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Minus className="h-3 w-3" />
            Cosmetic
          </Badge>
        );
    }
  };

  const diffStats = getDiffStats(change.diff);

  return (
    <Card className={change.isImportant ? 'border-primary' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            {change.competitor && (
              <Link
                to={`/competitor/${change.competitorId}`}
                className="text-sm font-medium hover:text-primary truncate block"
              >
                {change.competitor.name}
              </Link>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(change.detectedAt).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {change.isImportant && (
              <Badge variant="default" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Important
              </Badge>
            )}
            {getSeverityBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {change.aiSummary && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{change.aiSummary}</p>
          </div>
        )}

        {change.importantChanges && change.importantChanges.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Key Changes:</p>
            <ul className="text-sm space-y-1">
              {change.importantChanges.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex gap-3">
            <span className="text-green-600">+{diffStats.additions} additions</span>
            <span className="text-red-600">-{diffStats.deletions} deletions</span>
          </div>
          {expanded && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setShowFullDiff(!showFullDiff)}
            >
              {showFullDiff ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Hide Diff
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show Diff
                </>
              )}
            </Button>
          )}
        </div>

        {showFullDiff && change.diff && (
          <DiffView diff={change.diff} maxLines={30} />
        )}
      </CardContent>
    </Card>
  );
}

function getDiffStats(diff: string): { additions: number; deletions: number } {
  const lines = diff.split('\n');
  return {
    additions: lines.filter((l) => l.startsWith('+')).length,
    deletions: lines.filter((l) => l.startsWith('-')).length,
  };
}
