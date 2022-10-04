import React from "react";

export default function Tag(props) {
  const { display, children, ...restProps } = props;
  return (
    <span
      className="tag"
      style={{
        display: "inline-block",
        fontSize: ".75rem",
        fontWeight: 500,
        lineHeight: "1rem",
        color: "rgb(69,229,208)",
        paddingLeft: "0.25rem",
        paddingRight: "0.25rem",
        paddingTop: 1,
        paddingBottom: 1,
        background: "rgba(69,229,208, 0.1)",
        borderRadius: "0.375rem"
      }}
      {...restProps}
    >
      {children}
    </span>
  );
}
