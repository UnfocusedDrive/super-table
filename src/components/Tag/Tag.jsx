import React from "react";
import './Tag.less';

export default function Tag(props) {
  const { display, children, ...restProps } = props;
  return (
    <span
      className="tag"
      {...restProps}
    >
      {children}
    </span>
  );
}
