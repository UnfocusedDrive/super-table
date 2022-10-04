import React from "react";
import "./Layout.less";

export default function Layout(props) {
  const { display, children, containerRef, ...restProps } = props;
  return (
    <div
      data-display={display}
      ref={containerRef}
      className="layout"
      {...restProps}
    >
      {children}
    </div>
  );
}
