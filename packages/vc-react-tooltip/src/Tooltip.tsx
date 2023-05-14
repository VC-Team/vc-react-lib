import {
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { FindDomNode } from "./FindDomNode";

type TooltipPlacement = "top" | "left" | "right" | "bottom";

type TooltipTrigger = ("hover" | "focus" | "click")[];

type TooltipTitle = ReactNode | (() => ReactNode);

export type TooltipProps = PropsWithChildren<{
  placement: TooltipPlacement;
  trigger: TooltipTrigger;
  title: TooltipTitle;
}>;

export const Tooltip = ({
  children,
  placement,
  trigger,
  title,
}: TooltipProps) => {
  const popoverContainerRef = useRef(document.createElement("div"));
  const contentInnerRef = useRef<{
    getDomNode: () => HTMLElement;
  } | null>(null);

  const popoverElementRef = useRef<HTMLDivElement | null>(null);

  if (!document.body.contains(popoverContainerRef.current)) {
    document.body.append(popoverContainerRef.current);
  }

  const displayPopover = useCallback(() => {
    const node = contentInnerRef.current?.getDomNode();
    const popoverElement = popoverElementRef.current;
    if (!node || !popoverElement) return;
    const rect = node.getBoundingClientRect();

    const isDisplay = popoverElement.style.display === "block";
    if (isDisplay) return;

    popoverElement.style.display = "block";

    switch (placement) {
      case "top":
        popoverElement.style.left = `${
          rect.x + rect.width / 2 - popoverElement.clientWidth / 2
        }px`;
        popoverElement.style.top = `${rect.y - rect.height}px`;
        break;
      case "bottom":
        popoverElement.style.left = `${
          rect.x + rect.width / 2 - popoverElement.clientWidth / 2
        }px`;
        popoverElement.style.top = `${rect.y + rect.height}px`;
        break;
      case "left":
        popoverElement.style.left = `${rect.x - popoverElement.clientWidth}px`;
        popoverElement.style.top = `${
          rect.y + rect.height / 2 - popoverElement.clientHeight / 2
        }px`;
        break;
      case "right":
        popoverElement.style.left = `${rect.x + rect.width}px`;
        popoverElement.style.top = `${
          rect.y + rect.height / 2 - popoverElement.clientHeight / 2
        }px`;
        break;
      default:
        break;
    }
  }, [placement]);

  const hidePopover = useCallback(() => {
    const node = contentInnerRef.current?.getDomNode();
    const popoverElement = popoverElementRef.current;
    if (!node || !popoverElement) return;

    popoverElement.style.display = "none";
  }, []);

  useEffect(
    function triggerContentEvent() {
      const node = contentInnerRef.current?.getDomNode();
      if (!node) return;

      const cleanups: (() => void)[] = [];

      if (trigger.includes("hover")) {
        node.addEventListener("mouseenter", displayPopover);

        node.addEventListener("mouseleave", hidePopover);

        cleanups.push(() => {
          node.removeEventListener("mouseenter", displayPopover);
          node.removeEventListener("mouseleave", hidePopover);
        });
      }

      if (trigger.includes("click")) {
        node.addEventListener("click", displayPopover);

        // Click outside to hide popover

        cleanups.push(() => {
          node.removeEventListener("click", displayPopover);

          // Remove click outside event
        });
      }

      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    },
    [...trigger, displayPopover, hidePopover]
  );

  return (
    <>
      <FindDomNode innerRef={contentInnerRef}>{children}</FindDomNode>
      {createPortal(
        <div
          className="vc-tooltip"
          ref={popoverElementRef}
          style={{ position: "absolute", display: "none" }}
        >
          {typeof title === "function" ? title() : title}
        </div>,
        popoverContainerRef.current
      )}
    </>
  );
};
