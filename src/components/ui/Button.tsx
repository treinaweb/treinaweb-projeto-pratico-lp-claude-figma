import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type CommonProps = {
  variant?: "primary";
  children: ReactNode;
  className?: string;
};

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonProps = ButtonAsLink | ButtonAsButton;

const VARIANT_CLASSES = {
  primary: "bg-black text-white",
} as const;

// Radius lives here rather than in the shared base string: without
// tailwind-merge, two radius classes would just concatenate and resolve by
// stylesheet order instead of by intent.
const SIZE_CLASSES = {
  default: "h-[60px] w-[180px] rounded text-[18px] leading-[28px]",
  sm: "h-10 w-auto rounded-full px-5 text-[15px] leading-[22px]",
} as const;

type Size = keyof typeof SIZE_CLASSES;

export default function Button({
  variant = "primary",
  size = "default",
  children,
  className = "",
  href,
  ...rest
}: ButtonProps & { size?: Size }) {
  const classes = [
    "inline-flex items-center justify-center gap-2 font-display font-medium capitalize transition-colors hover:bg-black/80",
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
