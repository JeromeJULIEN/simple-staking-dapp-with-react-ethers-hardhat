import React, { useState } from "react";
import "./LoadingIndicator.css";

interface Props {
  size?: number;
  color?: string;
}

const LoadingIndicator: React.FC<Props> = ({ size = 64, color = "#fff" }) => {
  const [rotation, setRotation] = useState(0);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setRotation((rotation) => rotation + 10);
    }, 100);
    return () => clearInterval(intervalId);
  }, []);

  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderTopColor: color,
    borderRightColor: color,
    borderBottomColor: color,
    borderLeftColor: color,
    transform: `rotate(${rotation}deg)`,
  };

  return (
    <div className="LoadingIndicator" style={style}>
      <div className="LoadingIndicator__spinner"></div>
    </div>
  );
};

export default LoadingIndicator;
