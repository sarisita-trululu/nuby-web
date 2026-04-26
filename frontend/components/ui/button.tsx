import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
};

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

const variants = {
  primary:
    "bg-forest text-white shadow-soft hover:bg-pine focus-visible:outline-forest",
  secondary:
    "border border-black/10 bg-white text-[#1f3d2b] shadow-[0_14px_32px_rgba(14,26,22,0.12)] hover:border-black/12 hover:bg-white hover:shadow-[0_18px_38px_rgba(14,26,22,0.16)] focus-visible:outline-forest",
  ghost:
    "bg-transparent text-forest hover:bg-forest/5 focus-visible:outline-forest",
};

const sharedStyles =
  "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold tracking-[0.02em] transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export function Button(props: ButtonProps | LinkProps) {
  const { children, className, variant = "primary" } = props;

  if ("href" in props && props.href) {
    const { href, children: _children, className: _className, variant: _variant, ...linkProps } =
      props as LinkProps;
    return (
      <Link
        className={cn(sharedStyles, variants[variant], className)}
        href={href}
        {...linkProps}
      >
        {children}
      </Link>
    );
  }

  const {
    children: _children,
    className: _className,
    variant: _variant,
    ...buttonProps
  } = props as ButtonProps;
  return (
    <button
      className={cn(sharedStyles, variants[variant], className)}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
