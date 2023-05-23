import { useEffect, useRef } from "react";

type Event =
  | HTMLElementEventMap["mousedown"]
  | HTMLElementEventMap["touchstart"];

type Handler = (event: Event) => unknown;

type Options = {
  capture?: boolean;
  condition?: boolean;
};

const events = ["mousedown", "touchstart"] as const;

export const useClickOutSide = (
  elementRef: React.RefObject<HTMLElement>,
  handler: Handler,
  options: Options = {
    condition: true,
  }
) => {
  const handlerRef = useRef<Handler>(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const cond = options.condition;

    if (cond) {
      const listener = (event: Event) => {
        const handler = handlerRef.current;
        const element = elementRef.current;

        const { target } = event;

        if (target instanceof Node && !element?.contains(target)) {
          handler(event);
        }
      };

      events.forEach((event) => {
        document.addEventListener(event, listener, options?.capture);
      });

      return () => {
        events.forEach((event) => {
          document.removeEventListener(event, listener, options?.capture);
        });
      };
    }
  }, [options?.capture, options?.condition]);
};
