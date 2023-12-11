import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant: 'default' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'h-9 rounded-md px-3': size === 'sm',
            'h-10 px-4 py-2': size === 'md',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          {
            'bg-sky-300 text-neutral-800  hover:bg-sky-300/80 active:bg-sky-300/60':
              variant === 'default',
            'bg-neutral-100 border border-neutral-200 hover:bg-secondary/80':
              variant === 'secondary',
            'bg-rose-600 text-white hover:bg-rose-600/90 active:bg-rose-600/80':
              variant === 'destructive',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'text-sky-600 underline-offset-4 hover:underline':
              variant === 'link',
          },
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, type ButtonProps };
