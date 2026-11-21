import * as React from 'react';
import { cn } from '../../lib/utils.js';

const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        'box-border flex min-h-[140px] w-full resize-y rounded-none border border-[var(--input)] bg-[var(--background)] px-[16px] py-[14px] font-serif text-[20px] leading-[1.5] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] aria-[invalid=true]:border-[var(--destructive)] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});

export { Textarea };
