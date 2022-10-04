import React from "react";
import "./Body.less";

export default function Body(props) {
  const { children } = props;
  return <div className="body">{children}</div>;
}
