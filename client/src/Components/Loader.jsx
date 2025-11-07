// Loader.jsx
import React from "react";

const Loader = ({ color = "black", size = 32 }) => {
  return (
    <div
      className="animate-spin rounded-full border-2 border-t-transparent"
      style={{
        width: size,
        height: size,
        borderColor: `${color}`,
        borderTopColor: "transparent",
      }}
    ></div>
  );
};

export default Loader;
