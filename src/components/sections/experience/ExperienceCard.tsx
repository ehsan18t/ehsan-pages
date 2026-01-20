import type { Experience } from "@/data";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useRef } from "react";
import { createPortal } from "react-dom";

interface ExperienceCardProps {
  experience: Experience;
  position: { x: number; y: number };
  laneColor: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  position,
  laneColor,
  onMouseEnter,
  onMouseLeave,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useGSAP(
    () => {
      if (!cardRef.current) return;

      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          scale: 0.9,
          y: 20,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        },
      );

      // Animate the diff items
      const diffItems = cardRef.current.querySelectorAll(".diff-line");
      gsap.fromTo(
        diffItems,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.08,
          delay: 0.15,
          ease: "power2.out",
        },
      );

      // Animate tech pills
      const techPills = cardRef.current.querySelectorAll(".card-tech-pill");
      gsap.fromTo(
        techPills,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.2,
          stagger: 0.04,
          delay: 0.2,
          ease: "back.out(1.7)",
        },
      );

      // Animate description items
      const descItems = cardRef.current.querySelectorAll(
        ".card-description-item",
      );
      gsap.fromTo(
        descItems,
        { opacity: 0, x: -10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.25,
          stagger: 0.06,
          delay: 0.1,
          ease: "power2.out",
        },
      );
    },
    { scope: cardRef, dependencies: [experience.id] },
  );

  // Use portal to render card at body level to avoid overflow clipping
  return createPortal(
    <div
      ref={cardRef}
      className="experience-card"
      style={
        {
          "--card-accent": laneColor,
          position: "fixed",
          left: position.x,
          top: position.y,
          pointerEvents: "auto",
          zIndex: 9999,
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
        } as React.CSSProperties
      }
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="tooltip"
      aria-labelledby="card-title"
    >
      {/* Card Header */}
      <div className="card-header">
        <div className="card-header-content">
          <div className="card-date-badge">
            {experience.startDate} — {experience.endDate}
          </div>
          <h3 id="card-title" className="card-title">
            {experience.role}
          </h3>
          {experience.companyUrl ? (
            <a
              href={experience.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-company"
            >
              {experience.company}
              <svg
                className="external-icon"
                viewBox="0 0 24 24"
                width="14"
                height="14"
              >
                <path
                  fill="currentColor"
                  d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7zm-2 16H5V7h7V5H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-7h-2v7H7z"
                />
              </svg>
            </a>
          ) : (
            <span className="card-company">{experience.company}</span>
          )}
        </div>
      </div>

      {/* Description - Rendered as list */}
      <ul className="card-description-list">
        {experience.description.map((item, index) => (
          <li key={index} className="card-description-item">
            {item}
          </li>
        ))}
      </ul>

      {/* Tech Stack */}
      <div className="card-tech-stack">
        {experience.techStack.map((tech) => (
          <span key={tech} className="card-tech-pill">
            {tech}
          </span>
        ))}
      </div>

      {/* Impact Metrics (Git Diff Style) */}
      <div className="card-diff">
        <div className="diff-header">
          <span className="diff-title">Impact</span>
          <span className="diff-file">metrics.md</span>
        </div>
        <div className="diff-content">
          {experience.impact.map((item, index) => (
            <div key={item.label} className={`diff-line ${item.type}`}>
              <span className="diff-line-number">{index + 1}</span>
              <span className="diff-symbol">
                {item.type === "addition"
                  ? "+"
                  : item.type === "deletion"
                    ? "-"
                    : "~"}
              </span>
              <span className="diff-label">{item.label}:</span>
              <span className="diff-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lane indicator */}
      <div className="card-lane-indicator">
        <span className="lane-dot" style={{ backgroundColor: laneColor }} />
        <span className="lane-text">{experience.lane}</span>
      </div>
    </div>,
    document.body,
  );
};

export default ExperienceCard;
