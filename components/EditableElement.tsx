import React, { useEffect, useRef } from "react";

export const EditableElement = (props: {
  onChange: (value: string) => void;
  contentEditable: boolean;
  children: any;
}) => {
  const { onChange, contentEditable = true } = props;
  const element = useRef<any>();
  let elements = React.Children.toArray(props.children) as any;
  if (elements.length > 1) {
    throw Error("Can't have more than one child");
  }
  const onMouseUp = () => {
    const value = element.current?.value || element.current?.innerText;
    console.log(value);
    onChange(value);
  };
  useEffect(() => {
    const value = element.current?.value || element.current?.innerText;
    onChange(value);
  }, []);
  elements = React.cloneElement(elements[0], {
    contentEditable: contentEditable,
    suppressContentEditableWarning: true,
    ref: element,
    onBlur: onMouseUp,
  });
  return elements;
};
