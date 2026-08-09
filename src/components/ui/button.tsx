'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * shadcn/ui Button, retuned for the studio palette:
 * pill geometry, generous padding, expo easing.
 */
const buttonVariants = cva(
  'group/btn relative inline-flex items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full text-sm font-medium tracking-tight transition-all duration-500 ease-out-expo disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:shadow-[0_10px_40px_-12px_rgba(255,255,255,0.45)]',
        outline:
          'border border-border bg-transparent text-foreground hover:border-[rgba(255,255,255,0.24)] hover:bg-hover',
        ghost: 'bg-transparent text-muted-foreground hover:bg-hover hover:text-foreground',
        secondary: 'bg-card text-foreground border border-border hover:bg-elevated',
        link: 'h-auto rounded-none p-0 text-foreground underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-10 px-5 text-[0.8125rem]',
        default: 'h-12 px-7',
        lg: 'h-14 px-9 text-[0.9375rem]',
        xl: 'h-16 px-11 text-base',
        icon: 'size-12 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
