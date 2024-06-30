"use client";

import { cn } from "@/utils/cn";
import { useRef } from "react";
import "./button.css";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  others?: any;
};

export default function Button({
  children,
  onClick,
  className,
  others,
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const createRipple = (event: any) => {
    const button = buttonRef.current;
    if (!button) return;

    const circle = document.createElement("span");
    circle.classList.add("ripple");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  };

  const handleClick = (event: any) => {
    createRipple(event);

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button
      ref={buttonRef}
      className={`${cn(
        "relative overflow-hidden transition-colors duration-300 text-foreground bg-primary px-4 py-2 rounded-md shadow-md cursor-pointer",
        className
      )}`}
      onClick={handleClick}
      {...others}
    >
      {children}
    </button>
  );
}
