import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DiffViewProps {
  diff: string;
  maxLines?: number;
}

export function DiffView({ diff, maxLines = 50 }: DiffViewProps) {
  const [expanded, setExpanded] = useState(false);

  const lines = diff.split('\n');
  const displayLines = expanded ? lines : lines.slice(0, maxLines);
  const hasMore = lines.length > maxLines;

  return (
    <div className="space-y-2">
      <div className="bg-muted rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <pre className="p-4 text-sm font-mono">
            {displayLines.map((line, index) => {
              const isAdded = line.startsWith('+');
              const isRemoved = line.startsWith('-');

              return (
                <div
                  key={index}
                  className={cn(
                    'px-2 -mx-2',
                    isAdded && 'diff-added',
                    isRemoved && 'diff-removed',
                    !isAdded && !isRemoved && 'diff-unchanged'
                  )}
                >
                  <span className="select-none opacity-50 mr-4 inline-block w-8 text-right">
                    {index + 1}
                  </span>
                  {line || ' '}
                </div>
              );
            })}
          </pre>
        </div>
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show {lines.length - maxLines} more lines
            </>
          )}
        </Button>
      )}

      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-200 dark:bg-green-900" />
          <span>Added</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-200 dark:bg-red-900" />
          <span>Removed</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-muted" />
          <span>Unchanged</span>
        </div>
      </div>
    </div>
  );
}
