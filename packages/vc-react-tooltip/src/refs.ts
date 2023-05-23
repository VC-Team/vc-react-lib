import { Ref } from "react";
import { isMemo } from "react-is";

export const supportRef = (nodeOrComponent: any): boolean => {
  const type = isMemo(nodeOrComponent)
    ? nodeOrComponent.type.type
    : nodeOrComponent.type;

  if (typeof type === "function" && !type.prototype?.render) {
    return false;
  }

  if (
    typeof nodeOrComponent === "function" &&
    !nodeOrComponent.prototype?.render
  ) {
    return false;
  }

  return true;
};

export const composeRefs = <T>(...refs: Ref<T>[]) => {
  return (node: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else {
        if (ref) {
          Object.assign(ref, {
            current: node,
          });
        }
      }
    });
  };
};
