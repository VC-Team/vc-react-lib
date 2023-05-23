import {
  CSSProperties,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useClickOutSide } from "./useClickOutSide";
import { isPortal } from "react-is";
import { supportRef, composeRefs } from "./refs";
import { TooltipProps } from "./types";

export const Tooltip = ({
  children,
  placement,
  trigger,
  title,
  color,
  defaultOpen = false,
  zIndex,
  onOpenChange,
}: TooltipProps) => {
  const popoverContainerRef = useRef(document.createElement("div"));
  const contentElementRef = useRef<HTMLElement | null>(null);
  const popoverElementRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState({
    open: defaultOpen,
  });

  if (!document.body.contains(popoverContainerRef.current)) {
    document.body.append(popoverContainerRef.current);
  }

  const displayPopover = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      open: true,
    }));
  }, [placement]);

  const hidePopover = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      open: false,
    }));
  }, []);

  useEffect(
    function triggerContentEvent() {
      const node = contentElementRef.current;
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

        cleanups.push(() => {
          node.removeEventListener("click", displayPopover);
        });
      }

      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    },
    [...trigger, displayPopover, hidePopover]
  );

  useClickOutSide(
    popoverElementRef,
    function hidePopoverOnClickOutSide() {
      const popoverIsOpen = popoverElementRef.current?.style.display !== "none";
      if (popoverIsOpen) {
        hidePopover();
      }
    },
    {
      capture: true,
      condition: trigger.includes("click"),
    }
  );

  useLayoutEffect(
    function updatePositionPopoverOnOpenChange() {
      if (state.open) {
        const node = contentElementRef.current;
        const popoverElement = popoverElementRef.current;
        if (!node || !popoverElement) return;
        const rect = node.getBoundingClientRect();

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
            popoverElement.style.left = `${
              rect.x - popoverElement.clientWidth
            }px`;
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
      }
    },
    [state.open]
  );

  useEffect(
    function callbackOnOpenChange() {
      if (onOpenChange) {
        onOpenChange(state.open);
      }
    },
    [state.open, onOpenChange]
  );

  const childrenIsValidElement = isValidElement(children);
  const canUseRef = supportRef(children);
  let newChildren = children;

  if (childrenIsValidElement && canUseRef && !isPortal(children)) {
    // TODO improve type
    newChildren = cloneElement(children, {
      ...(children as any).props,
      ref: composeRefs((children as any).ref, contentElementRef),
    });
  }

  const popoverStyle: CSSProperties = {
    position: "absolute",
    display: state.open ? "block" : "none",
    backgroundColor: color,
    zIndex,
  };

  return (
    <>
      {newChildren}
      {createPortal(
        <div
          className="vc-tooltip"
          ref={popoverElementRef}
          style={popoverStyle}
        >
          {typeof title === "function" ? title() : title}
        </div>,
        popoverContainerRef.current
      )}
    </>
  );
};
