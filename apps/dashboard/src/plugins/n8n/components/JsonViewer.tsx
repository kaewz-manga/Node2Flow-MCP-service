import { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { Button } from '@node2flow/dashboard-core';


function JsonNode({ name, value, depth = 0 }: { name?: string; value: any; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (value === null) return <span className="text-muted-foreground">null</span>;
  if (typeof value === 'boolean') return <span className="text-purple-400">{String(value)}</span>;
  if (typeof value === 'number') return <span className="text-blue-400">{value}</span>;
  if (typeof value === 'string') return <span className="text-green-400">"{value.length > 200 ? value.slice(0, 200) + '...' : value}"</span>;

  const isArray = Array.isArray(value);
  const entries = isArray ? value.map((v, i) => [String(i), v]) : Object.entries(value);
  const bracket = isArray ? ['[', ']'] : ['{', '}'];

  return (
    <div>
      <span
        className="cursor-pointer hover:bg-muted rounded inline-flex items-center gap-0.5"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        {name && <span className="text-foreground font-medium">{name}: </span>}
        {!expanded && <span className="text-muted-foreground">{bracket[0]} {entries.length} items {bracket[1]}</span>}
        {expanded && <span className="text-muted-foreground">{bracket[0]}</span>}
      </span>
      {expanded && (
        <div className="ml-4 border-l border-border pl-2">
          {entries.map(([key, val]) => (
            <div key={key} className="py-0.5">
              {typeof val === 'object' && val !== null ? (
                <JsonNode name={key} value={val} depth={depth + 1} />
              ) : (
                <span>
                  <span className="text-foreground font-medium">{key}: </span>
                  <JsonNode value={val} depth={depth + 1} />
                </span>
              )}
            </div>
          ))}
          <span className="text-muted-foreground">{bracket[1]}</span>
        </div>
      )}
    </div>
  );
}

export default function JsonViewer({ data, title }: { data: any; title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-muted border border-border rounded-lg overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-3 py-2 bg-card border-b border-border">
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy} title="Copy JSON">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      )}
      <div className="p-3 font-mono text-xs overflow-auto max-h-96">
        <JsonNode value={data} />
      </div>
    </div>
  );
}
