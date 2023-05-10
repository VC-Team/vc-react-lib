import {
  Component,
  MutableRefObject,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { createPortal, findDOMNode } from "react-dom";

export type TooltipProps = PropsWithChildren<{}>;

type FindDomNodeProps = PropsWithChildren<{
  innerRef: MutableRefObject<{
    getDomNode: () => HTMLElement;
  } | null>;
}>;

class FindDomNode extends Component<FindDomNodeProps> {
  constructor(props: PropsWithChildren<FindDomNodeProps>) {
    super(props);
  }

  componentDidMount(): void {
    const node = findDOMNode(this);
    if (node instanceof HTMLElement) {
      this.props.innerRef.current = {
        getDomNode() {
          return node;
        },
      };
    }
  }

  render(): ReactNode {
    return this.props.children;
  }
}

export const Tooltip = ({ children }: TooltipProps) => {
  const popoverContainerRef = useRef(document.createElement("div"));
  const contentInnerRef = useRef<{
    getDomNode: () => HTMLElement;
  } | null>(null);
  const popoverElementRef = useRef<HTMLDivElement | null>(null);

  if (!document.body.contains(popoverContainerRef.current)) {
    document.body.append(popoverContainerRef.current);
  }

  useEffect(() => {
    if (contentInnerRef.current) {
      const node = contentInnerRef.current.getDomNode();

      const contentOnMouseEnter = () => {
        const popoverElement = popoverElementRef.current;
        const rect = node.getBoundingClientRect();

        if (popoverElement) {
          popoverElement.style.display = "block";
          popoverElement.style.left = `${rect.x}px`;
          popoverElement.style.top = `${rect.y + rect.height}px`;
        }
      };

      const contentOnMouseLeave = () => {
        const popoverElement = popoverElementRef.current;
        if (popoverElement) {
          popoverElement.style.display = "none";
        }
      };

      node.addEventListener("mouseenter", contentOnMouseEnter);
      node.addEventListener("mouseleave", contentOnMouseLeave);

      return () => {
        node.removeEventListener("mouseenter", contentOnMouseEnter);
        node.removeEventListener("mouseleave", contentOnMouseLeave);
      };
    }
  }, []);

  return (
    <>
      <FindDomNode innerRef={contentInnerRef}>{children}</FindDomNode>
      {createPortal(
        <div
          ref={popoverElementRef}
          style={{ position: "absolute", display: "none" }}
        >
          Popover
        </div>,
        popoverContainerRef.current
      )}
    </>
  );
};
