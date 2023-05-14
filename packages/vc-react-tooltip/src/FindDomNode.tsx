import {
  PropsWithChildren,
  MutableRefObject,
  Component,
  ReactNode,
} from "react";
import { findDOMNode } from "react-dom";

type FindDomNodeProps = PropsWithChildren<{
  innerRef: MutableRefObject<{
    getDomNode: () => HTMLElement;
  } | null>;
}>;

export class FindDomNode extends Component<FindDomNodeProps> {
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
