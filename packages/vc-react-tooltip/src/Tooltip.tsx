/** @jsx jsx */
/** @jsxFrag  */
/** @jsxImportSource @emotion/react */

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useClickOutSide } from "./useClickOutSide";
import { isPortal } from "react-is";
import { supportRef, composeRefs } from "./refs";
import { TooltipPositionStyle, TooltipProps } from "./types";
import { css } from "@emotion/react";

export const Tooltip = ({
  children,
  placement,
  trigger,
  title,
  color = "#000000",
  defaultOpen = false,
  zIndex,
  onOpenChange,
}: TooltipProps) => {
  const popoverContainerRef = useRef(document.createElement("div"));
  const contentElementRef = useRef<HTMLElement | null>(null);
  const popoverElementRef = useRef<HTMLDivElement | null>(null);
  const arrowElementRef = useRef<HTMLDivElement | null>(null);

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
        const arrowElement = arrowElementRef.current;

        if (!node || !popoverElement) return;
        const rect = node.getBoundingClientRect();

        const positionStyle: TooltipPositionStyle = {};

        switch (placement) {
          case "top":
            positionStyle.left =
              rect.x + rect.width / 2 - popoverElement.clientWidth / 2;
            positionStyle.top =
              rect.y - rect.height - (arrowElement?.clientHeight || 0) / 2;
            break;
          case "bottom":
            positionStyle.left =
              rect.x + rect.width / 2 - popoverElement.clientWidth / 2;
            positionStyle.top =
              rect.y + rect.height + (arrowElement?.clientHeight || 0) / 2;
            break;
          case "left":
            positionStyle.left =
              rect.x -
              popoverElement.clientWidth -
              (arrowElement?.clientWidth || 0) / 2;

            positionStyle.top =
              rect.y + rect.height / 2 - popoverElement.clientHeight / 2;
            break;
          case "right":
            positionStyle.left =
              rect.x + rect.width + (arrowElement?.clientWidth || 0) / 2;
            positionStyle.top =
              rect.y + rect.height / 2 - popoverElement.clientHeight / 2;
            break;
          default:
            break;
        }

        // TODO need improve

        Object.assign(popoverElement.style, {
          top: positionStyle.top
            ? `${positionStyle.top}px`
            : popoverElement.style.top,
          left: positionStyle.left
            ? `${positionStyle.left}px`
            : popoverElement.style.left,
          right: positionStyle.right
            ? `${positionStyle.right}px`
            : popoverElement.style.right,
          bottom: positionStyle.bottom
            ? `${positionStyle.bottom}px`
            : popoverElement.style.bottom,
        });
      }
    },
    [state.open, placement]
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

  const rootCSS = css({
    position: "absolute",
    display: state.open ? "block" : "none",
    backgroundColor: color,
    zIndex,
  });

  const arrowCSS = useMemo(() => {
    switch (placement) {
      case "top":
        break;

      default:
        break;
    }
    return css({
      position: "absolute",
      left: "50%",
      top: 0,
      transform: "translate(-50%, -50%) rotate(-135deg)",
      width: 9,
      height: 9,
      backgroundColor: color,
      ":after": {
        content: '""',
        width: 9,
        height: 9,
        inset: 0,
        margin: 0,
      },
    });
  }, [placement]);

  const popoverContentCSS = css({
    padding: 8,
  });

  const innerContentCSS = css({
    color: "#ffffff",
  });

  return (
    <>
      {newChildren}
      {createPortal(
        <div ref={popoverElementRef} css={rootCSS}>
          <div ref={arrowElementRef} css={arrowCSS} />
          <div css={popoverContentCSS}>
            <div css={innerContentCSS}>
              {typeof title === "function" ? title() : title}
            </div>
          </div>
        </div>,
        popoverContainerRef.current
      )}
    </>
  );
};
