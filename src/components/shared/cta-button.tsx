'use client';

import type { ComponentProps, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

import { Magnetic } from '@/components/shared/magnetic';
import { SmartLink } from '@/components/shared/smart-link';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CtaButtonProps extends Pick<ButtonProps, 'variant' | 'size' | 'className'> {
  href?: string;
  label: string;
  icon?: ReactNode;
  /** Magnetic pull. Set to 0 to disable. */
  strength?: number;
  onClick?: ComponentProps<'button'>['onClick'];
  type?: 'button' | 'submit';
  disabled?: boolean;
  external?: boolean;
}

/**
 * The site's primary call to action.
 *
 * Three effects stacked: a magnetic field on the wrapper, a label that
 * rolls over on hover, and an arrow that travels diagonally. All of it
 * is pure CSS transition apart from the magnet, so it stays cheap.
 */
export function CtaButton({
  href,
  label,
  icon,
  variant = 'default',
  size = 'lg',
  className,
  strength = 0.35,
  onClick,
  type = 'button',
  disabled,
  external = false,
}: CtaButtonProps) {
  const content = (
    <>
      {/* Rolling label: two copies, one above the mask, one below. */}
      <span className="relative block overflow-hidden py-0.5">
        <span className="block transition-transform duration-600 ease-out-expo group-hover/btn:-translate-y-[130%]">
          {label}
        </span>
        <span className="absolute inset-0 block translate-y-[130%] transition-transform duration-600 ease-out-expo group-hover/btn:translate-y-0">
          {label}
        </span>
      </span>

      <span className="relative grid size-4 place-items-center overflow-hidden">
        <span className="col-start-1 row-start-1 transition-transform duration-600 ease-out-expo group-hover/btn:-translate-y-full group-hover/btn:translate-x-full">
          {icon ?? <ArrowUpRight className="size-4" aria-hidden="true" />}
        </span>
        <span className="col-start-1 row-start-1 -translate-x-full translate-y-full transition-transform duration-600 ease-out-expo group-hover/btn:translate-x-0 group-hover/btn:translate-y-0">
          {icon ?? <ArrowUpRight className="size-4" aria-hidden="true" />}
        </span>
      </span>
    </>
  );

  const button = href ? (
    <Button asChild variant={variant} size={size} className={cn('group/btn', className)}>
      {external ? (
        <a href={href} target="_blank" rel="noreferrer noopener">
          {content}
        </a>
      ) : (
        <SmartLink href={href}>{content}</SmartLink>
      )}
    </Button>
  ) : (
    <Button
      type={type}
      variant={variant}
      size={size}
      className={cn('group/btn', className)}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </Button>
  );

  if (strength === 0) return button;

  return <Magnetic strength={strength}>{button}</Magnetic>;
}
