import { ReactNode, PropsWithChildren } from "react";

export type TooltipPlacement = "top" | "left" | "right" | "bottom";

export type TooltipTrigger = ("hover" | "focus" | "click")[];

export type TooltipTitle = ReactNode | (() => ReactNode);

export type TooltipProps = PropsWithChildren<{
  placement: TooltipPlacement;
  trigger: TooltipTrigger;
  title: TooltipTitle;
  color?: string;
  defaultOpen?: boolean;
  zIndex?: number;
  onOpenChange?: (open: boolean) => void;
}>;
