import React, { useEffect, useState } from "react";
import "./Header.less";

const intervalSpeed = 150;

export default function Header() {
  const title = "Whimsyshire";

  // https://planetcalc.com/5799/
  const [colors, setColors] = useState([
    "#ff0000",
    "#ff8000",
    "#ffff00",
    "#80ff00",
    "#00ff00",
    "#00ff80",
    "#00ffff",
    "#0080ff",
    "#0000ff",
    "#8000ff",
    "#ff00ff"
  ]);

  // rOTATE cOLORS
  useEffect(() => {
    const interval = setInterval(() => {
      const newColors = [...colors];
      newColors.unshift(newColors.pop());
      setColors(newColors);
    }, intervalSpeed);
    return () => clearInterval(interval);
  }, [colors]);

  return (
    <div className="header">
      <span>
        {title.split("").map((character, i) => (
          <span
            key={i}
            style={{
              color: colors[i],
              transition: `all ${intervalSpeed}ms ease`
            }}
          >
            {character}
          </span>
        ))}{" "}
      </span>
      <span className="spacer">UI</span>
    </div>
  );
}
