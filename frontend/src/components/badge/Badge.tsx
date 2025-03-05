import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "cva";
import { cn } from "../../helpers/classNames";

export type BadgeColor =
  | "indigo"
  | "slate"
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "orange";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      color = "indigo",
      size = "md",
      variant = "primary",
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          badgeStyles({ variant, size }),
          color && getColorStyles(color, variant),
          className,
        )}
        {...props}
      />
    );
  },
);

export const badgeStyles = cva({
  base: "rounded-full h-fit whitespace-nowrap",
  variants: {
    variant: {
      primary: "text-slate-50 dark:text-slate-950",
      secondary: "text-black",
      tertiary: "text-slate-700",
    },
    size: {
      xs: "px-2 py-0.5 text-xs",
      sm: "px-3 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
      lg: "px-4 py-2 text-base",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

const colorsToOverrideText: BadgeColor[] = ["yellow"] as const;

const getColorStyles = (
  color: BadgeColor,
  variant: VariantProps<typeof badgeStyles>["variant"],
) => {
  const overriddenTextColor = colorsToOverrideText.includes(color)
    ? "text-slate-200"
    : "";

  switch (variant) {
    case "primary":
      return `bg-${color}-500 dark:bg-${color}-700 ${overriddenTextColor}`;
    case "secondary":
      return `text-${color}-300 dark:text-${color}-400 bg-${color}-900 dark:bg-${color}-900/50 border border-${color}-300 dark:border-${color}-700`;
    default:
      throw new Error("Invalid variant");
  }
};