import { type TextareaHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

export interface HTMLEditorProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export default function HTMLEditor({ className, ...props }: HTMLEditorProps) {
  return (
    <textarea
      {...props}
      className={cn(
        'border-input bg-background text-foreground focus-visible:ring-ring min-h-48 w-full rounded-md border px-3 py-2 font-mono text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        className,
      )}
    />
  );
}
