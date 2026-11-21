import * as React from 'react';
import { cn } from '../../lib/utils.js';

const Input = React.forwardRef(function Input({ className, type = 'text', ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        'box-border flex h-[56px] max-md:h-[52px] w-full rounded-none border border-[var(--input)] bg-[var(--background)] px-[16px] font-serif text-[20px] leading-[1.4] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] aria-[invalid=true]:border-[var(--destructive)] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});

export { Input };
