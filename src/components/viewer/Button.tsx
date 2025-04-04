import { useRef, useState } from "react";
import "./button.css";

interface RippleButtonProps {
  className?: string;
  link?: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const RippleButton = ({
  className = "",
  link,
  children,
  onClick,
}: RippleButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<React.ReactElement[]>([]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const button = buttonRef.current;
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;

      const circleStyle = {
        width: `${diameter}px`,
        height: `${diameter}px`,
        left: `${event.clientX - button.offsetLeft - radius}px`,
        top: `${event.clientY - button.offsetTop - radius}px`,
      };

      const newRipple = (
        <span key={Date.now()} className="ripple" style={circleStyle} />
      );

      setRipples((prev) => [...prev.slice(-1), newRipple]);

      if (link) {
        window.open(link, "_blank")?.focus();
      }
    }

    onClick?.(event);
  };

  return (
    <button
      ref={buttonRef}
      className={`ripple-button ${className}`}
      onClick={handleClick}
    >
      {children || "Click Me"}
      {ripples}
    </button>
  );
};

export default RippleButton;
