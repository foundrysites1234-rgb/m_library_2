import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';
import { cn } from '../../lib/utils.js';

const Label = React.forwardRef(function Label({ className, ...props }, ref) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      data-slot="label"
      className={cn(
        'lbl text-[var(--foreground)] select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
});

export { Label };
